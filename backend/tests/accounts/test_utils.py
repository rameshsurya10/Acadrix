from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User, OTP
from apps.accounts.utils import generate_otp, send_otp_email, generate_id, mask_email
from apps.admin_panel.models import IDConfiguration
from apps.teacher.models import TeacherProfile


class GenerateOTPTest(TestCase):
    def test_generates_6_digit_code(self):
        otp = generate_otp('test@test.com', 'login')
        self.assertEqual(len(otp.code), 6)
        self.assertTrue(otp.code.isdigit())

    def test_sets_5_minute_expiry(self):
        otp = generate_otp('test@test.com', 'login')
        expected_min = timezone.now() + timedelta(minutes=4, seconds=50)
        expected_max = timezone.now() + timedelta(minutes=5, seconds=10)
        self.assertGreater(otp.expires_at, expected_min)
        self.assertLess(otp.expires_at, expected_max)

    def test_invalidates_previous_otps(self):
        otp1 = generate_otp('test@test.com', 'login')
        otp2 = generate_otp('test@test.com', 'login')
        otp1.refresh_from_db()
        self.assertTrue(otp1.is_used)
        self.assertFalse(otp2.is_used)

    def test_rate_limit_raises_after_3_in_15_minutes(self):
        generate_otp('test@test.com', 'login')
        generate_otp('test@test.com', 'login')
        generate_otp('test@test.com', 'login')
        with self.assertRaises(ValueError) as ctx:
            generate_otp('test@test.com', 'login')
        self.assertIn('Too many', str(ctx.exception))


class MaskEmailTest(TestCase):
    def test_masks_normal_email(self):
        self.assertEqual(mask_email('ramesh@gmail.com'), 'r****h@gmail.com')

    def test_masks_short_email(self):
        self.assertEqual(mask_email('ab@gmail.com'), 'a*@gmail.com')


class GenerateIDTest(TestCase):
    def setUp(self):
        IDConfiguration.objects.create(role='teacher', prefix='MAJ', year='1998')
        IDConfiguration.objects.create(role='student', prefix='MAJ', year='1998')

    def test_first_teacher_id_is_01(self):
        result = generate_id('teacher')
        self.assertEqual(result, 'MAJ1998-01')

    def test_auto_increments(self):
        user1 = User.objects.create_user(
            username='t1', email='t1@test.com', password='pass123',
            role='teacher', first_name='A', last_name='B',
        )
        TeacherProfile.objects.create(user=user1, employee_id='MAJ1998-01')
        result = generate_id('teacher')
        self.assertEqual(result, 'MAJ1998-02')

    def test_custom_suffix(self):
        result = generate_id('teacher', suffix='42')
        self.assertEqual(result, 'MAJ1998-42')

    def test_raises_if_no_config(self):
        with self.assertRaises(ValueError):
            generate_id('principal')


class SendOTPEmailTest(TestCase):
    @patch('apps.accounts.utils.send_mail')
    def test_sends_email_with_code(self, mock_send):
        otp = OTP.objects.create(
            email='test@test.com', code='123456', purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        send_otp_email(otp)
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        self.assertIn('123456', call_args[1].get('message', '') or call_args[0][1])
