from django.conf import settings
from django.db import models


class LeaveType(models.Model):
    """Defines categories of leave (Casual, Sick, Earned, Maternity, etc.)."""

    class Applicability(models.TextChoices):
        STAFF = 'staff', 'Staff'
        STUDENT = 'student', 'Student'
        BOTH = 'both', 'Both'

    name = models.CharField(max_length=60)
    code = models.CharField(max_length=10, unique=True)  # CL, SL, EL, ML
    annual_quota = models.IntegerField(default=12)
    carries_forward = models.BooleanField(default=False)
    applicable_to = models.CharField(
        max_length=10,
        choices=Applicability.choices,
        default=Applicability.STAFF,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'leave_types'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['applicable_to', 'is_active']),
        ]

    def __str__(self):
        return f'{self.name} ({self.code})'


class LeaveBalance(models.Model):
    """Tracks per-user, per-type, per-year allocation and usage."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_balances',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='balances',
    )
    academic_year = models.ForeignKey(
        'shared.AcademicYear',
        on_delete=models.CASCADE,
        related_name='leave_balances',
    )
    allocated = models.IntegerField(default=0)
    used = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    carried_forward = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    class Meta:
        db_table = 'leave_balances'
        unique_together = ['user', 'leave_type', 'academic_year']
        indexes = [
            models.Index(fields=['user', 'academic_year']),
        ]

    def __str__(self):
        return f'{self.user} — {self.leave_type.code} ({self.academic_year})'

    @property
    def remaining(self):
        """Available balance = allocated + carried_forward - used."""
        from decimal import Decimal
        return Decimal(self.allocated) + self.carried_forward - self.used


class LeaveApplication(models.Model):
    """A single leave request submitted by any user."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_applications',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_half_day = models.BooleanField(default=False)
    reason = models.TextField()
    attachment = models.FileField(upload_to='leave_attachments/', blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'leave_applications'
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['applicant', 'status']),
            models.Index(fields=['status', 'applied_at']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f'{self.applicant} — {self.leave_type.code} ({self.start_date} to {self.end_date})'

    @property
    def days_count(self):
        """Number of leave days (0.5 for half-day, else inclusive date range)."""
        if self.is_half_day:
            return 0.5
        return (self.end_date - self.start_date).days + 1


class LeaveApproval(models.Model):
    """Records the approval or rejection decision for a leave application."""

    class Action(models.TextChoices):
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    application = models.OneToOneField(
        LeaveApplication,
        on_delete=models.CASCADE,
        related_name='approval',
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_approvals_given',
    )
    action = models.CharField(max_length=10, choices=Action.choices)
    remarks = models.TextField(blank=True)
    acted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'leave_approvals'
        indexes = [
            models.Index(fields=['approver', 'acted_at']),
        ]

    def __str__(self):
        return f'{self.application} — {self.action} by {self.approver}'
