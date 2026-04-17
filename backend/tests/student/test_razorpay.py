"""Tests for the Razorpay integration.

Three layers:
  1. Signature verification (pure crypto, no DB)
  2. create-order / verify endpoints (DB + mocked SDK)
  3. Webhook endpoint (signed payload handling)
"""
import hmac
import hashlib
import json
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.shared.services import razorpay_client
from apps.student.models import Payment, StudentProfile, TuitionAccount


def _make_signature(secret: str, body: str) -> str:
    return hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()


def _student_with_balance(outstanding=Decimal('5000.00')):
    user = User.objects.create_user(
        username='payer', email='payer@test.com', password='pass',
        role='student', first_name='Ravi', last_name='Kumar',
    )
    student = StudentProfile.objects.create(user=user, student_id='SM-2024-P01')
    account = TuitionAccount.objects.create(
        student=student,
        total_amount=outstanding,
        paid_amount=Decimal('0.00'),
    )
    return user, student, account


# ─── Layer 1: signature verification ────────────────────────────────────────

@override_settings(RAZORPAY_KEY_SECRET='test_secret_value')
class SignatureVerificationTest(TestCase):
    def test_valid_payment_signature_verifies(self):
        order_id = 'order_ABC'
        payment_id = 'pay_XYZ'
        sig = _make_signature('test_secret_value', f'{order_id}|{payment_id}')
        self.assertTrue(razorpay_client.verify_payment_signature(order_id, payment_id, sig))

    def test_invalid_payment_signature_rejected(self):
        self.assertFalse(
            razorpay_client.verify_payment_signature('order_A', 'pay_B', 'garbage'),
        )

    def test_empty_inputs_rejected(self):
        self.assertFalse(razorpay_client.verify_payment_signature('', 'pay', 'sig'))
        self.assertFalse(razorpay_client.verify_payment_signature('order', '', 'sig'))
        self.assertFalse(razorpay_client.verify_payment_signature('order', 'pay', ''))

    @override_settings(RAZORPAY_KEY_SECRET='')
    def test_missing_secret_rejects_everything(self):
        self.assertFalse(razorpay_client.verify_payment_signature('o', 'p', 'sig'))


@override_settings(RAZORPAY_WEBHOOK_SECRET='hook_secret')
class WebhookSignatureTest(TestCase):
    def test_valid_webhook_signature(self):
        body = b'{"event":"payment.captured"}'
        sig = hmac.new(b'hook_secret', body, hashlib.sha256).hexdigest()
        self.assertTrue(razorpay_client.verify_webhook_signature(body, sig))

    def test_tampered_body_rejected(self):
        body = b'{"event":"payment.captured"}'
        sig = hmac.new(b'hook_secret', body, hashlib.sha256).hexdigest()
        tampered = b'{"event":"payment.failed"}'
        self.assertFalse(razorpay_client.verify_webhook_signature(tampered, sig))

    def test_missing_signature_rejected(self):
        self.assertFalse(razorpay_client.verify_webhook_signature(b'{}', ''))


# ─── Layer 2: endpoints ─────────────────────────────────────────────────────

