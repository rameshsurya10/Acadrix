"""Tests for parent login flow (Phase 0.1).

Parents log in via their phone number which is matched against Guardian records.
The same student account is used for both student and parent sessions.
"""
from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User, OTP
from apps.accounts.utils import normalize_phone, mask_phone
from apps.student.models import StudentProfile, Guardian


class ParentLoginRequestOTPTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student_user = User.objects.create_user(
            username='student1', email='student1@test.com',
            password='', role='student',
            first_name='Aarav', last_name='Sharma',
        )
        self.student = StudentProfile.objects.create(
            user=self.student_user, student_id='SM-2024-0001',
        )
        Guardian.objects.create(
            student=self.student, name='Rajesh Sharma',
            phone='9876543210', is_primary=True,
        )

    @patch('apps.accounts.utils.send_otp_sms')
    def test_request_otp_sends_sms_for_known_parent(self, mock_send):
        response = self.client.post(
            '/api/v1/auth/parent/request-otp/',
            {'phone': '9876543210'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'otp')
        self.assertEqual(response.data['data']['child_count'], 1)
        self.assertIn('*', response.data['data']['masked_phone'])
        mock_send.assert_called_once()

    @patch('apps.accounts.utils.send_otp_sms')
    def test_request_otp_accepts_phone_with_country_code(self, mock_send):
        response = self.client.post(
            '/api/v1/auth/parent/request-otp/',
            {'phone': '+919876543210'},
        )
        self.assertEqual(response.status_code, 200)
        mock_send.assert_called_once()

    @patch('apps.accounts.utils.send_otp_sms')
    def test_request_otp_accepts_formatted_phone(self, mock_send):
        response = self.client.post(
            '/api/v1/auth/parent/request-otp/',
            {'phone': '98765 43210'},
        )
        self.assertEqual(response.status_code, 200)
        mock_send.assert_called_once()

    def test_request_otp_rejects_short_phone(self):
        response = self.client.post(
            '/api/v1/auth/parent/request-otp/',
            {'phone': '12345'},
        )
        self.assertEqual(response.status_code, 400)

    def test_request_otp_404_for_unknown_phone(self):
        response = self.client.post(
            '/api/v1/auth/parent/request-otp/',
            {'phone': '9999999999'},
        )
        self.assertEqual(response.status_code, 404)

    def test_request_otp_404_for_inactive_student(self):
        self.student.is_active = False
        self.student.save()
        response = self.client.post(
            '/api/v1/auth/parent/request-otp/',
            {'phone': '9876543210'},
        )
        self.assertEqual(response.status_code, 404)


class ParentLoginVerifyOTPSingleChildTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student_user = User.objects.create_user(
            username='student1', email='student1@test.com',
            password='', role='student',
            first_name='Aarav', last_name='Sharma',
        )
        self.student = StudentProfile.objects.create(
            user=self.student_user, student_id='SM-2024-0001',
        )
        Guardian.objects.create(
            student=self.student, name='Rajesh Sharma',
            phone='9876543210', is_primary=True,
        )
        # Pre-create an OTP that we control
        from django.utils import timezone
        from datetime import timedelta
        self.otp = OTP.objects.create(
            phone='9876543210', code='123456', purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )

    def test_verify_otp_returns_tokens_for_single_child(self):
        response = self.client.post(
            '/api/v1/auth/parent/verify-otp/',
            {'phone': '9876543210', 'otp': '123456'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(response.data['is_parent_session'])
        self.assertEqual(response.data['user']['role'], 'student')
        self.otp.refresh_from_db()
        self.assertTrue(self.otp.is_used)

    def test_verify_otp_wrong_code_increments_attempts(self):
        response = self.client.post(
            '/api/v1/auth/parent/verify-otp/',
            {'phone': '9876543210', 'otp': '000000'},
        )
        self.assertEqual(response.status_code, 400)
        self.otp.refresh_from_db()
        self.assertEqual(self.otp.attempts, 1)
        self.assertFalse(self.otp.is_used)

    def test_verify_otp_burns_after_5_wrong_attempts(self):
        for _ in range(5):
            self.client.post(
                '/api/v1/auth/parent/verify-otp/',
                {'phone': '9876543210', 'otp': '000000'},
            )
        self.otp.refresh_from_db()
        self.assertTrue(self.otp.is_used)


class ParentLoginVerifyOTPMultiChildTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.parent_phone = '9876543210'
        # Create two children sharing the same parent phone
        self.child1_user = User.objects.create_user(
            username='child1', email='child1@test.com', password='',
            role='student', first_name='Aarav', last_name='Sharma',
        )
        self.child1 = StudentProfile.objects.create(
            user=self.child1_user, student_id='SM-2024-0001',
        )
        Guardian.objects.create(
            student=self.child1, name='Rajesh Sharma',
            phone=self.parent_phone, is_primary=True,
        )

        self.child2_user = User.objects.create_user(
            username='child2', email='child2@test.com', password='',
            role='student', first_name='Diya', last_name='Sharma',
        )
        self.child2 = StudentProfile.objects.create(
            user=self.child2_user, student_id='SM-2024-0002',
        )
        Guardian.objects.create(
            student=self.child2, name='Rajesh Sharma',
            phone=self.parent_phone, is_primary=True,
        )

        from django.utils import timezone
        from datetime import timedelta
        self.otp = OTP.objects.create(
            phone=self.parent_phone, code='123456', purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )

    def test_verify_otp_returns_child_selection_for_multiple(self):
        response = self.client.post(
            '/api/v1/auth/parent/verify-otp/',
            {'phone': self.parent_phone, 'otp': '123456'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['requires_child_selection'])
        self.assertEqual(len(response.data['children']), 2)
        names = {c['name'] for c in response.data['children']}
        self.assertIn('Aarav Sharma', names)
        self.assertIn('Diya Sharma', names)
        # OTP should NOT be burned yet
        self.otp.refresh_from_db()
        self.assertFalse(self.otp.is_used)

    def test_verify_otp_with_child_id_returns_tokens(self):
        response = self.client.post(
            '/api/v1/auth/parent/verify-otp/',
            {
                'phone': self.parent_phone,
                'otp': '123456',
                'child_id': self.child2_user.id,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['id'], self.child2_user.id)
        self.assertTrue(response.data['is_parent_session'])
        # NOW the OTP should be burned
        self.otp.refresh_from_db()
        self.assertTrue(self.otp.is_used)

    def test_verify_otp_rejects_unrelated_child_id(self):
        # Create a third student NOT linked to this parent
        outsider_user = User.objects.create_user(
            username='outsider', email='outsider@test.com', password='',
            role='student', first_name='Outsider', last_name='Kid',
        )
        StudentProfile.objects.create(
            user=outsider_user, student_id='SM-2024-9999',
        )

        response = self.client.post(
            '/api/v1/auth/parent/verify-otp/',
            {
                'phone': self.parent_phone,
                'otp': '123456',
                'child_id': outsider_user.id,
            },
        )
        self.assertEqual(response.status_code, 400)


class PhoneUtilsTest(TestCase):
    def test_normalize_phone_strips_country_code(self):
        self.assertEqual(normalize_phone('+919876543210'), '9876543210')
        self.assertEqual(normalize_phone('919876543210'), '9876543210')
        self.assertEqual(normalize_phone('98765 43210'), '9876543210')
        self.assertEqual(normalize_phone('+91-98765-43210'), '9876543210')

    def test_mask_phone(self):
        self.assertEqual(mask_phone('9876543210'), '98****3210')
        self.assertEqual(mask_phone('123'), '123')  # too short, unchanged
