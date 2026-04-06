# Enrollment System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build role-based enrollment APIs and UI for Admin/Principal (enroll teachers + students school-wide) and Teacher (enroll students in their own sections), with auto-ID generation, welcome emails, and admission auto-finalization.

**Architecture:** New enrollment views/serializers per app (admin_panel, teacher), shared email utility. Frontend: shared form components + enrollment pages per role. All queries use select_related/only() — zero N+1.

**Tech Stack:** Django 5, DRF, SimpleJWT, PostgreSQL, React 18, Vite, Tailwind CSS, Axios

**Spec:** `docs/superpowers/specs/2026-04-04-enrollment-system-design.md`

---

## File Map

### Files to Create

| File | Responsibility |
|------|---------------|
| `backend/apps/accounts/emails.py` | Welcome email template and send function |
| `backend/apps/admin_panel/enrollment_serializers.py` | Teacher + Student enrollment serializers for admin/principal |
| `backend/apps/admin_panel/enrollment_views.py` | EnrollTeacherView, EnrollStudentView for admin/principal |
| `backend/apps/teacher/enrollment_serializers.py` | Student enrollment serializer with section scope validation |
| `backend/apps/teacher/enrollment_views.py` | EnrollStudentView for teacher |
| `backend/tests/accounts/test_emails.py` | Welcome email tests |
| `backend/tests/admin_panel/test_enrollment.py` | Admin/principal enrollment API tests |
| `backend/tests/teacher/__init__.py` | Teacher test package init |
| `backend/tests/teacher/test_enrollment.py` | Teacher enrollment API tests |
| `frontend/src/services/admin/enrollmentService.ts` | Admin enrollment API calls |
| `frontend/src/services/teacher/enrollmentService.ts` | Teacher enrollment API calls |
| `frontend/src/components/enrollment/TeacherEnrollmentForm.tsx` | Shared teacher enrollment form component |
| `frontend/src/components/enrollment/StudentEnrollmentForm.tsx` | Shared student enrollment form component |
| `frontend/src/components/enrollment/EnrollmentSuccessModal.tsx` | Success modal with ID display, copy, print |
| `frontend/src/pages/admin/EnrollmentPage.tsx` | Enrollment page for admin/principal |
| `frontend/src/pages/teacher/EnrollmentPage.tsx` | Enrollment page for teacher |

### Files to Modify

| File | Changes |
|------|---------|
| `backend/apps/accounts/permissions.py` | Remove IsParent |
| `backend/apps/admin_panel/urls.py` | Add enrollment routes |
| `backend/apps/admin_panel/views.py` | Modify admission finalize to auto-create student |
| `backend/apps/teacher/urls.py` | Add teacher enrollment route |
| `frontend/src/App.tsx` | Add enrollment page routes |
| `frontend/src/components/layout/navConfig.ts` | Add Enrollment nav items |

---

## Task 1: Backend — Welcome Email Utility

**Files:**
- Create: `backend/apps/accounts/emails.py`
- Create: `backend/tests/accounts/test_emails.py`

- [ ] **Step 1: Write email tests**

Create `backend/tests/accounts/test_emails.py`:

```python
from unittest.mock import patch
from django.test import TestCase
from apps.accounts.emails import send_welcome_email


class SendWelcomeEmailTest(TestCase):
    @patch('apps.accounts.emails.send_mail')
    def test_sends_teacher_welcome(self, mock_send):
        send_welcome_email(
            email='teacher@test.com',
            first_name='John',
            role='teacher',
            generated_id='MAJ1998-14',
        )
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[1]
        self.assertIn('MAJ1998-14', call_kwargs['message'])
        self.assertIn('John', call_kwargs['message'])
        self.assertEqual(call_kwargs['recipient_list'], ['teacher@test.com'])

    @patch('apps.accounts.emails.send_mail')
    def test_sends_student_welcome(self, mock_send):
        send_welcome_email(
            email='student@test.com',
            first_name='Jane',
            role='student',
            generated_id='MAJ1998-42',
        )
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[1]
        self.assertIn('MAJ1998-42', call_kwargs['message'])
        self.assertIn('student', call_kwargs['message'])
```

