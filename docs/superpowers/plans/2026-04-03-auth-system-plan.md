# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build enrollment-based progressive-disclosure authentication with multi-method login (ID+password, Email+OTP, Google OAuth), first-time password setup, and guided tour.

**Architecture:** Django custom auth backend + new OTP/profile models on backend. React multi-step login form with progressive disclosure on frontend. All queries optimized with `select_related`/`only()` — zero N+1.

**Tech Stack:** Django 5, DRF, SimpleJWT, PostgreSQL, React 18, Vite, Tailwind CSS, Axios, react-joyride

**Spec:** `docs/superpowers/specs/2026-04-03-auth-system-design.md`

---

## File Map

### Files to Create

| File | Responsibility |
|------|---------------|
| `backend/apps/accounts/backends.py` | Custom auth backend: resolve identifier (email/ID) → user → check password |
| `backend/apps/accounts/utils.py` | OTP generation, email sending, ID auto-generation helpers |
| `backend/tests/__init__.py` | Test package init |
| `backend/tests/accounts/__init__.py` | Accounts test package init |
| `backend/tests/accounts/test_models.py` | OTP model, UserTourProgress model tests |
| `backend/tests/accounts/test_backends.py` | Custom auth backend tests |
| `backend/tests/accounts/test_views.py` | Identify, verify-otp, set-password, login, forgot/reset password view tests |
| `backend/tests/accounts/test_utils.py` | OTP generation, ID generation utility tests |
| `backend/tests/admin_panel/__init__.py` | Admin panel test package init |
| `backend/tests/admin_panel/test_id_config.py` | IDConfiguration model and API tests |

### Files to Modify

| File | Changes |
|------|---------|
| `backend/apps/accounts/models.py` | Remove PARENT role, add OTP model, add UserTourProgress model |
| `backend/apps/accounts/serializers.py` | Add IdentifySerializer, VerifyOTPSerializer, SetPasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, TourProgressSerializer |
| `backend/apps/accounts/views.py` | Add IdentifyView, VerifyOTPView, SetPasswordView, ForgotPasswordView, ResetPasswordView, TourProgressView. Modify GoogleOAuthCallbackView |
| `backend/apps/accounts/urls.py` | Add new URL patterns for all new views |
| `backend/apps/principal/models.py` | Add PrincipalProfile model |
| `backend/apps/admin_panel/models.py` | Add IDConfiguration model |
| `backend/apps/admin_panel/serializers.py` | Add IDConfigurationSerializer |
| `backend/apps/admin_panel/views.py` | Add IDConfigurationViewSet |
| `backend/apps/admin_panel/urls.py` | Register IDConfiguration routes |
| `backend/apps/student/models.py` | Modify Guardian to contact-only (remove parent FK), update PaymentMethod |
| `backend/config/settings.py` | Add custom auth backend, add OTP throttle rates |
| `frontend/src/services/shared/authService.ts` | Add identify, verifyOTP, setPassword, forgotPassword, resetPassword, tourProgress methods |
| `frontend/src/contexts/AuthContext.tsx` | Remove parent role, add multi-method login support (loginWithToken helper) |
| `frontend/src/pages/auth/LoginPage.tsx` | Complete rewrite — progressive disclosure multi-step form |
| `frontend/package.json` | Add react-joyride dependency |

---

## Task 1: Backend Models — OTP, UserTourProgress, Remove PARENT Role

**Files:**
- Modify: `backend/apps/accounts/models.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/accounts/__init__.py`
- Create: `backend/tests/accounts/test_models.py`

- [ ] **Step 1: Update User model — remove PARENT role**

In `backend/apps/accounts/models.py`, replace the Role class:

```python
class Role(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    PRINCIPAL = 'principal', 'Principal'
    TEACHER = 'teacher', 'Teacher'
    STUDENT = 'student', 'Student'
```

- [ ] **Step 2: Add OTP model**

Append to `backend/apps/accounts/models.py`:

```python
import secrets
from django.utils import timezone


class OTP(models.Model):
    """Email-based OTP for login and forgot-password flows."""
    class Purpose(models.TextChoices):
        LOGIN = 'login', 'Login'
        FORGOT_PASSWORD = 'forgot_password', 'Forgot Password'

    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=Purpose.choices)
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otps'
        indexes = [
            models.Index(fields=['email', 'purpose', 'is_used']),
        ]

    def __str__(self):
        return f'OTP for {self.email} ({self.purpose})'

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired and self.attempts < 5
```

- [ ] **Step 3: Add UserTourProgress model**

Append to `backend/apps/accounts/models.py`:

```python
class UserTourProgress(models.Model):
    """Tracks which guided tours a user has completed."""
    user = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE,
        related_name='tour_progress',
    )
    tour_key = models.CharField(max_length=60)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_tour_progress'
        unique_together = ['user', 'tour_key']
        indexes = [
            models.Index(fields=['user', 'tour_key']),
        ]

    def __str__(self):
        return f'{self.user} — {self.tour_key}'
```

- [ ] **Step 4: Write tests for new models**

Create `backend/tests/__init__.py` (empty file).
Create `backend/tests/accounts/__init__.py` (empty file).
Create `backend/tests/accounts/test_models.py`:

```python
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests.accounts.test_models -v 2`

Expected: All 7 tests PASS.

- [ ] **Step 6: Create and run migration**

Run:
```bash
cd /home/development1/Desktop/Acadrix/backend
python manage.py makemigrations accounts
python manage.py migrate
```

- [ ] **Step 7: Commit**

```bash
git add backend/apps/accounts/models.py backend/tests/
git commit -m "feat(accounts): add OTP and UserTourProgress models, remove PARENT role"
```

---

## Task 2: Backend Model — PrincipalProfile

**Files:**
- Modify: `backend/apps/principal/models.py`

- [ ] **Step 1: Add PrincipalProfile model**

Add at the top of `backend/apps/principal/models.py` (after existing imports, before `SourceDocument`):

```python
class PrincipalProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='principal_profile',
        limit_choices_to={'role': 'principal'},
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        'shared.Department', on_delete=models.SET_NULL,
        null=True, related_name='principals',
    )
    title = models.CharField(max_length=60, blank=True)  # "Principal", "Vice Principal"
    qualification = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    date_joined = models.DateField(null=True, blank=True)
    employment_status = models.CharField(
        max_length=20,
        choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract')],
        default='full_time',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'principal_profiles'
        indexes = [models.Index(fields=['employee_id'])]

    def __str__(self):
        return f'{self.user.full_name} ({self.employee_id})'
```

- [ ] **Step 2: Create and run migration**