@override_settings(
    RAZORPAY_KEY_ID='rzp_test_key',
    RAZORPAY_KEY_SECRET='rzp_test_secret',
    RAZORPAY_CURRENCY='INR',
)
class CreateOrderEndpointTest(TestCase):
    def setUp(self):
        self.user, self.student, self.account = _student_with_balance()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    @patch('apps.shared.services.razorpay_client.create_order')
    def test_creates_pending_payment_and_returns_order(self, mock_create):
        mock_create.return_value = {
            'id': 'order_test_1',
            'amount': 500000,
            'currency': 'INR',
        }
        response = self.client.post('/api/v1/student/payments/razorpay/create-order/', {})
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['data']['order_id'], 'order_test_1')
        self.assertEqual(response.data['data']['amount'], 500000)  # paise
        self.assertEqual(response.data['data']['key'], 'rzp_test_key')

        payment = Payment.objects.get(razorpay_order_id='order_test_1')
        self.assertEqual(payment.gateway_status, Payment.GatewayStatus.CREATED)
        self.assertEqual(payment.method, Payment.Method.RAZORPAY)
        self.assertEqual(payment.amount, Decimal('5000.00'))

    @patch('apps.shared.services.razorpay_client.create_order')
    def test_rejects_amount_exceeding_outstanding(self, mock_create):
        response = self.client.post(
            '/api/v1/student/payments/razorpay/create-order/',
            {'amount': '9999999'},
        )
        self.assertEqual(response.status_code, 400)
        mock_create.assert_not_called()

    @patch('apps.shared.services.razorpay_client.create_order')
    def test_returns_503_when_not_configured(self, mock_create):
        mock_create.side_effect = razorpay_client.RazorpayNotConfigured('no keys')
        response = self.client.post('/api/v1/student/payments/razorpay/create-order/', {})
        self.assertEqual(response.status_code, 503)

    def test_rejects_unauthenticated(self):
        client = APIClient()  # no auth
        response = client.post('/api/v1/student/payments/razorpay/create-order/', {})
        self.assertIn(response.status_code, (401, 403))

    def test_zero_outstanding_rejected(self):
        self.account.paid_amount = self.account.total_amount
        self.account.save()
        response = self.client.post('/api/v1/student/payments/razorpay/create-order/', {})
        self.assertEqual(response.status_code, 400)


@override_settings(
    RAZORPAY_KEY_ID='rzp_test_key',
    RAZORPAY_KEY_SECRET='rzp_test_secret',
)
class VerifyPaymentEndpointTest(TestCase):
    def setUp(self):
        self.user, self.student, self.account = _student_with_balance()
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        # Seed a pending payment like create-order would have done
        self.payment = Payment.objects.create(
            account=self.account,
            receipt_id='RZP-TESTSEED',
            amount=Decimal('5000.00'),
            method=Payment.Method.RAZORPAY,
            razorpay_order_id='order_seed_1',
            gateway_status=Payment.GatewayStatus.CREATED,
        )

    def _good_signature(self, order_id, payment_id):
        return _make_signature('rzp_test_secret', f'{order_id}|{payment_id}')

    def test_valid_signature_captures_payment_and_updates_account(self):
        sig = self._good_signature('order_seed_1', 'pay_100')
        response = self.client.post(
            '/api/v1/student/payments/razorpay/verify/',
            {
                'razorpay_order_id': 'order_seed_1',
                'razorpay_payment_id': 'pay_100',
                'razorpay_signature': sig,
            },
        )
        self.assertEqual(response.status_code, 200, response.data)

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.gateway_status, Payment.GatewayStatus.CAPTURED)
        self.assertEqual(self.payment.razorpay_payment_id, 'pay_100')

        self.account.refresh_from_db()
        self.assertEqual(self.account.paid_amount, Decimal('5000.00'))
        self.assertEqual(self.account.status, TuitionAccount.PaymentStatus.PAID)

    def test_invalid_signature_rejected(self):
        response = self.client.post(
            '/api/v1/student/payments/razorpay/verify/',
            {
                'razorpay_order_id': 'order_seed_1',
                'razorpay_payment_id': 'pay_100',
                'razorpay_signature': 'forged_sig',
            },
        )
        self.assertEqual(response.status_code, 400)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.gateway_status, Payment.GatewayStatus.CREATED)

    def test_idempotent_on_already_captured(self):
        sig = self._good_signature('order_seed_1', 'pay_100')
        payload = {
            'razorpay_order_id': 'order_seed_1',
            'razorpay_payment_id': 'pay_100',
            'razorpay_signature': sig,
        }
        self.client.post('/api/v1/student/payments/razorpay/verify/', payload)
        # Second call should be a no-op
        response = self.client.post('/api/v1/student/payments/razorpay/verify/', payload)
        self.assertEqual(response.status_code, 200)

        self.account.refresh_from_db()
        self.assertEqual(self.account.paid_amount, Decimal('5000.00'))  # NOT doubled

    def test_another_user_cannot_verify_someones_payment(self):
        intruder = User.objects.create_user(
            username='intruder', email='intruder@test.com', password='p',
            role='student', first_name='Bad', last_name='Actor',
        )
        StudentProfile.objects.create(user=intruder, student_id='SM-INTRUDE')
        client = APIClient()
        client.force_authenticate(intruder)

        sig = self._good_signature('order_seed_1', 'pay_100')
        response = client.post(
            '/api/v1/student/payments/razorpay/verify/',
            {
                'razorpay_order_id': 'order_seed_1',
                'razorpay_payment_id': 'pay_100',
                'razorpay_signature': sig,
            },
        )
        self.assertEqual(response.status_code, 404)  # not found for this user


