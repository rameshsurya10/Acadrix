from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='student_profile',
        limit_choices_to={'role': 'student'},
    )
    student_id = models.CharField(max_length=20, unique=True)  # SM-2024-8892
    section = models.ForeignKey(
        'shared.Section', on_delete=models.SET_NULL,
        null=True, related_name='students',
    )
    house = models.CharField(max_length=40, blank=True)  # Aquila, etc.
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_profiles'
        indexes = [models.Index(fields=['student_id'])]

    def __str__(self):
        return f'{self.user.full_name} ({self.student_id})'


class Guardian(models.Model):
    """Guardian contact info stored on student profile. No separate login."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='guardians')
    name = models.CharField(max_length=120, default='')
    relationship = models.CharField(max_length=30, default='parent')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guardians'

    def __str__(self):
        return f'{self.name} ({self.relationship}) → {self.student}'


class HealthRecord(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='health_records')
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True)
    check_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'health_records'
        ordering = ['-check_date']


class ExtracurricularActivity(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=60, blank=True)  # Team Captain, Member
    schedule = models.CharField(max_length=60, blank=True)  # "Friday 4PM"
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'extracurricular_activities'
        ordering = ['name']


class Document(models.Model):
    class DocType(models.TextChoices):
        BIRTH_CERT = 'birth_certificate', 'Birth Certificate'
        ADDRESS_PROOF = 'address_proof', 'Address Proof'
        TRANSFER_CERT = 'transfer_certificate', 'Transfer Certificate'
        ACADEMIC_TRANSCRIPT = 'academic_transcript', 'Academic Transcript'
        MEDICAL = 'medical', 'Medical Records'
        PHOTO_ID = 'photo_id', 'Photo ID'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'
        IN_REVIEW = 'in_review', 'In Review'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.CharField(max_length=30, choices=DocType.choices)
    file = models.FileField(upload_to='student_documents/')
    file_name = models.CharField(max_length=200)
    file_size_bytes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='verified_documents',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_documents'
        ordering = ['-uploaded_at']


class Attendance(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    is_present = models.BooleanField(default=True)
    remarks = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance'
        unique_together = ['student', 'date']
        ordering = ['-date']


class TuitionAccount(models.Model):
    class PaymentStatus(models.TextChoices):
        PAID = 'paid', 'Paid'
        PENDING = 'pending', 'Pending'
        OVERDUE = 'overdue', 'Overdue'
        PARTIAL = 'partial', 'Partial'

    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name='tuition_account')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    due_date = models.DateField(null=True, blank=True)
    semester = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tuition_accounts'

    @property
    def outstanding_balance(self):
        return self.total_amount - self.paid_amount


class TuitionLineItem(models.Model):
    account = models.ForeignKey(TuitionAccount, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    credit_hours = models.PositiveSmallIntegerField(null=True, blank=True)
    rate_per_hour = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tuition_line_items'


class Payment(models.Model):
    class Method(models.TextChoices):
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
        CREDIT_CARD = 'credit_card', 'Credit Card'
        CASH = 'cash', 'Cash'
        STRIPE = 'stripe', 'Stripe (Card)'
        CHEQUE = 'cheque', 'Cheque'
        OTHER = 'other', 'Other'

    account = models.ForeignKey(TuitionAccount, on_delete=models.CASCADE, related_name='payments')
    receipt_id = models.CharField(max_length=30, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices)
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='payments_made',
    )
    paid_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-paid_at']
        indexes = [models.Index(fields=['receipt_id'])]


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
