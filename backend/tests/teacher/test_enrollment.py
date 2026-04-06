from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.teacher.models import TeacherProfile
from apps.student.models import StudentProfile
from apps.shared.models import AcademicYear, Grade, Section, Subject, Course, Department
from apps.admin_panel.models import IDConfiguration


class TeacherEnrollStudentTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher',
            first_name='John', last_name='Doe',
        )
        TeacherProfile.objects.create(user=self.teacher_user, employee_id='MAJ1998-01')
        self.client.force_authenticate(user=self.teacher_user)
        IDConfiguration.objects.create(role='student', prefix='MAJ', year='1998')

        self.year = AcademicYear.objects.create(
            label='2025-2026', start_date='2025-06-01',
            end_date='2026-05-31', is_current=True,
        )
        self.grade = Grade.objects.create(level=10, label='Grade 10')
        self.section_a = Section.objects.create(grade=self.grade, name='A', academic_year=self.year)
        self.section_b = Section.objects.create(grade=self.grade, name='B', academic_year=self.year)
        dept = Department.objects.create(name='Science', code='SCI')
        subject = Subject.objects.create(name='Physics', code='PHY', department=dept)
        Course.objects.create(
            subject=subject, section=self.section_a,
            teacher=self.teacher_user, academic_year=self.year,
        )

    @patch('apps.admin_panel.enrollment_serializers.send_welcome_email', return_value=True)
    def test_enroll_student_in_assigned_section(self, mock_email):
        response = self.client.post('/api/v1/teacher/enroll/student/', {
            'first_name': 'Jane', 'last_name': 'Smith',
            'email': 'jane@email.com', 'section': self.section_a.id,
        })
        self.assertEqual(response.status_code, 201)

    def test_enroll_student_in_unassigned_section_fails(self):
        response = self.client.post('/api/v1/teacher/enroll/student/', {
            'first_name': 'Jane', 'last_name': 'Smith',
            'email': 'jane@email.com', 'section': self.section_b.id,
        })
        self.assertEqual(response.status_code, 403)

    def test_enroll_student_without_section_fails(self):
        response = self.client.post('/api/v1/teacher/enroll/student/', {
            'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane@email.com',
        })
        self.assertEqual(response.status_code, 400)

    def test_student_cannot_enroll(self):
        student = User.objects.create_user(
            username='student1', email='student@test.com',
            password='TestPass123!', role='student', first_name='S', last_name='S',
        )
        self.client.force_authenticate(user=student)
        response = self.client.post('/api/v1/teacher/enroll/student/', {
            'first_name': 'Jane', 'last_name': 'Smith',
            'email': 'jane@email.com', 'section': self.section_a.id,
        })
        self.assertEqual(response.status_code, 403)
