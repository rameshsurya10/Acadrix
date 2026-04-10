from django.conf import settings
from django.db import models


class UDISEProfile(models.Model):
    """Single-row school identity for U-DISE+ reporting."""

    class SchoolCategory(models.TextChoices):
        PRIMARY = 'primary', 'Primary'
        UPPER_PRIMARY = 'upper_primary', 'Upper Primary'
        SECONDARY = 'secondary', 'Secondary'
        HIGHER_SECONDARY = 'higher_secondary', 'Higher Secondary'
        COMPOSITE = 'composite', 'Composite'

    class SchoolType(models.TextChoices):
        BOYS = 'boys', 'Boys'
        GIRLS = 'girls', 'Girls'
        CO_ED = 'co_ed', 'Co-educational'

    class ManagementType(models.TextChoices):
        GOVT = 'govt', 'Government'
        PRIVATE_AIDED = 'private_aided', 'Private Aided'
        PRIVATE_UNAIDED = 'private_unaided', 'Private Unaided'
        CENTRAL_GOVT = 'central_govt', 'Central Government'

    udise_code = models.CharField(max_length=11, unique=True)
    block_code = models.CharField(max_length=10, blank=True)
    district_code = models.CharField(max_length=10, blank=True)
    state_code = models.CharField(max_length=10, blank=True)
    school_category = models.CharField(
        max_length=20, choices=SchoolCategory.choices, default=SchoolCategory.COMPOSITE,
    )
    school_type = models.CharField(
        max_length=10, choices=SchoolType.choices, default=SchoolType.CO_ED,
    )
    management_type = models.CharField(
        max_length=20, choices=ManagementType.choices, default=ManagementType.PRIVATE_UNAIDED,
    )
    medium = models.CharField(max_length=60)
    year_established = models.IntegerField()
    affiliation_board = models.CharField(max_length=60)
    affiliation_number = models.CharField(max_length=30, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'udise_profile'
        verbose_name = 'U-DISE Profile'
        verbose_name_plural = 'U-DISE Profile'

    def __str__(self):
        return f'U-DISE: {self.udise_code}'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1, defaults={
            'udise_code': '00000000000',
            'medium': 'English',
            'year_established': 2000,
            'affiliation_board': 'CBSE',
        })
        return obj


class UDISEAnnualData(models.Model):
    """Annual data snapshot for U-DISE+ submission."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        VALIDATED = 'validated', 'Validated'
        EXPORTED = 'exported', 'Exported'

    academic_year = models.OneToOneField(
        'shared.AcademicYear', on_delete=models.CASCADE,
        related_name='udise_data',
    )
    # JSON: {grade_level: {boys, girls, sc, st, obc, general, total}}
    enrollment_data = models.JSONField(default=dict)
    # JSON: {qualification: {count, male, female, total}}
    teacher_data = models.JSONField(default=dict)
    # JSON: {classrooms, labs, toilets_boys, toilets_girls, computers, internet, library_books, ...}
    infrastructure = models.JSONField(default=dict)
    cwsn_count = models.IntegerField(default=0)
    rte_count = models.IntegerField(default=0)
    minority_count = models.IntegerField(default=0)
    mid_day_meal = models.BooleanField(default=False)
    has_boundary_wall = models.BooleanField(default=False)
    has_ramp = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'udise_annual_data'
        verbose_name = 'U-DISE Annual Data'
        verbose_name_plural = 'U-DISE Annual Data'
        ordering = ['-academic_year__start_date']

    def __str__(self):
        return f'U-DISE Data — {self.academic_year.label}'


class UDISEExportLog(models.Model):
    """Audit trail for U-DISE data exports."""

    class Format(models.TextChoices):
        CSV = 'csv', 'CSV'
        EXCEL = 'excel', 'Excel'

    academic_year = models.ForeignKey(
        'shared.AcademicYear', on_delete=models.CASCADE,
        related_name='udise_exports',
    )
    exported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='udise_exports',
    )
    exported_at = models.DateTimeField(auto_now_add=True)
    format = models.CharField(max_length=10, choices=Format.choices)
    record_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'udise_export_logs'
        verbose_name = 'U-DISE Export Log'
        ordering = ['-exported_at']

    def __str__(self):
        return f'Export {self.academic_year.label} ({self.format}) — {self.exported_at:%Y-%m-%d}'
