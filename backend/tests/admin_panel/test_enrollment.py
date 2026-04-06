from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.teacher.models import TeacherProfile
from apps.student.models import StudentProfile
from apps.admin_panel.models import IDConfiguration


class AdminEnrollTeacherTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )
        self.client.force_authenticate(user=self.admin)
        IDConfiguration.objects.create(role='teacher', prefix='MAJ', year='1998')

    @patch('apps.admin_panel.enrollment_serializers.send_welcome_email', return_value=True)
    def test_enroll_teacher_success(self, mock_email):
        response = self.client.post('/api/v1/admin/enroll/teacher/', {
            'first_name': 'John', 'last_name': 'Doe', 'email': 'john@school.com',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['employee_id'], 'MAJ1998-01')
        self.assertTrue(User.objects.filter(email='john@school.com').exists())
        user = User.objects.get(email='john@school.com')
        self.assertFalse(user.has_usable_password())
        mock_email.assert_called_once()

    def test_enroll_teacher_duplicate_email(self):
        User.objects.create_user(
            username='existing', email='john@school.com',
            password='pass', role='teacher', first_name='X', last_name='Y',
        )
        response = self.client.post('/api/v1/admin/enroll/teacher/', {
            'first_name': 'John', 'last_name': 'Doe', 'email': 'john@school.com',
        })
        self.assertEqual(response.status_code, 400)

    @patch('apps.admin_panel.enrollment_serializers.send_welcome_email', return_value=True)
    def test_enroll_teacher_custom_id(self, mock_email):
        response = self.client.post('/api/v1/admin/enroll/teacher/', {
            'first_name': 'John', 'last_name': 'Doe',
            'email': 'john@school.com', 'employee_id': 'CUSTOM-99',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['employee_id'], 'CUSTOM-99')

    def test_teacher_cannot_enroll_teacher(self):
        teacher = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher', first_name='T', last_name='T',
        )
        self.client.force_authenticate(user=teacher)
        response = self.client.post('/api/v1/admin/enroll/teacher/', {
            'first_name': 'John', 'last_name': 'Doe', 'email': 'john@school.com',
        })
        self.assertEqual(response.status_code, 403)


class AdminEnrollStudentTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )
        self.client.force_authenticate(user=self.admin)
        IDConfiguration.objects.create(role='student', prefix='MAJ', year='1998')

    @patch('apps.admin_panel.enrollment_serializers.send_welcome_email', return_value=True)
    def test_enroll_student_success(self, mock_email):
        response = self.client.post('/api/v1/admin/enroll/student/', {
            'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane@email.com',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['student_id'], 'MAJ1998-01')

    @patch('apps.admin_panel.enrollment_serializers.send_welcome_email', return_value=True)
    def test_enroll_student_with_guardians(self, mock_email):
        response = self.client.post('/api/v1/admin/enroll/student/', {
            'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane@email.com',
            'guardians': [
                {'name': 'Mary Smith', 'relationship': 'mother', 'phone': '9876543210', 'is_primary': True},
            ],
        }, format='json')
        self.assertEqual(response.status_code, 201)
        profile = StudentProfile.objects.get(student_id='MAJ1998-01')
        self.assertEqual(profile.guardians.count(), 1)


class PrincipalEnrollTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.principal = User.objects.create_user(
            username='principal1', email='principal@test.com',
            password='TestPass123!', role='principal',
            first_name='Principal', last_name='User',
        )
        self.client.force_authenticate(user=self.principal)
        IDConfiguration.objects.create(role='teacher', prefix='MAJ', year='1998')

    @patch('apps.admin_panel.enrollment_serializers.send_welcome_email', return_value=True)
    def test_principal_can_enroll_teacher(self, mock_email):
        response = self.client.post('/api/v1/admin/enroll/teacher/', {
            'first_name': 'John', 'last_name': 'Doe', 'email': 'john@school.com',
        })
        self.assertEqual(response.status_code, 201)
