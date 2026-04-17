"""Razorpay payment endpoints for the student/parent flow.

Three endpoints:
  POST /api/v1/student/payments/razorpay/create-order/
      Creates a Razorpay order for the authenticated student's outstanding
      balance and a matching Payment row in 'created' state.

  POST /api/v1/student/payments/razorpay/verify/
      Called from the client after Razorpay Checkout success. Verifies the
      signature and marks the Payment as captured.

  POST /api/v1/webhooks/razorpay/
      Razorpay's server-to-server webhook. Signed with a separate webhook
      secret. Safety net if the client's verify call never reaches us.
"""
import json
import logging
import secrets
from decimal import Decimal

from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import serializers, status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsStudent
from apps.shared.services import razorpay_client
from apps.student.models import Payment, TuitionAccount

logger = logging.getLogger(__name__)


def _recalc_account_status(account: TuitionAccount) -> None:
    """Update the tuition account status based on paid vs total amount."""
    outstanding = account.total_amount - account.paid_amount
    if outstanding <= 0:
        account.status = TuitionAccount.PaymentStatus.PAID
    elif account.paid_amount > 0:
        account.status = TuitionAccount.PaymentStatus.PARTIAL
    else:
        account.status = TuitionAccount.PaymentStatus.PENDING


class CreateOrderSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField(max_length=64)
    razorpay_payment_id = serializers.CharField(max_length=64)
    razorpay_signature = serializers.CharField(max_length=256)


