import secrets

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom user with role-based access. Every person in the system is a User."""

    class Role(models.TextChoices):
        SUPER_ADMIN = 'super_admin', 'Super Admin'
        ADMIN = 'admin', 'Admin'
        FINANCE = 'finance', 'Finance'
        PRINCIPAL = 'principal', 'Principal'
        TEACHER = 'teacher', 'Teacher'
        STUDENT = 'student', 'Student'

    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)

    # Use email as the login identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'role']

    email = models.EmailField(unique=True)

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'

    @property
    def full_name(self):
        return self.get_full_name() or self.username


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