Run:
```bash
cd /home/development1/Desktop/Acadrix/backend
python manage.py makemigrations principal
python manage.py migrate
```

- [ ] **Step 3: Commit**

```bash
git add backend/apps/principal/models.py backend/apps/principal/migrations/
git commit -m "feat(principal): add PrincipalProfile model with employee_id"
```

---

## Task 3: Backend Model — IDConfiguration + Guardian/PaymentMethod Updates

**Files:**
- Modify: `backend/apps/admin_panel/models.py`
- Modify: `backend/apps/student/models.py`
- Create: `backend/tests/admin_panel/__init__.py`
- Create: `backend/tests/admin_panel/test_id_config.py`

- [ ] **Step 1: Add IDConfiguration model**

Append to `backend/apps/admin_panel/models.py`:

```python
class IDConfiguration(models.Model):
    """Admin-configurable ID prefixes per role."""
    ROLE_CHOICES = [
        ('principal', 'Principal'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    prefix = models.CharField(max_length=3, help_text='3 uppercase letters, e.g. MAJ')
    year = models.CharField(max_length=4, help_text='4-digit year, e.g. 1998')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'id_configurations'

    def __str__(self):
        return f'{self.role}: {self.prefix}{self.year}'

    @property
    def full_prefix(self):
        return f'{self.prefix}{self.year}'
```

- [ ] **Step 2: Update Guardian model — remove parent FK, use contact fields**

In `backend/apps/student/models.py`, replace the entire `Guardian` class:

```python
class Guardian(models.Model):
    """Guardian contact info stored on student profile. No separate login."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='guardians')
    name = models.CharField(max_length=120)
    relationship = models.CharField(max_length=30, default='parent')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guardians'

    def __str__(self):
        return f'{self.name} ({self.relationship}) → {self.student}'
```

- [ ] **Step 3: Update PaymentMethod — change parent FK to student user**

In `backend/apps/student/models.py`, replace the `PaymentMethod` class's `parent` field:

```python
class PaymentMethod(models.Model):
    class Type(models.TextChoices):
        VISA = 'visa', 'Visa'
        MASTERCARD = 'mastercard', 'Mastercard'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
        PAYPAL = 'paypal', 'PayPal'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='payment_methods',
    )
    method_type = models.CharField(max_length=20, choices=Type.choices)
    display_name = models.CharField(max_length=60)
    last_four = models.CharField(max_length=4, blank=True)
    expiry = models.CharField(max_length=7, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_methods'
        ordering = ['-is_default', '-created_at']
```

- [ ] **Step 4: Write IDConfiguration tests**

Create `backend/tests/admin_panel/__init__.py` (empty file).
Create `backend/tests/admin_panel/test_id_config.py`:

```python
from django.test import TestCase
from apps.admin_panel.models import IDConfiguration


class IDConfigurationModelTest(TestCase):
    def test_full_prefix_property(self):
        config = IDConfiguration(role='teacher', prefix='MAJ', year='1998')
        self.assertEqual(config.full_prefix, 'MAJ1998')

    def test_unique_role_constraint(self):
        IDConfiguration.objects.create(role='teacher', prefix='MAJ', year='1998')
        with self.assertRaises(Exception):
            IDConfiguration.objects.create(role='teacher', prefix='XYZ', year='2000')

    def test_create_all_roles(self):
        for role in ['principal', 'teacher', 'student']:
            IDConfiguration.objects.create(role=role, prefix='MAJ', year='1998')
        self.assertEqual(IDConfiguration.objects.count(), 3)
```

- [ ] **Step 5: Create and run migrations**

Run:
```bash
cd /home/development1/Desktop/Acadrix/backend
python manage.py makemigrations admin_panel student
python manage.py migrate
```

- [ ] **Step 6: Run all tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests -v 2`

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/apps/admin_panel/models.py backend/apps/student/models.py backend/apps/admin_panel/migrations/ backend/apps/student/migrations/ backend/tests/admin_panel/
git commit -m "feat: add IDConfiguration model, update Guardian/PaymentMethod for student-only"
```

---

## Task 4: Backend Utilities — OTP Generation, Email Sending, ID Generation

**Files:**
- Create: `backend/apps/accounts/utils.py`
- Create: `backend/tests/accounts/test_utils.py`

- [ ] **Step 1: Write utility tests first**

Create `backend/tests/accounts/test_utils.py`:

```python
from datetime import timedelta
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from apps.accounts.models import User, OTP
from apps.accounts.utils import generate_otp, send_otp_email, generate_id
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
            email='test@test.com', code='123456',
            purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        send_otp_email(otp)
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        self.assertIn('123456', call_args[1].get('message', '') or call_args[0][1])
```

- [ ] **Step 2: Run tests — expect failures (utils not created yet)**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests.accounts.test_utils -v 2`

Expected: ImportError — `cannot import name 'generate_otp' from 'apps.accounts.utils'`

- [ ] **Step 3: Implement utilities**

Create `backend/apps/accounts/utils.py`:

```python
import secrets
from datetime import timedelta

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from apps.accounts.models import OTP
from apps.admin_panel.models import IDConfiguration


def generate_otp(email: str, purpose: str) -> OTP:
    """Generate a 6-digit OTP for the given email and purpose.

    Raises ValueError if rate limit exceeded (3 per 15 minutes).
    """
    window_start = timezone.now() - timedelta(minutes=15)
    recent_count = OTP.objects.filter(
        email=email,
        purpose=purpose,
        created_at__gte=window_start,
    ).count()

    if recent_count >= 3:
        raise ValueError('Too many OTP requests. Please wait before trying again.')

    # Invalidate previous unused OTPs for same email+purpose
    OTP.objects.filter(
        email=email, purpose=purpose, is_used=False,
    ).update(is_used=True)

    code = ''.join(secrets.choice('0123456789') for _ in range(6))
    otp = OTP.objects.create(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=5),
    )
    return otp


def send_otp_email(otp: OTP) -> None:
    """Send OTP code via email."""
    subject = 'Acadrix — Your verification code'
    message = (
        f'Your Acadrix verification code is: {otp.code}\n\n'
        f'This code expires in 5 minutes.\n'
        f'If you did not request this, please ignore this email.'
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[otp.email],
        fail_silently=False,
    )


def mask_email(email: str) -> str:
    """Mask email for display: 'ramesh@gmail.com' → 'r****h@gmail.com'"""
    local, domain = email.split('@')
    if len(local) <= 2:
        masked_local = local[0] + '*'
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    return f'{masked_local}@{domain}'