class CreateRazorpayOrderView(GenericAPIView):
    """POST /api/v1/student/payments/razorpay/create-order/"""
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = CreateOrderSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            account = TuitionAccount.objects.select_related('student').get(
                student__user=request.user,
            )
        except TuitionAccount.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No tuition account found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        outstanding = account.total_amount - account.paid_amount
        amount = serializer.validated_data.get('amount') or outstanding

        if amount <= 0:
            return Response(
                {'success': False, 'error': 'No outstanding balance to pay.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if amount > outstanding:
            return Response(
                {'success': False, 'error': 'Amount exceeds outstanding balance.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receipt_id = f'RZP-{secrets.token_hex(4).upper()}'

        try:
            order = razorpay_client.create_order(
                amount_rupees=amount,
                receipt_id=receipt_id,
                notes={
                    'student_id': account.student.student_id,
                    'user_id': str(request.user.id),
                },
            )
        except razorpay_client.RazorpayNotConfigured:
            return Response(
                {'success': False, 'error': 'Online payments are not configured. Contact the school office.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except razorpay_client.RazorpayError as exc:
            return Response(
                {'success': False, 'error': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Create a pending Payment row keyed on the order_id.
        payment = Payment.objects.create(
            account=account,
            receipt_id=receipt_id,
            amount=amount,
            method=Payment.Method.RAZORPAY,
            paid_by=request.user,
            razorpay_order_id=order['id'],
            gateway_status=Payment.GatewayStatus.CREATED,
            notes=f'Online payment initiated via Razorpay order {order["id"]}',
        )

        return Response({
            'success': True,
            'data': {
                'order_id': order['id'],
                'amount': int(Decimal(str(amount)) * 100),  # paise for client
                'currency': order.get('currency', 'INR'),
                'key': _public_key(),
                'receipt_id': payment.receipt_id,
                'student_name': account.student.user.full_name,
                'student_email': account.student.user.email,
            },
        })


def _public_key():
    from django.conf import settings
    return settings.RAZORPAY_KEY_ID


class VerifyRazorpayPaymentView(GenericAPIView):
    """POST /api/v1/student/payments/razorpay/verify/"""
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = VerifyPaymentSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        valid = razorpay_client.verify_payment_signature(
            order_id=data['razorpay_order_id'],
            payment_id=data['razorpay_payment_id'],
            signature=data['razorpay_signature'],
        )
        if not valid:
            logger.warning(
                'Invalid Razorpay signature from user %s for order %s',
                request.user.id, data['razorpay_order_id'],
            )
            return Response(
                {'success': False, 'error': 'Invalid payment signature.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = Payment.objects.select_related('account').get(
                razorpay_order_id=data['razorpay_order_id'],
                account__student__user=request.user,
            )
        except Payment.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Payment record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Idempotency: if already captured, just return the receipt
        if payment.gateway_status == Payment.GatewayStatus.CAPTURED:
            return Response({
                'success': True,
                'message': 'Payment already captured.',
                'data': {'receipt_id': payment.receipt_id},
            })

        with transaction.atomic():
            account = TuitionAccount.objects.select_for_update().get(pk=payment.account_id)
            payment.razorpay_payment_id = data['razorpay_payment_id']
            payment.razorpay_signature = data['razorpay_signature']
            payment.gateway_status = Payment.GatewayStatus.CAPTURED
            payment.save(update_fields=[
                'razorpay_payment_id', 'razorpay_signature', 'gateway_status',
            ])
            account.paid_amount = account.paid_amount + payment.amount
            _recalc_account_status(account)
            account.save(update_fields=['paid_amount', 'status', 'updated_at'])

        logger.info(
            'Razorpay payment captured: %s for student user %s, amount %s',
            payment.receipt_id, request.user.id, payment.amount,
        )

        return Response({
            'success': True,
            'message': 'Payment verified and recorded.',
            'data': {
                'receipt_id': payment.receipt_id,
                'amount': str(payment.amount),
                'paid_at': payment.paid_at.isoformat(),
            },
        })


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(GenericAPIView):
    """POST /api/v1/webhooks/razorpay/

    Server-to-server webhook. AllowAny + signature-verified.
    Handles `payment.captured` and `payment.failed` events as a safety net
    for when the client verify call never reaches us.
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # skip JWT — this is a server call
    throttle_classes = []

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature', '')
        raw_body = request.body

        if not razorpay_client.verify_webhook_signature(raw_body, signature):
            logger.warning('Invalid Razorpay webhook signature')
            return Response(
                {'success': False, 'error': 'Invalid signature.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            event = json.loads(raw_body.decode('utf-8'))
        except (ValueError, UnicodeDecodeError):
            return Response(
                {'success': False, 'error': 'Malformed JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_type = event.get('event', '')
        entity = event.get('payload', {}).get('payment', {}).get('entity', {})
        order_id = entity.get('order_id')
        payment_id = entity.get('id')

        if not order_id:
            logger.info('Razorpay webhook %s has no order_id, ignoring', event_type)
            return Response({'success': True, 'message': 'ignored'})

        payment = Payment.objects.select_related('account').filter(
            razorpay_order_id=order_id,
        ).first()
        if not payment:
            logger.warning('Razorpay webhook for unknown order %s', order_id)
            return Response({'success': True, 'message': 'unknown order'})

        if event_type == 'payment.captured':
            if payment.gateway_status == Payment.GatewayStatus.CAPTURED:
                return Response({'success': True, 'message': 'already captured'})

            with transaction.atomic():
                account = TuitionAccount.objects.select_for_update().get(pk=payment.account_id)
                payment.razorpay_payment_id = payment_id or payment.razorpay_payment_id
                payment.gateway_status = Payment.GatewayStatus.CAPTURED
                payment.save(update_fields=[
                    'razorpay_payment_id', 'gateway_status',
                ])
                account.paid_amount = account.paid_amount + payment.amount
                _recalc_account_status(account)
                account.save(update_fields=['paid_amount', 'status', 'updated_at'])

            logger.info('Razorpay webhook captured payment %s', payment.receipt_id)

        elif event_type == 'payment.failed':
            if payment.gateway_status != Payment.GatewayStatus.CAPTURED:
                payment.gateway_status = Payment.GatewayStatus.FAILED
                payment.save(update_fields=['gateway_status'])
                logger.info('Razorpay webhook marked payment %s as failed', payment.receipt_id)

        return Response({'success': True, 'message': 'processed'})