# ─── Layer 3: webhook ───────────────────────────────────────────────────────

@override_settings(
    RAZORPAY_KEY_SECRET='rzp_test_secret',
    RAZORPAY_WEBHOOK_SECRET='hook_secret',
)
class RazorpayWebhookTest(TestCase):
    def setUp(self):
        self.user, self.student, self.account = _student_with_balance()
        self.client = APIClient()
        self.payment = Payment.objects.create(
            account=self.account,
            receipt_id='RZP-WH-SEED',
            amount=Decimal('5000.00'),
            method=Payment.Method.RAZORPAY,
            razorpay_order_id='order_wh_1',
            gateway_status=Payment.GatewayStatus.CREATED,
        )

    def _signed_post(self, body_dict):
        body = json.dumps(body_dict)
        sig = hmac.new(b'hook_secret', body.encode(), hashlib.sha256).hexdigest()
        return self.client.post(
            '/api/v1/webhooks/razorpay/',
            data=body,
            content_type='application/json',
            HTTP_X_RAZORPAY_SIGNATURE=sig,
        )

    def test_payment_captured_webhook_updates_account(self):
        response = self._signed_post({
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'order_id': 'order_wh_1',
                        'id': 'pay_wh_1',
                    }
                }
            },
        })
        self.assertEqual(response.status_code, 200)

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.gateway_status, Payment.GatewayStatus.CAPTURED)
        self.assertEqual(self.payment.razorpay_payment_id, 'pay_wh_1')

        self.account.refresh_from_db()
        self.assertEqual(self.account.paid_amount, Decimal('5000.00'))

    def test_payment_failed_webhook_marks_failed(self):
        response = self._signed_post({
            'event': 'payment.failed',
            'payload': {
                'payment': {
                    'entity': {
                        'order_id': 'order_wh_1',
                        'id': 'pay_wh_1',
                    }
                }
            },
        })
        self.assertEqual(response.status_code, 200)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.gateway_status, Payment.GatewayStatus.FAILED)

    def test_unsigned_webhook_rejected(self):
        response = self.client.post(
            '/api/v1/webhooks/razorpay/',
            data=json.dumps({'event': 'payment.captured'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)

    def test_webhook_for_unknown_order_returns_200(self):
        # Return 200 so Razorpay doesn't keep retrying for orders we don't know about
        response = self._signed_post({
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'order_id': 'order_unknown',
                        'id': 'pay_X',
                    }
                }
            },
        })
        self.assertEqual(response.status_code, 200)

    def test_idempotent_captured_webhook(self):
        payload = {
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'order_id': 'order_wh_1',
                        'id': 'pay_wh_1',
                    }
                }
            },
        }
        self._signed_post(payload)
        self._signed_post(payload)  # second call shouldn't double-pay
        self.account.refresh_from_db()
        self.assertEqual(self.account.paid_amount, Decimal('5000.00'))