- [ ] **Step 2: Run tests — expect ImportError**

Run: `cd /home/development1/Desktop/Acadrix/backend && DJANGO_SETTINGS_MODULE=config.settings_test python manage.py test tests.accounts.test_emails -v 2`

- [ ] **Step 3: Implement welcome email**

Create `backend/apps/accounts/emails.py`:

```python
from django.conf import settings
from django.core.mail import send_mail


def send_welcome_email(email: str, first_name: str, role: str, generated_id: str) -> bool:
    """Send welcome email with login ID to newly enrolled user.
    Returns True if sent, False on failure.
    """
    login_url = settings.CORS_ALLOWED_ORIGINS[0] + '/login'
    subject = 'Welcome to Acadrix — Your Account is Ready'
    message = (
        f'Hello {first_name},\n\n'
        f'You have been enrolled in Acadrix as a {role}.\n\n'
        f'Your login ID: {generated_id}\n\n'
        f'To get started:\n'
        f'1. Go to {login_url}\n'
        f'2. Enter your ID: {generated_id}\n'
        f'3. Set your password on first login\n\n'
        f'If you have any questions, contact your administrator.\n\n'
        f'— Acadrix Team'
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception:
        return False
```

- [ ] **Step 4: Run tests — expect pass**

Run: `cd /home/development1/Desktop/Acadrix/backend && DJANGO_SETTINGS_MODULE=config.settings_test python manage.py test tests.accounts.test_emails -v 2`

Expected: 2/2 PASS

---

## Task 2: Backend — Admin/Principal Enrollment Serializers

**Files:**
- Create: `backend/apps/admin_panel/enrollment_serializers.py`

- [ ] **Step 1: Create enrollment serializers**

Create `backend/apps/admin_panel/enrollment_serializers.py`:

```python
from rest_framework import serializers
from django.db import transaction

from apps.accounts.models import User
from apps.accounts.utils import generate_id
from apps.accounts.emails import send_welcome_email
from apps.teacher.models import TeacherProfile
from apps.student.models import StudentProfile, Guardian


class GuardianInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    relationship = serializers.CharField(max_length=30, default='parent')
    phone = serializers.CharField(max_length=20, required=False, default='')
    email = serializers.EmailField(required=False, default='')
    is_primary = serializers.BooleanField(default=False)


class EnrollTeacherSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')
    department = serializers.IntegerField(required=False, allow_null=True, default=None)
    title = serializers.CharField(max_length=60, required=False, default='')
    qualification = serializers.CharField(max_length=200, required=False, default='')
    specialization = serializers.CharField(max_length=200, required=False, default='')
    date_joined = serializers.DateField(required=False, allow_null=True, default=None)
    employment_status = serializers.ChoiceField(
        choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract')],
        default='full_time',
    )
    employee_id = serializers.CharField(max_length=20, required=False, allow_null=True, default=None)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_employee_id(self, value):
        if value and TeacherProfile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError('This ID is already in use.')
        return value

    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id', None)
        department_id = validated_data.pop('department', None)

        if not employee_id:
            employee_id = generate_id('teacher')

        with transaction.atomic():
            user = User(
                username=validated_data['email'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''),
                role='teacher',
            )
            user.set_unusable_password()
            user.save()

            TeacherProfile.objects.create(
                user=user,
                employee_id=employee_id,
                department_id=department_id,
                title=validated_data.get('title', ''),
                qualification=validated_data.get('qualification', ''),
                specialization=validated_data.get('specialization', ''),
                date_joined=validated_data.get('date_joined'),
                employment_status=validated_data.get('employment_status', 'full_time'),
            )

        email_sent = send_welcome_email(
            email=user.email, first_name=user.first_name,
            role='teacher', generated_id=employee_id,
        )

        return {'user': user, 'employee_id': employee_id, 'email_sent': email_sent}


class EnrollStudentSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')
    date_of_birth = serializers.DateField(required=False, allow_null=True, default=None)
    address = serializers.CharField(required=False, default='')
    section = serializers.IntegerField(required=False, allow_null=True, default=None)
    house = serializers.CharField(max_length=40, required=False, default='')
    student_id = serializers.CharField(max_length=20, required=False, allow_null=True, default=None)
    guardians = GuardianInputSerializer(many=True, required=False, default=[])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_student_id(self, value):
        if value and StudentProfile.objects.filter(student_id=value).exists():
            raise serializers.ValidationError('This ID is already in use.')
        return value

    def create(self, validated_data):
        student_id = validated_data.pop('student_id', None)
        guardians_data = validated_data.pop('guardians', [])
        section_id = validated_data.pop('section', None)

        if not student_id:
            student_id = generate_id('student')

        with transaction.atomic():
            user = User(
                username=validated_data['email'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''),
                role='student',
            )
            user.set_unusable_password()
            user.save()

            profile = StudentProfile.objects.create(
                user=user, student_id=student_id, section_id=section_id,
                house=validated_data.get('house', ''),
                date_of_birth=validated_data.get('date_of_birth'),
                address=validated_data.get('address', ''),
            )

            if guardians_data:
                Guardian.objects.bulk_create([
                    Guardian(student=profile, **g) for g in guardians_data
                ])

        email_sent = send_welcome_email(
            email=user.email, first_name=user.first_name,
            role='student', generated_id=student_id,
        )

        return {'user': user, 'student_id': student_id, 'email_sent': email_sent}
```

