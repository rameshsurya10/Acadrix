from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'departments'
        ordering = ['name']

    def __str__(self):
        return self.name


class AcademicYear(models.Model):
    label = models.CharField(max_length=20, unique=True)  # "2024-2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academic_years'
        ordering = ['-start_date']

    def __str__(self):
        return self.label


class Grade(models.Model):
    level = models.PositiveSmallIntegerField(unique=True)
    label = models.CharField(max_length=30)  # "Grade 10"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grades'
        ordering = ['level']

    def __str__(self):
        return self.label


class Section(models.Model):
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=10)  # "A", "B", "C"
    capacity = models.PositiveIntegerField(default=40)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='sections')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sections'
        unique_together = ['grade', 'name', 'academic_year']
        ordering = ['grade__level', 'name']

    def __str__(self):
        return f'{self.grade.label}-{self.name}'


class Subject(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subjects'
        ordering = ['name']

    def __str__(self):
        return self.name


class Course(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='courses')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='courses')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='taught_courses',
        limit_choices_to={'role': 'teacher'},
    )
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='courses')
    location = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        unique_together = ['subject', 'section', 'academic_year']

    def __str__(self):
        return f'{self.subject.name} — {self.section}'


class ScheduleSlot(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 1
        TUESDAY = 2
        WEDNESDAY = 3
        THURSDAY = 4
        FRIDAY = 5
        SATURDAY = 6

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedule_slots')
    day = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=60, blank=True)

    class Meta:
        db_table = 'schedule_slots'
        ordering = ['day', 'start_time']

    def __str__(self):
        return f'{self.course} — {self.get_day_display()} {self.start_time}'


class Conversation(models.Model):
    class Category(models.TextChoices):
        INTERNAL = 'internal', 'Internal'
        PARENTS = 'parents', 'Parents'
        SYSTEM = 'system', 'System'

    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.INTERNAL)
    subject = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-updated_at']


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    attachment = models.FileField(upload_to='message_attachments/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender} — {self.body[:50]}'