def generate_id(role: str, suffix: str | None = None) -> str:
    """Generate an ID for the given role using IDConfiguration.

    If suffix is provided, uses it directly.
    Otherwise, auto-increments from the highest existing suffix.
    Raises ValueError if no IDConfiguration exists for the role.
    """
    try:
        config = IDConfiguration.objects.get(role=role)
    except IDConfiguration.DoesNotExist:
        raise ValueError(f'No ID configuration found for role: {role}')

    full_prefix = config.full_prefix

    if suffix is not None:
        return f'{full_prefix}-{suffix}'

    # Find highest existing suffix for this prefix
    from apps.teacher.models import TeacherProfile
    from apps.student.models import StudentProfile
    from apps.principal.models import PrincipalProfile

    model_map = {
        'teacher': (TeacherProfile, 'employee_id'),
        'student': (StudentProfile, 'student_id'),
        'principal': (PrincipalProfile, 'employee_id'),
    }

    model_class, id_field = model_map[role]
    filter_kwargs = {f'{id_field}__startswith': f'{full_prefix}-'}
    last_entry = (
        model_class.objects
        .filter(**filter_kwargs)
        .order_by(f'-{id_field}')
        .values_list(id_field, flat=True)
        .first()
    )

    if last_entry:
        last_suffix = last_entry.split('-')[-1]
        next_num = int(last_suffix) + 1
    else:
        next_num = 1

    return f'{full_prefix}-{next_num:02d}'
