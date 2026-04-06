from django.test import TestCase, RequestFactory
from apps.accounts.models import User
from apps.accounts.backends import MultiMethodAuthBackend
from apps.teacher.models import TeacherProfile
from apps.student.models import StudentProfile


class MultiMethodAuthBackendTest(TestCase):
    def setUp(self):
        self.backend = MultiMethodAuthBackend()
        self.factory = RequestFactory()

        self.teacher_user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher',
            first_name='John', last_name='Doe',
        )
        TeacherProfile.objects.create(user=self.teacher_user, employee_id='MAJ1998-01')

        self.student_user = User.objects.create_user(
            username='student1', email='student@test.com',
            password='TestPass123!', role='student',
            first_name='Jane', last_name='Doe',
        )
        StudentProfile.objects.create(user=self.student_user, student_id='MAJ1998-01')

        self.admin_user = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )

    def test_authenticate_with_email(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(request, identifier='teacher@test.com', password='TestPass123!')
        self.assertEqual(user, self.teacher_user)

    def test_authenticate_with_teacher_id(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(request, identifier='MAJ1998-01', password='TestPass123!')
        self.assertEqual(user, self.teacher_user)

    def test_authenticate_wrong_password_returns_none(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(request, identifier='teacher@test.com', password='WrongPass!')
        self.assertIsNone(user)

    def test_authenticate_nonexistent_identifier_returns_none(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(request, identifier='FAKE-ID-999', password='TestPass123!')
        self.assertIsNone(user)

    def test_authenticate_inactive_user_returns_none(self):
        self.teacher_user.is_active = False
        self.teacher_user.save()
        request = self.factory.get('/')
        user = self.backend.authenticate(request, identifier='teacher@test.com', password='TestPass123!')
        self.assertIsNone(user)

    def test_get_user_returns_active_user(self):
        user = self.backend.get_user(self.teacher_user.pk)
        self.assertEqual(user, self.teacher_user)

    def test_get_user_returns_none_for_inactive(self):
        self.teacher_user.is_active = False
        self.teacher_user.save()
        user = self.backend.get_user(self.teacher_user.pk)
        self.assertIsNone(user)
