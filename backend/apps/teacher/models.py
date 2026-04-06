from django.conf import settings
from django.db import models


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='teacher_profile',
        limit_choices_to={'role': 'teacher'},
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        'shared.Department', on_delete=models.SET_NULL,
        null=True, related_name='teachers',
    )
    title = models.CharField(max_length=60, blank=True)  # "Head of Physics"
    qualification = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    date_joined = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    employment_status = models.CharField(
        max_length=20,
        choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract')],
        default='full_time',
    )
    performance_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    research_focus = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_profiles'
        indexes = [models.Index(fields=['employee_id'])]

    def __str__(self):
        return f'{self.user.full_name} ({self.employee_id})'


class Assignment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        DRAFT = 'draft', 'Draft'
        CLOSED = 'closed', 'Closed'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course = models.ForeignKey('shared.Course', on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='assignments',
        limit_choices_to={'role': 'teacher'},
    )
    due_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['-due_date']

    def __str__(self):
        return self.title


class Assessment(models.Model):
    """A test or exam created by a teacher."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SCHEDULED = 'scheduled', 'Scheduled'
        LIVE = 'live', 'Live'
        COMPLETED = 'completed', 'Completed'
        PENDING_APPROVAL = 'pending_approval', 'Pending Approval'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course = models.ForeignKey('shared.Course', on_delete=models.CASCADE, related_name='assessments')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='assessments',
        limit_choices_to={'role': 'teacher'},
    )
    subject = models.ForeignKey('shared.Subject', on_delete=models.CASCADE, related_name='assessments')
    total_marks = models.PositiveIntegerField(default=100)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    shuffle_questions = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessments'
        ordering = ['-scheduled_date']
        indexes = [models.Index(fields=['status'])]

    def __str__(self):
        return self.title


class GradeEntry(models.Model):
    """A single grade for a student on an assessment."""
    student = models.ForeignKey(
        'student.StudentProfile', on_delete=models.CASCADE, related_name='grade_entries',
    )
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='grade_entries')
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    letter_grade = models.CharField(max_length=5, blank=True)
    remarks = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='graded_entries',
    )
    graded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grade_entries'
        unique_together = ['student', 'assessment']

    def __str__(self):
        return f'{self.student} — {self.assessment}: {self.marks_obtained}'


class HealthObservation(models.Model):
    """Teacher-logged health observations for students."""
    student = models.ForeignKey(
        'student.StudentProfile', on_delete=models.CASCADE,
        related_name='health_observations',
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='health_observations',
        limit_choices_to={'role': 'teacher'},
    )
    observation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'health_observations'
        ordering = ['-created_at']
