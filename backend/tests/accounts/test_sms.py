"""Tests for the MSG91 SMS integration in apps.accounts.utils.send_otp_sms.

Three modes covered:
  1. Dev fallback (MSG91_AUTH_KEY empty)        -> prints to console, no HTTP call
  2. Production success (MSG91 returns success) -> HTTP call made, no exception
  3. Production failure (HTTP / JSON / type)    -> raises so Celery retries
"""
from datetime import timedelta
from unittest.mock import patch, MagicMock

import requests
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.accounts.models import OTP
from apps.accounts.utils import send_otp_sms


def _build_otp(phone='9876543210', code='123456'):
    return OTP.objects.create(
        phone=phone, code=code, purpose='login',
        expires_at=timezone.now() + timedelta(minutes=5),
    )


class SendOTPSMSDevFallbackTest(TestCase):
    """When MSG91 is not configured, send_otp_sms must NOT make HTTP calls."""

    @override_settings(MSG91_AUTH_KEY='', MSG91_OTP_TEMPLATE_ID='')
    @patch('apps.accounts.utils.requests.post')
    def test_no_http_call_when_auth_key_missing(self, mock_post):
        otp = _build_otp()
        send_otp_sms(otp)
        mock_post.assert_not_called()

    @override_settings(MSG91_AUTH_KEY='key', MSG91_OTP_TEMPLATE_ID='')
    @patch('apps.accounts.utils.requests.post')
    def test_no_http_call_when_template_id_missing(self, mock_post):
        otp = _build_otp()
        send_otp_sms(otp)
        mock_post.assert_not_called()


class SendOTPSMSProductionSuccessTest(TestCase):
    @override_settings(
        MSG91_AUTH_KEY='test-auth-key',
        MSG91_OTP_TEMPLATE_ID='tpl_123',
        MSG91_COUNTRY_CODE='91',
    )
    @patch('apps.accounts.utils.requests.post')
    def test_posts_to_msg91_with_correct_payload(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'type': 'success', 'message': 'queued'}
        mock_post.return_value = mock_response

        otp = _build_otp(phone='9876543210', code='987654')
        send_otp_sms(otp)

        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args.kwargs
        # URL is the first positional arg
        self.assertEqual(mock_post.call_args.args[0], 'https://control.msg91.com/api/v5/flow')
        # Auth header is set
        self.assertEqual(call_kwargs['headers']['authkey'], 'test-auth-key')
        # Payload carries template + recipient
        body = call_kwargs['json']
        self.assertEqual(body['template_id'], 'tpl_123')
        self.assertEqual(body['recipients'][0]['mobiles'], '919876543210')
        self.assertEqual(body['recipients'][0]['OTP'], '987654')


class SendOTPSMSProductionFailureTest(TestCase):
    @override_settings(MSG91_AUTH_KEY='k', MSG91_OTP_TEMPLATE_ID='t')
    @patch('apps.accounts.utils.requests.post')
    def test_raises_on_http_error(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = 'Internal Server Error'
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError('500')
        mock_post.return_value = mock_response

        otp = _build_otp()
        with self.assertRaises(requests.exceptions.HTTPError):
            send_otp_sms(otp)

    @override_settings(MSG91_AUTH_KEY='k', MSG91_OTP_TEMPLATE_ID='t')
    @patch('apps.accounts.utils.requests.post')
    def test_raises_on_msg91_error_response(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'type': 'error', 'message': 'invalid template'}
        mock_post.return_value = mock_response

        otp = _build_otp()
        with self.assertRaises(RuntimeError) as ctx:
            send_otp_sms(otp)
        self.assertIn('invalid template', str(ctx.exception))

    @override_settings(MSG91_AUTH_KEY='k', MSG91_OTP_TEMPLATE_ID='t')
    @patch('apps.accounts.utils.requests.post')
    def test_raises_on_network_error(self, mock_post):
        mock_post.side_effect = requests.exceptions.ConnectionError('DNS failure')
        otp = _build_otp()
        with self.assertRaises(requests.exceptions.ConnectionError):
            send_otp_sms(otp)

    @override_settings(MSG91_AUTH_KEY='k', MSG91_OTP_TEMPLATE_ID='t')
    @patch('apps.accounts.utils.requests.post')
    def test_raises_on_malformed_json(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.side_effect = ValueError('not json')
        mock_response.text = '<html>maintenance</html>'
        mock_post.return_value = mock_response

        otp = _build_otp()
        with self.assertRaises(RuntimeError) as ctx:
            send_otp_sms(otp)
        self.assertIn('malformed', str(ctx.exception))
