"""Cache invalidation signals for Phase 1.6.

These signals bump the cache version numbers in apps/shared/cache_utils.py
whenever data that feeds the cached endpoints changes. Using the version-key
pattern means we never need to enumerate individual cache keys — one
`bump_version()` call invalidates every cached entry in that group atomically.

Signals are connected in apps/shared/apps.py SharedConfig.ready().
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.shared.cache_utils import invalidate_dashboards, invalidate_reference_data


def _connect_signals():
    """Imports and connects signal receivers. Called from SharedConfig.ready()."""

    from apps.accounts.models import User
    from apps.admin_panel.models import AdmissionApplication
    from apps.shared.models import Grade, Subject, Department, AcademicYear
    from apps.student.models import StudentProfile, Payment
    from apps.teacher.models import TeacherProfile

    # ── Dashboard invalidators ────────────────────────────────────────────

    @receiver([post_save, post_delete], sender=User, weak=False, dispatch_uid='cache_user_dashboard')
    def _user_changed(sender, instance, **kwargs):
        invalidate_dashboards()
        invalidate_reference_data()  # faculty directory uses User

    @receiver([post_save, post_delete], sender=StudentProfile, weak=False, dispatch_uid='cache_student_dashboard')
    def _student_changed(sender, instance, **kwargs):
        invalidate_dashboards()

    @receiver([post_save, post_delete], sender=TeacherProfile, weak=False, dispatch_uid='cache_teacher_dashboard')
    def _teacher_changed(sender, instance, **kwargs):
        invalidate_dashboards()
        invalidate_reference_data()  # faculty directory

    @receiver([post_save, post_delete], sender=AdmissionApplication, weak=False, dispatch_uid='cache_admission_dashboard')
    def _admission_changed(sender, instance, **kwargs):
        invalidate_dashboards()

    @receiver([post_save], sender=Payment, weak=False, dispatch_uid='cache_payment_dashboard')
    def _payment_changed(sender, instance, **kwargs):
        invalidate_dashboards()

    # ── Reference data invalidators ───────────────────────────────────────

    @receiver([post_save, post_delete], sender=Grade, weak=False, dispatch_uid='cache_grade_ref')
    def _grade_changed(sender, instance, **kwargs):
        invalidate_reference_data()

    @receiver([post_save, post_delete], sender=Subject, weak=False, dispatch_uid='cache_subject_ref')
    def _subject_changed(sender, instance, **kwargs):
        invalidate_reference_data()

    @receiver([post_save, post_delete], sender=Department, weak=False, dispatch_uid='cache_department_ref')
    def _department_changed(sender, instance, **kwargs):
        invalidate_reference_data()

    @receiver([post_save, post_delete], sender=AcademicYear, weak=False, dispatch_uid='cache_year_ref')
    def _year_changed(sender, instance, **kwargs):
        invalidate_reference_data()