```

- [ ] **Step 4: Run tests — expect all to pass**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests.accounts.test_utils -v 2`

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/apps/accounts/utils.py backend/tests/accounts/test_utils.py
git commit -m "feat(accounts): add OTP generation, email sending, and ID auto-generation utilities"
```

---

## Task 5: Backend — Custom Auth Backend

**Files:**
- Create: `backend/apps/accounts/backends.py`
- Create: `backend/tests/accounts/test_backends.py`
- Modify: `backend/config/settings.py`

- [ ] **Step 1: Write backend tests**

Create `backend/tests/accounts/test_backends.py`:

```python
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
        TeacherProfile.objects.create(
            user=self.teacher_user, employee_id='MAJ1998-01',
        )

        self.student_user = User.objects.create_user(
            username='student1', email='student@test.com',
            password='TestPass123!', role='student',
            first_name='Jane', last_name='Doe',
        )
        StudentProfile.objects.create(
            user=self.student_user, student_id='MAJ1998-01',
        )

        self.admin_user = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )

    def test_authenticate_with_email(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(
            request, identifier='teacher@test.com', password='TestPass123!',
        )
        self.assertEqual(user, self.teacher_user)

    def test_authenticate_with_teacher_id(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(
            request, identifier='MAJ1998-01', password='TestPass123!',
        )
        # Teacher ID is checked first
        self.assertEqual(user, self.teacher_user)

    def test_authenticate_wrong_password_returns_none(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(
            request, identifier='teacher@test.com', password='WrongPass!',
        )
        self.assertIsNone(user)

    def test_authenticate_nonexistent_identifier_returns_none(self):
        request = self.factory.get('/')
        user = self.backend.authenticate(
            request, identifier='FAKE-ID-999', password='TestPass123!',
        )
        self.assertIsNone(user)

    def test_authenticate_inactive_user_returns_none(self):
        self.teacher_user.is_active = False
        self.teacher_user.save()
        request = self.factory.get('/')
        user = self.backend.authenticate(
            request, identifier='teacher@test.com', password='TestPass123!',
        )
        self.assertIsNone(user)

    def test_get_user_returns_active_user(self):
        user = self.backend.get_user(self.teacher_user.pk)
        self.assertEqual(user, self.teacher_user)

    def test_get_user_returns_none_for_inactive(self):
        self.teacher_user.is_active = False
        self.teacher_user.save()
        user = self.backend.get_user(self.teacher_user.pk)
        self.assertIsNone(user)
```

- [ ] **Step 2: Run tests — expect ImportError**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests.accounts.test_backends -v 2`

Expected: ImportError — `cannot import name 'MultiMethodAuthBackend'`

- [ ] **Step 3: Implement custom auth backend**

Create `backend/apps/accounts/backends.py`:

```python
from django.contrib.auth import get_user_model

User = get_user_model()


class MultiMethodAuthBackend:
    """
    Authenticates users by:
    1. Email + password (all roles)
    2. Employee ID + password (teacher, principal)
    3. Student ID + password (student)
    """

    def authenticate(self, request, identifier=None, password=None, **kwargs):
        if not identifier or not password:
            return None

        user = self._resolve_user(identifier)
        if user is None:
            return None

        if not user.is_active:
            return None

        if user.check_password(password):
            return user

        return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
            return user if user.is_active else None
        except User.DoesNotExist:
            return None

    def _resolve_user(self, identifier: str):
        """Resolve an identifier (email or ID) to a User instance.

        Uses select_related to avoid N+1 — single query per lookup.
        """
        # Email path: contains @
        if '@' in identifier:
            return (
                User.objects
                .filter(email=identifier)
                .only('id', 'email', 'password', 'role', 'is_active',
                      'first_name', 'last_name')
                .first()
            )

        # ID path: try teacher → student → principal (short-circuit)
        from apps.teacher.models import TeacherProfile
        from apps.student.models import StudentProfile
        from apps.principal.models import PrincipalProfile

        teacher = (
            TeacherProfile.objects
            .select_related('user')
            .filter(employee_id=identifier, is_active=True)
            .only('user__id', 'user__email', 'user__password', 'user__role',
                  'user__is_active', 'user__first_name', 'user__last_name',
                  'employee_id', 'is_active')
            .first()
        )
        if teacher:
            return teacher.user

        student = (
            StudentProfile.objects
            .select_related('user')
            .filter(student_id=identifier, is_active=True)
            .only('user__id', 'user__email', 'user__password', 'user__role',
                  'user__is_active', 'user__first_name', 'user__last_name',
                  'student_id', 'is_active')
            .first()
        )
        if student:
            return student.user

        principal = (
            PrincipalProfile.objects
            .select_related('user')
            .filter(employee_id=identifier, is_active=True)
            .only('user__id', 'user__email', 'user__password', 'user__role',
                  'user__is_active', 'user__first_name', 'user__last_name',
                  'employee_id', 'is_active')
            .first()
        )
        if principal:
            return principal.user

        return None
```

- [ ] **Step 4: Add custom backend to settings**

In `backend/config/settings.py`, update `AUTHENTICATION_BACKENDS`:

```python
AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.MultiMethodAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]
```

Also add new throttle rates:

```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '20/minute',
    'user': '60/minute',
    'login': '5/minute',
    'identify': '10/minute',
    'otp': '5/minute',
    'forgot_password': '3/minute',
},
```

- [ ] **Step 5: Run tests — expect all to pass**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests.accounts.test_backends -v 2`

Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/apps/accounts/backends.py backend/tests/accounts/test_backends.py backend/config/settings.py
git commit -m "feat(accounts): add MultiMethodAuthBackend for email/ID-based authentication"
```

---

## Task 6: Backend — Auth Views (Identify, VerifyOTP, SetPassword, ForgotPassword, ResetPassword)

**Files:**
- Modify: `backend/apps/accounts/serializers.py`
- Modify: `backend/apps/accounts/views.py`
- Modify: `backend/apps/accounts/urls.py`
- Create: `backend/tests/accounts/test_views.py`

- [ ] **Step 1: Write view tests**

Create `backend/tests/accounts/test_views.py`:

```python
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
        TeacherProfile.objects.create(
            user=self.teacher_user, employee_id='MAJ1998-01',
        )
        self.admin_user = User.objects.create_user(
            username='admin1', email='admin@test.com',
            password='TestPass123!', role='admin',
            first_name='Admin', last_name='User',
        )

    @patch('apps.accounts.views.send_otp_email')
    def test_identify_email_teacher_returns_otp_method(self, mock_send):
        response = self.client.post('/api/v1/auth/identify/', {
            'identifier': 'teacher@test.com',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'otp')
        mock_send.assert_called_once()

    def test_identify_email_admin_returns_password_method(self):
        response = self.client.post('/api/v1/auth/identify/', {
            'identifier': 'admin@test.com',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'password')

    def test_identify_id_with_password_returns_password(self):
        response = self.client.post('/api/v1/auth/identify/', {
            'identifier': 'MAJ1998-01',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'password')

    def test_identify_id_without_password_returns_set_password(self):
        no_pass_user = User.objects.create_user(
            username='teacher2', email='teacher2@test.com',
            password='', role='teacher',
            first_name='Jane', last_name='Doe',
        )
        no_pass_user.set_unusable_password()
        no_pass_user.save()
        TeacherProfile.objects.create(
            user=no_pass_user, employee_id='MAJ1998-02',
        )
        response = self.client.post('/api/v1/auth/identify/', {
            'identifier': 'MAJ1998-02',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['method'], 'set_password')

    def test_identify_unknown_email_returns_404(self):
        response = self.client.post('/api/v1/auth/identify/', {
            'identifier': 'nobody@test.com',
        })
        self.assertEqual(response.status_code, 404)

    def test_identify_unknown_id_returns_404(self):
        response = self.client.post('/api/v1/auth/identify/', {
            'identifier': 'FAKE-999',
        })
        self.assertEqual(response.status_code, 404)


class LoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='TestPass123!', role='teacher',
            first_name='John', last_name='Doe',
        )
        TeacherProfile.objects.create(
            user=self.user, employee_id='MAJ1998-01',
        )

    def test_login_with_email(self):
        response = self.client.post('/api/v1/auth/login/', {
            'identifier': 'teacher@test.com',
            'password': 'TestPass123!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_login_with_id(self):
        response = self.client.post('/api/v1/auth/login/', {
            'identifier': 'MAJ1998-01',
            'password': 'TestPass123!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/v1/auth/login/', {
            'identifier': 'MAJ1998-01',
            'password': 'WrongPass!',
        })
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
        otp = OTP.objects.create(
            email='teacher@test.com', code='123456',
            purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = self.client.post('/api/v1/auth/verify-otp/', {
            'email': 'teacher@test.com',
            'otp': '123456',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_verify_wrong_otp(self):
        OTP.objects.create(
            email='teacher@test.com', code='123456',
            purpose='login',
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = self.client.post('/api/v1/auth/verify-otp/', {
            'email': 'teacher@test.com',
            'otp': '000000',
        })
        self.assertEqual(response.status_code, 400)

    def test_verify_expired_otp(self):
        OTP.objects.create(
            email='teacher@test.com', code='123456',
            purpose='login',
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        response = self.client.post('/api/v1/auth/verify-otp/', {
            'email': 'teacher@test.com',
            'otp': '123456',
        })
        self.assertEqual(response.status_code, 400)


class SetPasswordViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='teacher1', email='teacher@test.com',
            password='', role='teacher',
            first_name='John', last_name='Doe',
        )
        self.user.set_unusable_password()
        self.user.save()
        TeacherProfile.objects.create(
            user=self.user, employee_id='MAJ1998-01',
        )

    def test_set_password_first_time(self):
        response = self.client.post('/api/v1/auth/set-password/', {
            'identifier': 'MAJ1998-01',
            'password': 'NewPass123!',
            'confirm_password': 'NewPass123!',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.has_usable_password())

    def test_set_password_mismatch(self):
        response = self.client.post('/api/v1/auth/set-password/', {
            'identifier': 'MAJ1998-01',
            'password': 'NewPass123!',
            'confirm_password': 'Different!',
        })
        self.assertEqual(response.status_code, 400)

    def test_set_password_rejects_if_already_has_password(self):
        self.user.set_password('ExistingPass123!')
        self.user.save()
        response = self.client.post('/api/v1/auth/set-password/', {
            'identifier': 'MAJ1998-01',
            'password': 'NewPass123!',
            'confirm_password': 'NewPass123!',
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
        response = self.client.post('/api/v1/auth/forgot-password/', {
            'email': 'admin@test.com',
        })
        self.assertEqual(response.status_code, 200)
        mock_send.assert_called_once()

    def test_forgot_password_unknown_email(self):
        response = self.client.post('/api/v1/auth/forgot-password/', {
            'email': 'nobody@test.com',
        })
        self.assertEqual(response.status_code, 404)

    def test_reset_password_with_valid_otp(self):
        OTP.objects.create(
            email='admin@test.com', code='123456',
            purpose='forgot_password',
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        response = self.client.post('/api/v1/auth/reset-password/', {
            'email': 'admin@test.com',
            'otp': '123456',
            'new_password': 'BrandNew123!',
            'confirm_password': 'BrandNew123!',
        })
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNew123!'))


class GoogleOAuthRoleRestrictionTest(TestCase):
    """Google OAuth should reject admin/principal roles."""

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
        response = self.client.post('/api/v1/auth/google/callback/', {
            'code': 'fake-code',
        })
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
        response = self.client.post('/api/v1/auth/tour-progress/', {
            'tour_key': 'first_login',
        })
        self.assertEqual(response.status_code, 201)

    def test_complete_tour_duplicate_is_idempotent(self):
        self.client.post('/api/v1/auth/tour-progress/', {'tour_key': 'first_login'})
        response = self.client.post('/api/v1/auth/tour-progress/', {'tour_key': 'first_login'})
        self.assertEqual(response.status_code, 200)
```

- [ ] **Step 2: Rewrite serializers**

Replace `backend/apps/accounts/serializers.py` entirely:

```python
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'full_name', 'avatar_url']
        read_only_fields = fields

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class IdentifySerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=120)


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=120)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            identifier=attrs['identifier'],
            password=attrs['password'],
        )
        if not user or not user.is_active:
            raise serializers.ValidationError('Invalid credentials.')
        attrs['user'] = user
        return attrs


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class SetPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=120)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class TourProgressSerializer(serializers.Serializer):
    tour_key = serializers.CharField(max_length=60)
```

- [ ] **Step 3: Rewrite views**

Replace `backend/apps/accounts/views.py` entirely:

```python
import requests as http_requests
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .backends import MultiMethodAuthBackend
from .models import User, OTP, UserTourProgress
from .serializers import (
    IdentifySerializer, LoginSerializer, UserSerializer,
    VerifyOTPSerializer, SetPasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    TourProgressSerializer,
)
from .utils import generate_otp, send_otp_email, mask_email


# ── Throttle classes ────────────────────────────────────────────────

class LoginThrottle(AnonRateThrottle):
    scope = 'login'


class IdentifyThrottle(AnonRateThrottle):
    scope = 'identify'


class OTPThrottle(AnonRateThrottle):
    scope = 'otp'


class ForgotPasswordThrottle(AnonRateThrottle):
    scope = 'forgot_password'


# ── Helper ──────────────────────────────────────────────────────────

def _token_response(user, request):
    """Generate JWT tokens + user data response."""
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user, context={'request': request}).data,
    })


# ── Views ───────────────────────────────────────────────────────────

class IdentifyView(GenericAPIView):
    """POST /api/v1/auth/identify/ — detect login method from identifier."""
    permission_classes = [AllowAny]
    throttle_classes = [IdentifyThrottle]
    serializer_class = IdentifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier'].strip()

        if '@' in identifier:
            return self._handle_email(identifier)
        return self._handle_id(identifier)

    def _handle_email(self, email):
        user = (
            User.objects
            .filter(email=email, is_active=True)
            .only('id', 'email', 'role', 'first_name', 'last_name')
            .first()
        )
        if not user:
            return Response(
                {'success': False, 'error': 'No account found with this email. Please use your ID to log in.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Admin/Principal → password login
        if user.role in ('admin', 'principal'):
            return Response({
                'success': True,
                'data': {
                    'method': 'password',
                    'role': user.role,
                    'name': user.first_name,
                },
            })

        # Teacher/Student → OTP login
        try:
            otp = generate_otp(email, 'login')
            send_otp_email(otp)
        except ValueError as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return Response({
            'success': True,
            'data': {
                'method': 'otp',
                'hint': mask_email(email),
                'role': user.role,
                'name': user.first_name,
            },
        })

    def _handle_id(self, identifier):
        backend = MultiMethodAuthBackend()
        user = backend._resolve_user(identifier)

        if not user or not user.is_active:
            return Response(
                {'success': False, 'error': 'No account found with this ID. Contact your administrator.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        method = 'password' if user.has_usable_password() else 'set_password'

        return Response({
            'success': True,
            'data': {
                'method': method,
                'role': user.role,
                'name': user.first_name,
            },
        })


class LoginView(GenericAPIView):
    """POST /api/v1/auth/login/ — identifier (email or ID) + password."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return _token_response(serializer.validated_data['user'], request)


class VerifyOTPView(GenericAPIView):
    """POST /api/v1/auth/verify-otp/ — verify email OTP and return tokens."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPThrottle]
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['otp']

        otp = (
            OTP.objects
            .filter(email=email, purpose='login', is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp or not otp.is_valid:
            return Response(
                {'success': False, 'error': 'OTP has expired or is invalid. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            remaining = 5 - otp.attempts
            if remaining <= 0:
                otp.is_used = True
                otp.save(update_fields=['is_used'])
                return Response(
                    {'success': False, 'error': 'Too many incorrect attempts. Please request a new OTP.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {'success': False, 'error': f'Incorrect OTP. {remaining} attempts remaining.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP matches
        otp.is_used = True
        otp.save(update_fields=['is_used'])

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response(
                {'success': False, 'error': 'Account not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return _token_response(user, request)


class SetPasswordView(GenericAPIView):
    """POST /api/v1/auth/set-password/ — first-time password setup via ID."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = SetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']
        password = serializer.validated_data['password']

        backend = MultiMethodAuthBackend()
        user = backend._resolve_user(identifier)

        if not user or not user.is_active:
            return Response(
                {'success': False, 'error': 'No account found with this ID.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.has_usable_password():
            return Response(
                {'success': False, 'error': 'Password is already set. Use login instead.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=['password'])

        return _token_response(user, request)


class ForgotPasswordView(GenericAPIView):
    """POST /api/v1/auth/forgot-password/ — send OTP for password reset."""
    permission_classes = [AllowAny]
    throttle_classes = [ForgotPasswordThrottle]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email, is_active=True).only('id').first()
        if not user:
            return Response(
                {'success': False, 'error': 'No account found with this email.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            otp = generate_otp(email, 'forgot_password')
            send_otp_email(otp)
        except ValueError as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return Response({
            'success': True,
            'message': 'OTP sent to your email.',
            'data': {'hint': mask_email(email)},
        })


class ResetPasswordView(GenericAPIView):
    """POST /api/v1/auth/reset-password/ — reset password with OTP."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPThrottle]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        otp = (
            OTP.objects
            .filter(email=email, purpose='forgot_password', is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp or not otp.is_valid:
            return Response(
                {'success': False, 'error': 'OTP has expired or is invalid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            return Response(
                {'success': False, 'error': 'Incorrect OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save(update_fields=['is_used'])

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response(
                {'success': False, 'error': 'Account not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return _token_response(user, request)


class MeView(GenericAPIView):
    """GET /api/v1/auth/me/ — returns the authenticated user."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        return Response(self.get_serializer(request.user).data)


class LogoutView(GenericAPIView):
    """POST /api/v1/auth/logout/ — blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class RefreshTokenView(TokenRefreshView):
    """POST /api/v1/auth/token/refresh/ — standard JWT refresh."""
    pass


class GoogleOAuthURLView(GenericAPIView):
    """GET /api/v1/auth/google/url/ — returns the Google OAuth consent URL."""
    permission_classes = [AllowAny]

    GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

    def get(self, request):
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'select_account',
        }
        url = f"{self.GOOGLE_AUTH_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
        return Response({'url': url})


class GoogleOAuthCallbackView(GenericAPIView):
    """POST /api/v1/auth/google/callback/ — exchanges Google code for JWT tokens.

    Only allows teacher/student roles. Admin/principal must use email+password.
    """
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {'success': False, 'error': 'Authorization code is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_email = self._get_google_email(code)
        if google_email is None:
            return Response(
                {'success': False, 'error': 'Failed to authenticate with Google.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = (
            User.objects
            .filter(email=google_email, is_active=True)
            .only('id', 'email', 'role', 'first_name', 'last_name', 'is_active')
            .first()
        )

        if not user:
            return Response(
                {'success': False, 'error': 'This Google account is not registered. Contact your administrator.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.role in ('admin', 'principal'):
            return Response(
                {'success': False, 'error': 'Google sign-in is not available for admin accounts. Please use email and password.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _token_response(user, request)

    def _get_google_email(self, code):
        """Exchange authorization code for Google email. Returns email or None."""
        token_response = http_requests.post(self.GOOGLE_TOKEN_URL, data={
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }, timeout=10)

        if token_response.status_code != 200:
            return None

        access_token = token_response.json().get('access_token')
        userinfo_response = http_requests.get(
            self.GOOGLE_USERINFO_URL,
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10,
        )

        if userinfo_response.status_code != 200:
            return None

        return userinfo_response.json().get('email')


class TourProgressView(GenericAPIView):
    """GET/POST /api/v1/auth/tour-progress/ — manage guided tour progress."""
    permission_classes = [IsAuthenticated]
    serializer_class = TourProgressSerializer

    def get(self, request):
        completed = list(
            UserTourProgress.objects
            .filter(user=request.user)
            .values_list('tour_key', flat=True)
        )
        return Response({'success': True, 'data': completed})

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tour_key = serializer.validated_data['tour_key']

        _, created = UserTourProgress.objects.get_or_create(
            user=request.user, tour_key=tour_key,
        )

        return Response(
            {'success': True, 'message': f'Tour "{tour_key}" marked as completed.'},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
```

- [ ] **Step 4: Update URL patterns**

Replace `backend/apps/accounts/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('identify/', views.IdentifyView.as_view(), name='identify'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('set-password/', views.SetPasswordView.as_view(), name='set-password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('me/', views.MeView.as_view(), name='me'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', views.RefreshTokenView.as_view(), name='token-refresh'),
    path('google/url/', views.GoogleOAuthURLView.as_view(), name='google-oauth-url'),
    path('google/callback/', views.GoogleOAuthCallbackView.as_view(), name='google-oauth-callback'),
    path('tour-progress/', views.TourProgressView.as_view(), name='tour-progress'),
]
```

- [ ] **Step 5: Run all tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests -v 2`

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/apps/accounts/serializers.py backend/apps/accounts/views.py backend/apps/accounts/urls.py backend/tests/accounts/test_views.py
git commit -m "feat(accounts): add progressive-disclosure auth views (identify, OTP, set-password, forgot/reset)"
```

---

## Task 7: Backend — IDConfiguration Admin API

**Files:**
- Modify: `backend/apps/admin_panel/serializers.py`
- Modify: `backend/apps/admin_panel/views.py`
- Modify: `backend/apps/admin_panel/urls.py`

- [ ] **Step 1: Add IDConfiguration serializer**

Append to `backend/apps/admin_panel/serializers.py`:

```python
from .models import IDConfiguration


class IDConfigurationSerializer(serializers.ModelSerializer):
    full_prefix = serializers.CharField(read_only=True)

    class Meta:
        model = IDConfiguration
        fields = ['id', 'role', 'prefix', 'year', 'full_prefix', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def validate_prefix(self, value):
        if len(value) != 3 or not value.isalpha():
            raise serializers.ValidationError('Prefix must be exactly 3 letters.')
        return value.upper()

    def validate_year(self, value):
        if len(value) != 4 or not value.isdigit():
            raise serializers.ValidationError('Year must be exactly 4 digits.')
        return value
```

- [ ] **Step 2: Add IDConfiguration viewset**

Append to `backend/apps/admin_panel/views.py` (after existing imports and views):

```python
from .models import IDConfiguration
from .serializers import IDConfigurationSerializer


class IDConfigurationViewSet(viewsets.ModelViewSet):
    """CRUD for ID prefix configuration. Admin only."""
    queryset = IDConfiguration.objects.all()
    serializer_class = IDConfigurationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'role'
    http_method_names = ['get', 'put', 'patch']
```

Note: Import `IsAdminUser` — check existing views.py for the correct import. The existing file uses `from apps.accounts.permissions import IsAdmin` or similar. Match the existing pattern.

- [ ] **Step 3: Register routes**

In `backend/apps/admin_panel/urls.py`, add:

```python
router.register(r'id-config', views.IDConfigurationViewSet, basename='id-config')
```

- [ ] **Step 4: Run tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests -v 2`

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/apps/admin_panel/serializers.py backend/apps/admin_panel/views.py backend/apps/admin_panel/urls.py
git commit -m "feat(admin): add IDConfiguration API for managing ID prefixes"
```

---

## Task 8: Frontend — Auth Service Updates

**Files:**
- Modify: `frontend/src/services/shared/authService.ts`
- Modify: `frontend/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Add new methods to authService**

Replace `frontend/src/services/shared/authService.ts`:

```typescript
import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

interface IdentifyResponse {
  success: true
  data: {
    method: 'otp' | 'password' | 'set_password'
    hint?: string
    role: string
    name: string
  }
}

export const authService = {
  async identify(identifier: string): Promise<IdentifyResponse['data']> {
    const { data } = await api.post<IdentifyResponse>('/auth/identify/', { identifier })
    return data.data
  },

  async login(identifier: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login/', { identifier, password })
    return data
  },

  async verifyOTP(email: string, otp: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/verify-otp/', { email, otp })
    return data
  },

  async setPassword(identifier: string, password: string, confirmPassword: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/set-password/', {
      identifier, password, confirm_password: confirmPassword,
    })
    return data
  },

  async forgotPassword(email: string): Promise<{ hint: string }> {
    const { data } = await api.post<{ success: true; data: { hint: string } }>('/auth/forgot-password/', { email })
    return data.data
  },

  async resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/reset-password/', {
      email, otp, new_password: newPassword, confirm_password: confirmPassword,
    })
    return data
  },

  async getMe(token: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async logout(refresh: string): Promise<void> {
    await api.post('/auth/logout/', { refresh })
  },

  async getGoogleAuthURL(): Promise<string> {
    const { data } = await api.get<{ url: string }>('/auth/google/url/')
    return data.url
  },

  async googleCallback(code: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/google/callback/', { code })
    return data
  },

  async getTourProgress(): Promise<string[]> {
    const { data } = await api.get<{ success: true; data: string[] }>('/auth/tour-progress/')
    return data.data
  },

  async completeTour(tourKey: string): Promise<void> {
    await api.post('/auth/tour-progress/', { tour_key: tourKey })
  },
}
```

- [ ] **Step 2: Update AuthContext — remove parent role, add loginWithToken**

Replace `frontend/src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/shared/authService'

