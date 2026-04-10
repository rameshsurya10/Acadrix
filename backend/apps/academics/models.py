from django.conf import settings
from django.db import models


class ReportCardTemplate(models.Model):
    """Configurable report card template per grade and board."""

    class BoardType(models.TextChoices):
        CBSE = 'cbse', 'CBSE'
        ICSE = 'icse', 'ICSE'
        STATE_BOARD = 'state_board', 'State Board'
        CUSTOM = 'custom', 'Custom'

    class GradingScale(models.TextChoices):
        MARKS = 'marks', 'Marks Only'
        GRADES = 'grades', 'Grades Only'
        BOTH = 'both', 'Marks + Grades'

    name = models.CharField(max_length=120)
    board_type = models.CharField(max_length=20, choices=BoardType.choices, default=BoardType.CBSE)
    grade = models.ForeignKey('shared.Grade', on_delete=models.CASCADE, related_name='report_templates')
    academic_year = models.ForeignKey('shared.AcademicYear', on_delete=models.CASCADE, related_name='report_templates')
    grading_scale = models.CharField(max_length=10, choices=GradingScale.choices, default=GradingScale.BOTH)
    # CBSE specific
    co_scholastic_areas = models.JSONField(default=list, blank=True, help_text='e.g. [{"area": "Work Education", "grade": "A"}, ...]')
    # Display options
    show_attendance = models.BooleanField(default=True)
    show_remarks = models.BooleanField(default=True)
    show_rank = models.BooleanField(default=False)
    # Branding
    header_text = models.TextField(blank=True)
    footer_text = models.TextField(blank=True)
    principal_signature = models.ImageField(upload_to='report_cards/signatures/', blank=True)
    school_seal = models.ImageField(upload_to='report_cards/seals/', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'report_card_templates'
        unique_together = ['grade', 'academic_year', 'board_type']

    def __str__(self):
        return f'{self.name} ({self.grade.label} - {self.get_board_type_display()})'


class ReportCardTerm(models.Model):
    """Which term/exam this report card covers."""

    class TermType(models.TextChoices):
        TERM1 = 'term1', 'Term 1 / Half Yearly'
        TERM2 = 'term2', 'Term 2 / Annual'
        MIDTERM = 'midterm', 'Mid-Term'
        QUARTERLY = 'quarterly', 'Quarterly'
        ANNUAL = 'annual', 'Annual'

    template = models.ForeignKey(ReportCardTemplate, on_delete=models.CASCADE, related_name='terms')
    term = models.CharField(max_length=20, choices=TermType.choices)
    assessments = models.ManyToManyField('teacher.Assessment', blank=True, related_name='report_terms')
    # CBSE grading thresholds (configurable per term)
    grade_thresholds = models.JSONField(
        default=list, blank=True,
        help_text='e.g. [{"min": 91, "max": 100, "grade": "A1"}, {"min": 81, "max": 90, "grade": "A2"}, ...]'
    )

    class Meta:
        db_table = 'report_card_terms'
        unique_together = ['template', 'term']

    def __str__(self):
        return f'{self.template.name} - {self.get_term_display()}'


class GeneratedReportCard(models.Model):
    """A generated report card for a specific student."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        FINAL = 'final', 'Final'
        DISTRIBUTED = 'distributed', 'Distributed'

    student = models.ForeignKey('student.StudentProfile', on_delete=models.CASCADE, related_name='report_cards')
    template = models.ForeignKey(ReportCardTemplate, on_delete=models.CASCADE)
    term = models.ForeignKey(ReportCardTerm, on_delete=models.CASCADE)
    academic_year = models.ForeignKey('shared.AcademicYear', on_delete=models.CASCADE)
    # Snapshot of data at generation time
    data_snapshot = models.JSONField(default=dict, help_text='Full report card data frozen at generation time')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'generated_report_cards'
        unique_together = ['student', 'template', 'term']
        ordering = ['-generated_at']

    def __str__(self):
        return f'{self.student} - {self.term}'


class CertificateTemplate(models.Model):
    """Template for TC, bonafide, character, migration certificates."""

    class CertType(models.TextChoices):
        TC = 'tc', 'Transfer Certificate'
        BONAFIDE = 'bonafide', 'Bonafide Certificate'
        CHARACTER = 'character', 'Character Certificate'
        MIGRATION = 'migration', 'Migration Certificate'
        CONDUCT = 'conduct', 'Conduct Certificate'
        STUDY = 'study', 'Study Certificate'

    name = models.CharField(max_length=120)
    cert_type = models.CharField(max_length=20, choices=CertType.choices)
    body_template = models.TextField(help_text='Use {{placeholders}} like {{student_name}}, {{father_name}}, {{class}}, {{date_of_birth}}')
    header_image = models.ImageField(upload_to='certificates/headers/', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'certificate_templates'

    def __str__(self):
        return f'{self.name} ({self.get_cert_type_display()})'


class IssuedCertificate(models.Model):
    """A certificate issued to a specific student."""

    student = models.ForeignKey('student.StudentProfile', on_delete=models.CASCADE, related_name='certificates')
    template = models.ForeignKey(CertificateTemplate, on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=30, unique=True)
    issued_date = models.DateField()
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True)
    # TC-specific fields
    date_of_admission = models.DateField(null=True, blank=True)
    date_of_leaving = models.DateField(null=True, blank=True)
    class_at_leaving = models.CharField(max_length=30, blank=True)
    reason_for_leaving = models.CharField(max_length=100, blank=True)
    conduct = models.CharField(max_length=100, blank=True)
    qualified_for_promotion = models.BooleanField(null=True)
    working_days = models.IntegerField(null=True, blank=True)
    days_present = models.IntegerField(null=True, blank=True)
    # Generated content
    rendered_body = models.TextField(blank=True, help_text='Final rendered certificate text')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'issued_certificates'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.serial_number} - {self.student}'
