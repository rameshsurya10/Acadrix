from django.conf import settings
from django.db import models


class StaffProfile(models.Model):
    """Profile for non-teaching staff (peons, clerks, drivers, lab assistants)."""

    class EmploymentType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full-time'
        PART_TIME = 'part_time', 'Part-time'
        CONTRACT = 'contract', 'Contract'
        TEMPORARY = 'temporary', 'Temporary'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='staff_profile',
    )
    employee_id = models.CharField(max_length=20, unique=True)
    designation = models.CharField(max_length=60)
    department = models.ForeignKey(
        'shared.Department', on_delete=models.SET_NULL,
        null=True, related_name='staff_members',
    )
    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)
    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME,
    )
    bank_account_no = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    aadhar_number = models.CharField(max_length=12, blank=True)
    uan_number = models.CharField(max_length=12, blank=True)
    esi_number = models.CharField(max_length=17, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_profiles'
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f'{self.user.full_name} ({self.employee_id})'


class SalaryStructure(models.Model):
    """Salary breakdown for any staff member (teaching or non-teaching)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='salary_structures',
    )
    # Earnings
    basic = models.DecimalField(max_digits=10, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    da = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    conveyance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medical = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    special_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Deduction percentages / fixed amounts
    pf_employee_pct = models.DecimalField(max_digits=4, decimal_places=2, default=12.00)
    pf_employer_pct = models.DecimalField(max_digits=4, decimal_places=2, default=12.00)
    esi_employee_pct = models.DecimalField(max_digits=4, decimal_places=2, default=0.75)
    esi_employer_pct = models.DecimalField(max_digits=4, decimal_places=2, default=3.25)
    professional_tax = models.DecimalField(max_digits=8, decimal_places=2, default=200)
    tds_pct = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    effective_from = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'salary_structures'
        ordering = ['-effective_from']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['effective_from']),
        ]

    def __str__(self):
        return f'{self.user.full_name} — {self.effective_from} (gross: {self.gross})'

    @property
    def gross(self):
        return self.basic + self.hra + self.da + self.conveyance + self.medical + self.special_allowance

    @property
    def total_deductions(self):
        from decimal import Decimal
        pf = self.basic * self.pf_employee_pct / Decimal('100')
        esi = self.gross * self.esi_employee_pct / Decimal('100')
        tds = self.gross * self.tds_pct / Decimal('100')
        return pf + esi + self.professional_tax + tds

    @property
    def net(self):
        return self.gross - self.total_deductions


class PayrollRun(models.Model):
    """Monthly payroll processing batch."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PROCESSED = 'processed', 'Processed'
        FINALIZED = 'finalized', 'Finalized'

    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    academic_year = models.ForeignKey(
        'shared.AcademicYear', on_delete=models.CASCADE,
        related_name='payroll_runs',
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT,
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='processed_payrolls',
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    total_gross = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_net = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payroll_runs'
        unique_together = ['month', 'year']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'Payroll {self.month:02d}/{self.year} — {self.status}'


class PayslipEntry(models.Model):
    """Individual payslip for one staff member within a payroll run."""

    class Status(models.TextChoices):
        GENERATED = 'generated', 'Generated'
        SENT = 'sent', 'Sent'
        ACKNOWLEDGED = 'acknowledged', 'Acknowledged'

    payroll_run = models.ForeignKey(
        PayrollRun, on_delete=models.CASCADE, related_name='payslips',
    )
    staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='payslips',
    )
    # Earnings
    basic = models.DecimalField(max_digits=10, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    da = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    conveyance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medical = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    special_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2)
    # Deductions
    pf_employee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pf_employer = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    esi_employee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    esi_employer = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tds = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    # Attendance
    working_days = models.IntegerField(default=26)
    days_present = models.IntegerField(default=26)
    days_absent = models.IntegerField(default=0)
    leave_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Extras
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    arrears = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.GENERATED,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payslip_entries'
        unique_together = ['payroll_run', 'staff']
        ordering = ['staff__first_name']
        indexes = [
            models.Index(fields=['payroll_run', 'staff']),
        ]

    def __str__(self):
        return f'{self.staff.full_name} — {self.payroll_run}'


class StaffDocument(models.Model):
    """HR documents uploaded for staff members."""

    class DocType(models.TextChoices):
        AADHAR = 'aadhar', 'Aadhar Card'
        PAN = 'pan', 'PAN Card'
        QUALIFICATION = 'qualification', 'Qualification Certificate'
        EXPERIENCE = 'experience', 'Experience Letter'
        APPOINTMENT = 'appointment', 'Appointment Letter'
        BANK_PASSBOOK = 'bank_passbook', 'Bank Passbook'
        PHOTO = 'photo', 'Photo'

    staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='hr_documents',
    )
    doc_type = models.CharField(max_length=20, choices=DocType.choices)
    file = models.FileField(upload_to='staff_documents/')
    file_name = models.CharField(max_length=200)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'staff_hr_documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.staff.full_name} — {self.get_doc_type_display()}'