---

## Task 3: Backend — Admin/Principal Enrollment Views + Routes + Tests

**Files:**
- Create: `backend/apps/admin_panel/enrollment_views.py`
- Modify: `backend/apps/admin_panel/urls.py`
- Modify: `backend/apps/accounts/permissions.py`
- Create: `backend/tests/admin_panel/test_enrollment.py`

- [ ] **Step 1: Write enrollment tests**

Create `backend/tests/admin_panel/test_enrollment.py`:

```python
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
```

- [ ] **Step 2: Create enrollment views**

Create `backend/apps/admin_panel/enrollment_views.py`:

```python
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrPrincipal
from apps.accounts.serializers import UserSerializer

from .enrollment_serializers import EnrollTeacherSerializer, EnrollStudentSerializer


class EnrollTeacherView(GenericAPIView):
    """POST /api/v1/admin/enroll/teacher/ — enroll a new teacher."""
    permission_classes = [IsAdminOrPrincipal]
    serializer_class = EnrollTeacherSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'employee_id': result['employee_id'],
                'email_sent': result['email_sent'],
            },
            'message': 'Teacher enrolled successfully.',
        }, status=status.HTTP_201_CREATED)


class EnrollStudentView(GenericAPIView):
    """POST /api/v1/admin/enroll/student/ — enroll a new student."""
    permission_classes = [IsAdminOrPrincipal]
    serializer_class = EnrollStudentSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'student_id': result['student_id'],
                'email_sent': result['email_sent'],
            },
            'message': 'Student enrolled successfully.',
        }, status=status.HTTP_201_CREATED)
```

- [ ] **Step 3: Add routes to admin_panel/urls.py**

Add imports and URL patterns for `EnrollTeacherView` and `EnrollStudentView`:

```python
from .enrollment_views import EnrollTeacherView, EnrollStudentView
```

Add to `urlpatterns`:
```python
path('enroll/teacher/', EnrollTeacherView.as_view(), name='enroll-teacher'),
path('enroll/student/', EnrollStudentView.as_view(), name='enroll-student'),
```

- [ ] **Step 4: Remove IsParent from permissions.py**

