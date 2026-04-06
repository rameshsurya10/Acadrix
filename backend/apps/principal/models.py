from django.conf import settings
from django.db import models


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


class SourceDocument(models.Model):
    """Uploaded textbook/syllabus used for AI question generation."""
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='source_documents',
    )
    file = models.FileField(upload_to='source_documents/')
    file_name = models.CharField(max_length=200)
    file_size_bytes = models.PositiveIntegerField(default=0)
    subject_context = models.CharField(max_length=120, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'source_documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.file_name


class GeneratedQuestion(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium', 'Medium'
        HARD = 'hard', 'Hard'

    source_document = models.ForeignKey(
        SourceDocument, on_delete=models.CASCADE,
        related_name='questions', null=True, blank=True,
    )
    reference_id = models.CharField(max_length=30, unique=True)  # AI-MATH-772
    question_text = models.TextField()
    key_answer = models.TextField(blank=True)
    topic = models.CharField(max_length=120)
    subject = models.ForeignKey(
        'shared.Subject', on_delete=models.CASCADE,
        related_name='generated_questions',
    )
    marks = models.PositiveSmallIntegerField(default=2)
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    grading_rubric = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='approved_questions',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'generated_questions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.reference_id}: {self.question_text[:60]}'


class AssessmentQuestion(models.Model):
    """Links approved questions to a teacher's assessment (test)."""
    assessment = models.ForeignKey(
        'teacher.Assessment', on_delete=models.CASCADE,
        related_name='assessment_questions',
    )
    question = models.ForeignKey(
        GeneratedQuestion, on_delete=models.CASCADE,
        related_name='assessment_uses',
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'assessment_questions'
        unique_together = ['assessment', 'question']
        ordering = ['order']


class InstitutionEvent(models.Model):
    """School events, assemblies, sports — shown on principal dashboard."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_date = models.DateTimeField()
    location = models.CharField(max_length=120, blank=True)
    photo = models.ImageField(upload_to='events/', blank=True)
    photo_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_events',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'institution_events'
        ordering = ['-event_date']
