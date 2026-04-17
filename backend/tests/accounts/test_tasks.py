"""Tests for the Celery task wrappers around OTP sending.

Tests run with CELERY_TASK_ALWAYS_EAGER=True (set in settings_test.py),
so .delay() calls execute synchronously inside the test thread.
"""
from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import OTP
from apps.accounts.tasks import send_otp_email_task, send_otp_sms_task


class SendOTPEmailTaskTest(TestCase):
    def setUp(self):
        self.otp = OTP.objects.create(
            email='parent@test.com', code='123456', purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )

    @patch('apps.accounts.utils.send_otp_email')
    def test_task_dispatches_send_for_active_otp(self, mock_send):
        send_otp_email_task.delay(self.otp.id)
        mock_send.assert_called_once()
        # First positional arg is the OTP instance
        sent_otp = mock_send.call_args.args[0]
        self.assertEqual(sent_otp.id, self.otp.id)

    @patch('apps.accounts.utils.send_otp_email')
    def test_task_skips_used_otp(self, mock_send):
        self.otp.is_used = True
        self.otp.save()
        send_otp_email_task.delay(self.otp.id)
        mock_send.assert_not_called()

    @patch('apps.accounts.utils.send_otp_email')
    def test_task_handles_missing_otp_gracefully(self, mock_send):
        send_otp_email_task.delay(999999)  # nonexistent
        mock_send.assert_not_called()


class SendOTPSMSTaskTest(TestCase):
    def setUp(self):
        self.otp = OTP.objects.create(
            phone='9876543210', code='654321', purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )

    @patch('apps.accounts.utils.send_otp_sms')
    def test_task_dispatches_sms_for_active_otp(self, mock_send):
        send_otp_sms_task.delay(self.otp.id)
        mock_send.assert_called_once()
        sent_otp = mock_send.call_args.args[0]
        self.assertEqual(sent_otp.phone, '9876543210')

    @patch('apps.accounts.utils.send_otp_sms')
    def test_task_skips_used_sms_otp(self, mock_send):
        self.otp.is_used = True
        self.otp.save()
        send_otp_sms_task.delay(self.otp.id)
        mock_send.assert_not_called()