In `backend/apps/accounts/permissions.py`, delete the `IsParent` class.

- [ ] **Step 5: Run tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && DJANGO_SETTINGS_MODULE=config.settings_test python manage.py test tests.admin_panel.test_enrollment -v 2`

Expected: All 7 tests PASS.

---

## Task 4: Backend — Teacher Enrollment (Section-Scoped)

**Files:**
- Create: `backend/apps/teacher/enrollment_serializers.py`
- Create: `backend/apps/teacher/enrollment_views.py`
- Modify: `backend/apps/teacher/urls.py`
- Create: `backend/tests/teacher/__init__.py`
- Create: `backend/tests/teacher/test_enrollment.py`

- [ ] **Step 1: Write teacher enrollment tests**

Create `backend/tests/teacher/__init__.py` (empty).
Create `backend/tests/teacher/test_enrollment.py`:

```python
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
```

- [ ] **Step 2: Create teacher enrollment serializer**

Create `backend/apps/teacher/enrollment_serializers.py`:

```python
from rest_framework import serializers
from apps.shared.models import Course


class TeacherEnrollStudentSerializer(serializers.Serializer):
    section = serializers.IntegerField()

    def validate_section(self, value):
        teacher_user = self.context['request'].user
        teacher_sections = (
            Course.objects
            .filter(teacher=teacher_user, academic_year__is_current=True)
            .values_list('section_id', flat=True)
            .distinct()
        )
        if value not in teacher_sections:
            raise serializers.ValidationError(
                'You can only enroll students in your assigned sections.'
            )
        return value
```

- [ ] **Step 3: Create teacher enrollment view**

Create `backend/apps/teacher/enrollment_views.py`:

```python
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.permissions import IsTeacher
from apps.accounts.serializers import UserSerializer
from apps.admin_panel.enrollment_serializers import EnrollStudentSerializer

from .enrollment_serializers import TeacherEnrollStudentSerializer


class TeacherEnrollStudentView(GenericAPIView):
    """POST /api/v1/teacher/enroll/student/ — enroll student in teacher's section."""
    permission_classes = [IsTeacher]
    serializer_class = EnrollStudentSerializer

    def post(self, request):
        section_id = request.data.get('section')
        if not section_id:
            return Response(
                {'success': False, 'error': 'Section is required for teacher enrollment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        scope_serializer = TeacherEnrollStudentSerializer(
            data={'section': section_id}, context={'request': request},
        )
        if not scope_serializer.is_valid():
            raise PermissionDenied(
                scope_serializer.errors.get('section', ['Access denied.'])[0]
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)

        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'student_id': result['student_id'],
                'email_sent': result['email_sent'],
            },
            'message': 'Student enrolled successfully.',
        }, status=status.HTTP_201_CREATED)
```

- [ ] **Step 4: Add route to teacher/urls.py**

Add import and path:
```python
from apps.teacher.enrollment_views import TeacherEnrollStudentView
```
```python
path('enroll/student/', TeacherEnrollStudentView.as_view(), name='enroll-student'),
```

- [ ] **Step 5: Run tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && DJANGO_SETTINGS_MODULE=config.settings_test python manage.py test tests.teacher.test_enrollment -v 2`

Expected: All 4 tests PASS.

---

## Task 5: Backend — Admission Finalize Auto-Create Student

**Files:**
- Modify: `backend/apps/admin_panel/views.py`

- [ ] **Step 1: Modify perform_update in AdmissionApplicationViewSet**

Add imports at top of `backend/apps/admin_panel/views.py`:

```python
from django.db import transaction
from apps.accounts.utils import generate_id
from apps.accounts.emails import send_welcome_email
```

Replace the `perform_update` method and add `_create_student_from_application`:

