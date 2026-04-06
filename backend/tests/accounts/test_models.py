from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from apps.accounts.models import User, OTP, UserTourProgress


class OTPModelTest(TestCase):
    def test_is_expired_returns_true_when_past_expiry(self):
        otp = OTP(expires_at=timezone.now() - timedelta(minutes=1))
        self.assertTrue(otp.is_expired)

    def test_is_expired_returns_false_when_before_expiry(self):
        otp = OTP(expires_at=timezone.now() + timedelta(minutes=5))
        self.assertFalse(otp.is_expired)

    def test_is_valid_returns_false_when_used(self):
        otp = OTP(
            is_used=True, attempts=0,
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        self.assertFalse(otp.is_valid)

    def test_is_valid_returns_false_when_max_attempts(self):
        otp = OTP(
            is_used=False, attempts=5,
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        self.assertFalse(otp.is_valid)

    def test_is_valid_returns_true_when_fresh(self):
        otp = OTP(
            is_used=False, attempts=0,
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        self.assertTrue(otp.is_valid)


class UserTourProgressTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@test.com',
            password='testpass123', role='student',
            first_name='Test', last_name='User',
        )

    def test_create_tour_progress(self):
        progress = UserTourProgress.objects.create(
            user=self.user, tour_key='first_login',
        )
        self.assertEqual(progress.tour_key, 'first_login')

    def test_unique_together_prevents_duplicates(self):
        UserTourProgress.objects.create(user=self.user, tour_key='first_login')
        with self.assertRaises(Exception):
            UserTourProgress.objects.create(user=self.user, tour_key='first_login')


class UserModelTest(TestCase):
    def test_parent_role_removed(self):
        choices = [c[0] for c in User.Role.choices]
        self.assertNotIn('parent', choices)

    def test_student_role_exists(self):
        choices = [c[0] for c in User.Role.choices]
        self.assertIn('student', choices)
