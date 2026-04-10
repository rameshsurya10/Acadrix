from django.conf import settings
from django.db import models


class SchoolSettings(models.Model):
    """Single-row institution configuration."""
    school_name = models.CharField(max_length=200, default='Acadrix School')
    logo = models.ImageField(upload_to='school/', blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    timezone = models.CharField(max_length=60, default='UTC')
    currency = models.CharField(max_length=10, default='USD')
    motto = models.CharField(max_length=200, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'school_settings'
        verbose_name_plural = 'School Settings'

    def __str__(self):
        return self.school_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class AuditLog(models.Model):
    """Tracks important system actions for super admin oversight."""

    class Action(models.TextChoices):
        CREATE_ADMIN = 'create_admin', 'Created Admin'
        CREATE_PRINCIPAL = 'create_principal', 'Created Principal'
        DEACTIVATE_USER = 'deactivate_user', 'Deactivated User'
        ACTIVATE_USER = 'activate_user', 'Activated User'
        UPDATE_SETTINGS = 'update_settings', 'Updated Settings'
        RESET_PASSWORD = 'reset_password', 'Reset Password'

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='audit_actions',
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='audit_targets',
    )
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.actor} → {self.action} ({self.created_at:%Y-%m-%d %H:%M})'


class Announcement(models.Model):
    """School-wide or role-targeted announcements."""

    class TargetRole(models.TextChoices):
        ALL = 'all', 'All'
        ADMIN = 'admin', 'Admins'
        PRINCIPAL = 'principal', 'Principals'
        TEACHER = 'teacher', 'Teachers'
        STUDENT = 'student', 'Students'

    title = models.CharField(max_length=200)
    body = models.TextField()
    target_role = models.CharField(
        max_length=20, choices=TargetRole.choices, default=TargetRole.ALL,
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='announcements',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