```python
def perform_update(self, serializer):
    instance = serializer.save(reviewed_by=self.request.user)
    if instance.status == 'finalized' and instance.student_created is None:
        self._create_student_from_application(instance)

def _create_student_from_application(self, application):
    if User.objects.filter(email=application.applicant_email).exists():
        return

    try:
        student_id = generate_id('student')
    except ValueError:
        return

    name_parts = application.applicant_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''

    section = None
    if application.grade_applying:
        section = (
            application.grade_applying.sections
            .filter(academic_year__is_current=True)
            .order_by('name')
            .first()
        )

    with transaction.atomic():
        user = User(
            username=application.applicant_email,
            email=application.applicant_email,
            first_name=first_name, last_name=last_name,
            phone=application.applicant_phone, role='student',
        )
        user.set_unusable_password()
        user.save()

        profile = StudentProfile.objects.create(
            user=user, student_id=student_id,
            section=section, date_of_birth=application.date_of_birth,
        )

        if application.guardian_name:
            from apps.student.models import Guardian
            Guardian.objects.create(
                student=profile, name=application.guardian_name,
                phone=application.guardian_phone,
                email=application.guardian_email, is_primary=True,
            )

        application.student_created = profile
        application.save(update_fields=['student_created'])

    send_welcome_email(
        email=user.email, first_name=first_name,
        role='student', generated_id=student_id,
    )
```

- [ ] **Step 2: Run all backend tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && DJANGO_SETTINGS_MODULE=config.settings_test python manage.py test tests -v 2`

Expected: All tests PASS.

---

## Task 6: Frontend — Enrollment Services

**Files:**
- Create: `frontend/src/services/admin/enrollmentService.ts`
- Create: `frontend/src/services/teacher/enrollmentService.ts`

- [ ] **Step 1: Create admin enrollment service**

Create directory `frontend/src/services/admin/` if needed.

Create `frontend/src/services/admin/enrollmentService.ts`:

```typescript
import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface EnrollTeacherRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: number | null
  title?: string
  qualification?: string
  specialization?: string
  date_joined?: string | null
  employment_status?: 'full_time' | 'part_time' | 'contract'
  employee_id?: string | null
}

interface EnrollStudentRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string | null
  address?: string
  section?: number | null
  house?: string
  student_id?: string | null
  guardians?: { name: string; relationship: string; phone?: string; email?: string; is_primary: boolean }[]
}

interface EnrollmentResponse {
  success: true
  data: { user: AuthUser; employee_id?: string; student_id?: string; email_sent: boolean }
  message: string
}

export const adminEnrollmentService = {
  async enrollTeacher(data: EnrollTeacherRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/admin/enroll/teacher/', data)
    return response.data
  },

  async enrollStudent(data: EnrollStudentRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/admin/enroll/student/', data)
    return response.data
  },
}
```

- [ ] **Step 2: Create teacher enrollment service**

Create directory `frontend/src/services/teacher/` if needed.

Create `frontend/src/services/teacher/enrollmentService.ts`:

```typescript
import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface TeacherEnrollStudentRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string | null
  address?: string
  section: number
  house?: string
  student_id?: string | null
  guardians?: { name: string; relationship: string; phone?: string; email?: string; is_primary: boolean }[]
}

interface EnrollmentResponse {
  success: true
  data: { user: AuthUser; student_id: string; email_sent: boolean }
  message: string
}

