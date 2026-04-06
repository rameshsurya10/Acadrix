from datetime import timedelta
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User, OTP
from apps.teacher.models import TeacherProfile
from apps.student.models import StudentProfile



class IdentifyViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher',
            first_name='John', last_name='Doe',
        )
        TeacherProfile.objects.create(user=self.teacher_user, employee_id='MAJ1998-01')
        self.admin_user = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )

    @patch('apps.accounts.views.send_otp_email')
    def test_identify_email_teacher_returns_otp_method(self, mock_send):
        response = self.client.post('/api/v1/auth/identify/', {'identifier': 'teacher@test.com'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'otp')
        mock_send.assert_called_once()

    def test_identify_email_admin_returns_password_method(self):
        response = self.client.post('/api/v1/auth/identify/', {'identifier': 'admin@test.com'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'password')

    def test_identify_id_with_password_returns_password(self):
        response = self.client.post('/api/v1/auth/identify/', {'identifier': 'MAJ1998-01'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'password')

    def test_identify_id_without_password_returns_set_password(self):
        no_pass_user = User.objects.create_user(
            username='teacher2', email='teacher2@test.com',
            password='', role='teacher', first_name='Jane', last_name='Doe',
        )
        no_pass_user.set_unusable_password()
        no_pass_user.save()
        TeacherProfile.objects.create(user=no_pass_user, employee_id='MAJ1998-02')
        response = self.client.post('/api/v1/auth/identify/', {'identifier': 'MAJ1998-02'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'set_password')

    def test_identify_unknown_email_returns_404(self):
        response = self.client.post('/api/v1/auth/identify/', {'identifier': 'nobody@test.com'})
        self.assertEqual(response.status_code, 404)

    def test_identify_unknown_id_returns_404(self):
        response = self.client.post('/api/v1/auth/identify/', {'identifier': 'FAKE-999'})
        self.assertEqual(response.status_code, 404)


class LoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher',
            first_name='John', last_name='Doe',
        )
        TeacherProfile.objects.create(user=self.user, employee_id='MAJ1998-01')

    def test_login_with_email(self):
        response = self.client.post('/api/v1/auth/login/', {'identifier': 'teacher@test.com', 'password': 'TestPass123!'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_login_with_id(self):
        response = self.client.post('/api/v1/auth/login/', {'identifier': 'MAJ1998-01', 'password': 'TestPass123!'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/v1/auth/login/', {'identifier': 'MAJ1998-01', 'password': 'WrongPass!'})
        self.assertEqual(response.status_code, 400)


class VerifyOTPViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher',
            first_name='John', last_name='Doe',
        )

    def test_verify_valid_otp(self):
        OTP.objects.create(email='teacher@test.com', code='123456', purpose='login', expires_at=timezone.now() + timedelta(minutes=5))
        response = self.client.post('/api/v1/auth/verify-otp/', {'email': 'teacher@test.com', 'otp': '123456'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_verify_wrong_otp(self):
        OTP.objects.create(email='teacher@test.com', code='123456', purpose='login', expires_at=timezone.now() + timedelta(minutes=5))
        response = self.client.post('/api/v1/auth/verify-otp/', {'email': 'teacher@test.com', 'otp': '000000'})
        self.assertEqual(response.status_code, 400)

    def test_verify_expired_otp(self):
        OTP.objects.create(email='teacher@test.com', code='123456', purpose='login', expires_at=timezone.now() - timedelta(minutes=1))
        response = self.client.post('/api/v1/auth/verify-otp/', {'email': 'teacher@test.com', 'otp': '123456'})
        self.assertEqual(response.status_code, 400)


class SetPasswordViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='', role='teacher', first_name='John', last_name='Doe',
        )
        self.user.set_unusable_password()
        self.user.save()
        TeacherProfile.objects.create(user=self.user, employee_id='MAJ1998-01')

    def test_set_password_first_time(self):
        response = self.client.post('/api/v1/auth/set-password/', {
            'identifier': 'MAJ1998-01', 'password': 'NewPass123!', 'confirm_password': 'NewPass123!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.has_usable_password())

    def test_set_password_mismatch(self):
        response = self.client.post('/api/v1/auth/set-password/', {
            'identifier': 'MAJ1998-01', 'password': 'NewPass123!', 'confirm_password': 'Different!',
        })
        self.assertEqual(response.status_code, 400)

    def test_set_password_rejects_if_already_has_password(self):
        self.user.set_password('ExistingPass123!')
        self.user.save()
        response = self.client.post('/api/v1/auth/set-password/', {
            'identifier': 'MAJ1998-01', 'password': 'NewPass123!', 'confirm_password': 'NewPass123!',
        })
        self.assertEqual(response.status_code, 400)


class ForgotResetPasswordViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )

    @patch('apps.accounts.views.send_otp_email')
    def test_forgot_password_sends_otp(self, mock_send):
        response = self.client.post('/api/v1/auth/forgot-password/', {'email': 'admin@test.com'})
        self.assertEqual(response.status_code, 200)
        mock_send.assert_called_once()

    def test_forgot_password_unknown_email(self):
        response = self.client.post('/api/v1/auth/forgot-password/', {'email': 'nobody@test.com'})
        self.assertEqual(response.status_code, 404)

    def test_reset_password_with_valid_otp(self):
        OTP.objects.create(email='admin@test.com', code='123456', purpose='forgot_password', expires_at=timezone.now() + timedelta(minutes=5))
        response = self.client.post('/api/v1/auth/reset-password/', {
            'email': 'admin@test.com', 'otp': '123456',
            'new_password': 'BrandNew123!', 'confirm_password': 'BrandNew123!',
        })
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNew123!'))


class GoogleOAuthRoleRestrictionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin1', email='admin@gmail.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )

    @patch('apps.accounts.views.GoogleOAuthCallbackView._get_google_email')
    def test_google_oauth_rejects_admin(self, mock_google):
        mock_google.return_value = 'admin@gmail.com'
        response = self.client.post('/api/v1/auth/google/callback/', {'code': 'fake-code'})
        self.assertEqual(response.status_code, 403)


class TourProgressViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='student1', email='student@test.com',
            password='TestPass123!', role='student',
            first_name='Test', last_name='Student',
        )
        self.client.force_authenticate(user=self.user)

    def test_get_empty_tour_progress(self):
        response = self.client.get('/api/v1/auth/tour-progress/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data'], [])

    def test_complete_tour(self):
        response = self.client.post('/api/v1/auth/tour-progress/', {'tour_key': 'first_login'})
        self.assertEqual(response.status_code, 201)

    def test_complete_tour_duplicate_is_idempotent(self):
        self.client.post('/api/v1/auth/tour-progress/', {'tour_key': 'first_login'})
        response = self.client.post('/api/v1/auth/tour-progress/', {'tour_key': 'first_login'})
        self.assertEqual(response.status_code, 200)
