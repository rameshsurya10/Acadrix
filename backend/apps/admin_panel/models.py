from django.conf import settings
from django.db import models


class AdmissionApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        MISSING_DOCS = 'missing_documents', 'Missing Documents'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        FINALIZED = 'finalized', 'Finalized'

    application_id = models.CharField(max_length=20, unique=True)  # ADM-2024-0001
    applicant_name = models.CharField(max_length=120)
    applicant_email = models.EmailField()
    applicant_phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    grade_applying = models.ForeignKey(
        'shared.Grade', on_delete=models.SET_NULL,
        null=True, related_name='applications',
    )
    program = models.CharField(max_length=100, blank=True)
    guardian_name = models.CharField(max_length=120, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)
    guardian_email = models.EmailField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviewed_applications',
    )
    student_created = models.ForeignKey(
        'student.StudentProfile', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='admission',
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admission_applications'
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['application_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.application_id} — {self.applicant_name}'


class AdmissionDocument(models.Model):
    application = models.ForeignKey(
        AdmissionApplication, on_delete=models.CASCADE, related_name='documents',
    )
    doc_type = models.CharField(max_length=30)
    file = models.FileField(upload_to='admission_documents/')
    file_name = models.CharField(max_length=200)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('verified', 'Verified'), ('missing', 'Missing')],
        default='pending',
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admission_documents'
        ordering = ['-uploaded_at']


class AdminNotification(models.Model):
    class Priority(models.TextChoices):
        HIGH = 'high', 'High'
        NORMAL = 'normal', 'Normal'
        LOW = 'low', 'Low'

    class Category(models.TextChoices):
        AUDIT = 'audit', 'Audit'
        MAINTENANCE = 'maintenance', 'Maintenance'
        CONTRACT = 'contract', 'Contract'
        HR = 'hr', 'HR Notice'
        SYSTEM = 'system', 'System Alert'
        BOARD = 'board', 'Board Directive'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='admin_notifications',
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.SYSTEM)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin_notifications'
        ordering = ['-created_at']


class FeeTemplate(models.Model):
    """Reusable fee structure per grade. Auto-applied when students enroll."""
    grade = models.OneToOneField(
        'shared.Grade', on_delete=models.CASCADE, related_name='fee_template',
    )
    name = models.CharField(max_length=120)
    academic_year = models.ForeignKey(
        'shared.AcademicYear', on_delete=models.CASCADE, related_name='fee_templates',
    )
    due_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fee_templates'
        unique_together = ['grade', 'academic_year']

    def __str__(self):
        return f'{self.name} ({self.grade.label})'

    @property
    def total_amount(self):
        return sum(item.amount for item in self.items.all())


class FeeTemplateItem(models.Model):
    """Individual fee line in a template (e.g. Tuition, Lab Fee, Activity Fee)."""
    template = models.ForeignKey(FeeTemplate, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_optional = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'fee_template_items'
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.description}: ₹{self.amount}'


class StudentDiscount(models.Model):
    """Per-student scholarship/discount. Only affects this student, not the template."""

    class DiscountType(models.TextChoices):
        SCHOLARSHIP = 'scholarship', 'Scholarship'
        SIBLING = 'sibling', 'Sibling Discount'
        MERIT = 'merit', 'Merit Award'
        FINANCIAL_AID = 'financial_aid', 'Financial Aid'
        STAFF_CHILD = 'staff_child', 'Staff Child'
        OTHER = 'other', 'Other'

    student = models.ForeignKey(
        'student.StudentProfile', on_delete=models.CASCADE, related_name='discounts',
    )
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    applied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_discounts'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.discount_type}: -₹{self.amount} for {self.student}'


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