export type UserRole = 'admin' | 'principal' | 'teacher' | 'student'

export interface AuthUser {
  id: number
  email: string
  role: UserRole
  full_name: string
  avatar_url?: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  loginWithToken: (access: string, refresh: string, user: AuthUser) => void
  googleLogin: (code: string) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'acadrix_token'
const REFRESH_KEY = 'acadrix_refresh'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) { setIsLoading(false); return }

    setToken(stored)
    authService.getMe(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(identifier: string, password: string) {
    const { access, refresh, user: userData } = await authService.login(identifier, password)
    loginWithToken(access, refresh, userData)
  }

  function loginWithToken(access: string, refresh: string, userData: AuthUser) {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    setToken(access)
    setUser(userData)
  }

  async function googleLogin(code: string) {
    const { access, refresh, user: userData } = await authService.googleCallback(code)
    loginWithToken(access, refresh, userData)
  }

  function logout() {
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (refresh) {
      authService.logout(refresh).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithToken, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/shared/authService.ts frontend/src/contexts/AuthContext.tsx
git commit -m "feat(frontend): update auth service and context for multi-method login"
```

---

## Task 9: Frontend — Progressive Disclosure Login Page

**Files:**
- Modify: `frontend/src/pages/auth/LoginPage.tsx`

This is the largest frontend change. The login page becomes a multi-step form that adapts based on what the user enters.

- [ ] **Step 1: Rewrite LoginPage with progressive disclosure**

Replace `frontend/src/pages/auth/LoginPage.tsx` entirely:

```tsx
import { useState, FormEvent, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/shared/authService'
import ParticleNetwork from '@/components/shared/ParticleNetwork'

type Step = 'identify' | 'password' | 'set_password' | 'otp' | 'forgot' | 'reset'

export default function LoginPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('identify')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [forgotEmail, setForgotEmail] = useState('')

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  function resetForm() {
    setStep('identify')
    setPassword('')
    setConfirmPassword('')
    setOtpDigits(['', '', '', '', '', ''])
    setError(null)
    setUserName('')
    setUserRole('')
    setEmailHint('')
    setForgotEmail('')
  }

  async function handleIdentify(e: FormEvent) {
    e.preventDefault()
    if (!identifier.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      const result = await authService.identify(identifier.trim())
      setUserName(result.name)
      setUserRole(result.role)
      if (result.hint) setEmailHint(result.hint)
      setStep(result.method)
      if (result.method === 'otp') setResendCountdown(30)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.login(identifier.trim(), password)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Invalid credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.setPassword(identifier.trim(), password, confirmPassword)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.password?.[0] || 'Failed to set password.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOTP(e: FormEvent) {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length !== 6) { setError('Enter all 6 digits.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.verifyOTP(identifier.trim(), code)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendOTP() {
    if (resendCountdown > 0) return
    setError(null)
    try {
      await authService.identify(identifier.trim())
      setResendCountdown(30)
      setOtpDigits(['', '', '', '', '', ''])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP.')
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      const result = await authService.forgotPassword(forgotEmail.trim())
      setEmailHint(result.hint)
      setStep('reset')
      setResendCountdown(30)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email not found.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length !== 6) { setError('Enter all 6 digits.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const { access, refresh, user } = await authService.resetPassword(forgotEmail.trim(), code, password, confirmPassword)
      loginWithToken(access, refresh, user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOTPChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value
    setOtpDigits(newDigits)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleOTPKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOTPPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newDigits = [...otpDigits]
    for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || ''
    setOtpDigits(newDigits)
    const focusIndex = Math.min(pasted.length, 5)
    otpRefs.current[focusIndex]?.focus()
  }

  // ── Shared UI Components ──

  const ErrorAlert = () => error ? (
    <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg bg-error-container/40 border border-error/20 px-4 py-3">
      <span className="material-symbols-outlined text-error text-lg">error</span>
      <span className="text-sm text-on-error-container">{error}</span>
    </div>
  ) : null

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4">
      <span className="material-symbols-outlined text-lg">arrow_back</span>
      Back
    </button>
  )

  const SubmitButton = ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
    <button type="submit" disabled={isLoading || disabled}
      className="w-full bg-primary text-on-primary font-headline font-bold py-3.5 rounded-xl hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1">
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          Please wait...
        </span>
      ) : children}
    </button>
  )

  const OTPInputs = () => (
    <div className="flex gap-2 sm:gap-3 justify-center mb-4" onPaste={handleOTPPaste}>
      {otpDigits.map((digit, i) => (
        <input key={i} ref={el => { otpRefs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleOTPChange(i, e.target.value)}
          onKeyDown={e => handleOTPKeyDown(i, e)}
          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface transition-all"
        />
      ))}
    </div>
  )

  // ── Step Content ──

  function renderStep() {
    switch (step) {
      case 'identify':
        return (
          <form onSubmit={handleIdentify} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="identifier">
                ID or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">badge</span>
                </div>
                <input id="identifier" placeholder="Enter your ID or Email"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={identifier} onChange={e => setIdentifier(e.target.value)} required autoFocus
                />
              </div>
            </div>
            <SubmitButton>Continue</SubmitButton>
          </form>
        )

      case 'password':
        return (
          <form onSubmit={handlePasswordLogin} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">Signing in as</p>
              <p className="text-on-surface font-semibold">{userName} <span className="text-xs text-on-surface-variant">({identifier})</span></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2" htmlFor="password">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input id="password" placeholder="Enter your password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-11 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="flex justify-end mt-2.5">
                <button type="button" onClick={() => { setForgotEmail(identifier.includes('@') ? identifier : ''); setStep('forgot') }}
                  className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all">
                  Forgot Password?
                </button>
              </div>
            </div>
            <SubmitButton>Sign In</SubmitButton>
          </form>
        )

      case 'set_password':
        return (
          <form onSubmit={handleSetPassword} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">Welcome! Set up your account</p>
              <p className="text-on-surface font-semibold">{userName} <span className="text-xs text-on-surface-variant">({identifier})</span></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Create Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input placeholder="Create a password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-11 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock_reset</span>
                </div>
                <input placeholder="Confirm your password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                />
              </div>
            </div>
            <SubmitButton>Create Account & Sign In</SubmitButton>
          </form>
        )

      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4 md:space-y-5">
            <BackButton onClick={resetForm} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">OTP sent to</p>
              <p className="text-on-surface font-semibold">{emailHint}</p>
            </div>
            <OTPInputs />
            <SubmitButton>Verify & Sign In</SubmitButton>
            <div className="text-center mt-3">
              {resendCountdown > 0 ? (
                <p className="text-xs text-on-surface-variant">Resend OTP in {resendCountdown}s</p>
              ) : (
                <button type="button" onClick={handleResendOTP}
                  className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )

      case 'forgot':
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4 md:space-y-5">
            <BackButton onClick={() => setStep(identifier.includes('@') ? 'identify' : 'password')} />
            <div className="text-center mb-4">
              <h2 className="text-on-surface font-headline font-bold text-lg">Forgot Password?</h2>
              <p className="text-on-surface-variant text-xs mt-1">Enter your email to receive a reset code</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">mail</span>
                </div>
                <input type="email" placeholder="name@institution.edu"
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus
                />
              </div>
            </div>
            <SubmitButton>Send Reset Code</SubmitButton>
          </form>
        )

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-5">
            <BackButton onClick={() => setStep('forgot')} />
            <div className="text-center mb-4">
              <p className="text-on-surface-variant text-xs">Reset code sent to</p>
              <p className="text-on-surface font-semibold">{emailHint}</p>
            </div>
            <OTPInputs />
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input placeholder="New password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-11 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-outline/50 text-xl hover:text-on-surface-variant transition-colors">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline/60 text-xl group-focus-within:text-primary transition-colors">lock_reset</span>
                </div>
                <input placeholder="Confirm password" type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/25 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none text-on-surface placeholder:text-outline/40 text-sm transition-all"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                />
              </div>
            </div>
            <SubmitButton>Reset Password & Sign In</SubmitButton>
          </form>
        )
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-3 py-4 sm:px-6 sm:py-8 bg-primary-fixed/40">
      <ParticleNetwork particleCount={120} connectionDistance={200} mouseRadius={250} color="59,108,231" />

      <div className="relative z-10 w-full max-w-[900px] lg:max-w-[960px] bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-primary/8 overflow-hidden flex flex-col md:flex-row min-h-[540px] md:min-h-[580px]">

        {/* ── Left Brand Panel ── */}
        <div className="hidden md:flex md:w-[44%] relative flex-col items-center justify-center p-8 lg:p-10 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #D4DFFF 0%, #BFCFFA 40%, #A8BDF7 70%, #93ADF4 100%)' }}>
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <img src="/logo_name.png" alt="Acadrix" className="w-full max-w-[260px] lg:max-w-[290px] h-auto" />
            <div>
              <h2 className="font-headline font-extrabold text-[1.45rem] lg:text-[1.65rem] text-on-primary-fixed leading-tight tracking-tight mb-1">
                Your Campus, Smarter.
              </h2>
              <p className="text-on-primary-fixed-variant/50 text-[0.78rem] leading-relaxed">
                One platform for academics, analytics,<br />and assessments
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'monitoring', label: 'Analytics' },
                { icon: 'quiz', label: 'Exams' },
                { icon: 'groups', label: 'Campus' },
                { icon: 'school', label: 'Academics' },
              ].map(f => (
                <div key={f.label}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/35 backdrop-blur-sm border border-white/40 text-on-primary-fixed/70">
                  <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '0.9rem' }}>{f.icon}</span>
                  <span className="text-[0.68rem] font-semibold">{f.label}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="material-symbols-outlined fill-icon text-amber-500" style={{ fontSize: '0.8rem' }}>star</span>
                ))}
              </div>
              <p className="text-on-primary-fixed-variant/40 text-[0.62rem] font-medium">Trusted by 50+ institutions</p>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-6 sm:px-10 md:px-12 lg:px-14">
          <div className="mb-6 md:hidden flex justify-center">
            <img src="/logo_name.png" alt="Acadrix" className="h-44 sm:h-52 w-auto" />
          </div>

          {step === 'identify' && (
            <>
              <h1 className="font-headline font-extrabold text-lg sm:text-xl text-on-surface mb-0.5 tracking-tight md:text-left text-center md:text-2xl">
                Welcome Back
              </h1>
              <p className="text-on-surface-variant text-xs mb-5 md:text-left text-center md:text-sm md:mb-8">
                Sign in to your account to continue
              </p>
            </>
          )}

          <ErrorAlert />
          {renderStep()}

          {/* Google OAuth — only on identify step */}
          {step === 'identify' && (
            <>
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white/90 text-outline/70 font-medium">or continue with</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button type="button" disabled={isLoading}
                  onClick={async () => {
                    try {
                      const url = await authService.getGoogleAuthURL()
                      window.location.href = url
                    } catch {
                      setError('Unable to connect to Google. Please try again.')
                    }
                  }}
                  className="flex-1 max-w-[200px] h-11 rounded-xl border border-outline-variant/25 flex items-center justify-center gap-2.5 hover:bg-surface-container-low hover:border-outline-variant/40 hover:shadow-sm transition-all group disabled:opacity-60"
                  aria-label="Sign in with Google">
                  <svg aria-hidden="true" className="w-[1.125rem] h-[1.125rem] group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-xs font-medium text-on-surface-variant">Google</span>
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-on-surface-variant/70 mt-8">
            Don't have an account?{' '}
            <a href="#" className="text-primary font-semibold hover:underline underline-offset-4 transition-all">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npm run type-check`

Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/auth/LoginPage.tsx
git commit -m "feat(frontend): progressive disclosure login page with OTP, ID, and password flows"
```

---

## Task 10: Frontend — Install react-joyride for Guided Tours

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install react-joyride**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npm install react-joyride`

- [ ] **Step 2: Verify build still works**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore(frontend): install react-joyride for guided tour system"
```

---

## Task 11: Integration — Run Full Test Suite and Fix Issues

- [ ] **Step 1: Run backend tests**

Run: `cd /home/development1/Desktop/Acadrix/backend && python manage.py test tests -v 2`

Expected: All tests PASS.

- [ ] **Step 2: Run frontend type check**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npm run type-check`

Expected: No errors.

- [ ] **Step 3: Run frontend build**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npm run build`

Expected: Build succeeds.

- [ ] **Step 4: Run frontend lint**

Run: `cd /home/development1/Desktop/Acadrix/frontend && npm run lint`

Expected: No errors (warnings acceptable).

- [ ] **Step 5: Fix any issues found in steps 1-4**

If any tests fail, type errors, or build errors appear, fix them and re-run.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix: resolve any integration issues from auth system implementation"
```

(Only if there were fixes needed in step 5.)