export const teacherEnrollmentService = {
  async enrollStudent(data: TeacherEnrollStudentRequest): Promise<EnrollmentResponse['data']> {
    const { data: response } = await api.post<EnrollmentResponse>('/teacher/enroll/student/', data)
    return response.data
  },
}
```

---

## Task 7: Frontend — Enrollment UI Components

**Files:**
- Create: `frontend/src/components/enrollment/EnrollmentSuccessModal.tsx`
- Create: `frontend/src/components/enrollment/TeacherEnrollmentForm.tsx`
- Create: `frontend/src/components/enrollment/StudentEnrollmentForm.tsx`

This task creates all three shared components. The full code for each component should match the Acadrix design system (Material Design 3 tokens, Tailwind, rounded-xl inputs, primary color buttons). See the spec Section 5 for UI details.

Each component:
- **EnrollmentSuccessModal** — shows generated ID, name, email, copy-to-clipboard, print (opens new window), "Enroll Another" and "Done" buttons
- **TeacherEnrollmentForm** — 2-column grid form with all teacher fields, optional custom ID toggle, submit button
- **StudentEnrollmentForm** — 2-column grid form with student fields, guardian section (add/remove), optional custom ID, section dropdown (required prop for teacher enrollment)

The components accept callbacks (`onSubmit`, `onClose`, `onEnrollAnother`) and display loading/error states internally.

- [ ] **Step 1: Create all three component files**

Create directory `frontend/src/components/enrollment/`.

Create `EnrollmentSuccessModal.tsx`, `TeacherEnrollmentForm.tsx`, and `StudentEnrollmentForm.tsx` following the Acadrix design patterns (see existing LoginPage.tsx for styling reference). Key patterns: `bg-surface-container-lowest`, `rounded-xl`, `border-outline-variant/25`, `text-on-surface`, `font-headline`, `material-symbols-outlined` icons.

For the print button, use `window.open()` and construct the print page content using DOM methods (createElement/appendChild) rather than document.write to avoid XSS concerns.

---

## Task 8: Frontend — Enrollment Pages + Routes + Nav

**Files:**
- Create: `frontend/src/pages/admin/EnrollmentPage.tsx`
- Create: `frontend/src/pages/teacher/EnrollmentPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/layout/navConfig.ts`

- [ ] **Step 1: Create admin enrollment page**

Create `frontend/src/pages/admin/EnrollmentPage.tsx` with:
- Tab toggle (Enroll Teacher | Enroll Student)
- Loads departments and sections on mount via API
- Uses `TeacherEnrollmentForm` and `StudentEnrollmentForm` components
- Shows `EnrollmentSuccessModal` on successful enrollment

- [ ] **Step 2: Create teacher enrollment page**

Create `frontend/src/pages/teacher/EnrollmentPage.tsx` with:
- Only student enrollment (no teacher tab)
- Loads teacher's assigned sections on mount via `/teacher/my-sections/`
- Uses `StudentEnrollmentForm` with `sectionRequired={true}`
- Shows `EnrollmentSuccessModal` on success

- [ ] **Step 3: Add routes to App.tsx**

Add imports:
```typescript
import AdminEnrollment from '@/pages/admin/EnrollmentPage'
import TeacherEnrollment from '@/pages/teacher/EnrollmentPage'
```

Add routes:
- Admin block: `<Route path="enrollment" element={<AdminEnrollment />} />`
- Principal block: `<Route path="enrollment" element={<AdminEnrollment />} />`
- Teacher block: `<Route path="enrollment" element={<TeacherEnrollment />} />`

- [ ] **Step 4: Add nav items to navConfig.ts**

Add `{ label: 'Enrollment', icon: 'person_add', to: '/admin/enrollment' }` to admin sidebar after Admissions.

Add `{ label: 'Enrollment', icon: 'person_add', to: '/principal/enrollment' }` to principal sidebar after AI Generator.

Add `{ label: 'Enrollment', icon: 'person_add', to: '/teacher/enrollment' }` to teacher sidebar after Gradebook.

- [ ] **Step 5: Run type check and build**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npx tsc --noEmit && npm run build`

Expected: 0 errors, build succeeds.

---

## Task 9: Integration — Full Test Suite

- [ ] **Step 1: Run all backend tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && DJANGO_SETTINGS_MODULE=config.settings_test python manage.py test tests -v 2`

Expected: All tests PASS.

- [ ] **Step 2: Run frontend build**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npx tsc --noEmit && npm run build`

Expected: 0 errors, build succeeds.

- [ ] **Step 3: Fix any issues found**

If tests or build fail, fix and re-run.
