from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin, IsStaff, IsStudent
from apps.shared.models import ScheduleSlot
from apps.teacher.models import GradeEntry
from .models import (
    Attendance,
    Document,
    ExtracurricularActivity,
    Guardian,
    HealthRecord,
    Payment,
    PaymentMethod,
    StudentProfile,
    TuitionAccount,
)
from .serializers import (
    AttendanceSerializer,
    DocumentSerializer,
    ExtracurricularActivitySerializer,
    HealthRecordSerializer,
    PaymentMethodSerializer,
    PaymentSerializer,
    StudentProfileSerializer,
    TuitionAccountSerializer,
)


# ── Helpers ─────────────────────────────────────────────────────────

def _get_student_profile(user):
    """Return the StudentProfile for the authenticated student user."""
    return StudentProfile.objects.select_related(
        'section__grade', 'user',
    ).get(user=user)


# ── ViewSets ────────────────────────────────────────────────────────

class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    Students: retrieve / update own profile.
    Admin/Staff: list all students.
    """
    serializer_class = StudentProfileSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticated(), (IsAdmin | IsStaff)()]
        return [IsAuthenticated(), (IsStudent | IsAdmin | IsStaff)()]

    def get_queryset(self):
        qs = StudentProfile.objects.select_related(
            'user', 'section__grade',
        ).prefetch_related('guardians')

        user = self.request.user
        if user.role == 'student':
            return qs.filter(user=user)
        return qs.filter(is_active=True)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    Students: list / create documents for own profile.
    Admin/Staff: list all documents.
    """
    serializer_class = DocumentSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_permissions(self):
        return [IsAuthenticated(), (IsStudent | IsAdmin | IsStaff)()]

    def get_queryset(self):
        qs = Document.objects.select_related('verified_by')
        user = self.request.user
        if user.role == 'student':
            return qs.filter(student__user=user)
        return qs.all()

    def perform_create(self, serializer):
        profile = _get_student_profile(self.request.user)
        serializer.save(student=profile)


class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """Students see own attendance. Admin/Staff see all."""
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        return [IsAuthenticated(), (IsStudent | IsAdmin | IsStaff)()]

    def get_queryset(self):
        qs = Attendance.objects.select_related('student')
        user = self.request.user
        if user.role == 'student':
            return qs.filter(student__user=user)
        return qs.all()


class HealthRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """Students see own health records. Admin/Staff see all."""
    serializer_class = HealthRecordSerializer

    def get_permissions(self):
        return [IsAuthenticated(), (IsStudent | IsAdmin | IsStaff)()]

    def get_queryset(self):
        qs = HealthRecord.objects.select_related('student')
        user = self.request.user
        if user.role == 'student':
            return qs.filter(student__user=user)
        return qs.all()


class ExtracurricularActivityViewSet(viewsets.ModelViewSet):
    """Students: list / create activities. Admin/Staff: list all."""
    serializer_class = ExtracurricularActivitySerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        return [IsAuthenticated(), (IsStudent | IsAdmin | IsStaff)()]

    def get_queryset(self):
        qs = ExtracurricularActivity.objects.select_related('student')
        user = self.request.user
        if user.role == 'student':
            return qs.filter(student__user=user)
        return qs.all()

    def perform_create(self, serializer):
        profile = _get_student_profile(self.request.user)
        serializer.save(student=profile)


class PaymentHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Students see own payments. Admin/Staff see all."""
    serializer_class = PaymentSerializer

    def get_permissions(self):
        return [IsAuthenticated(), (IsStudent | IsAdmin | IsStaff)()]

    def get_queryset(self):
        qs = Payment.objects.select_related('account__student', 'paid_by')
        user = self.request.user
        if user.role == 'student':
            return qs.filter(account__student__user=user)
        return qs.all()


# ── API Views ───────────────────────────────────────────────────────

class TuitionAccountView(GenericAPIView):
    """GET /api/v1/student/tuition/ -- returns student's tuition details."""
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = TuitionAccountSerializer

    def get(self, request):
        try:
            account = TuitionAccount.objects.select_related(
                'student',
            ).prefetch_related(
                'line_items',
            ).get(student__user=request.user)
        except TuitionAccount.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No tuition account found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(account)
        return Response({'success': True, 'data': serializer.data})


class StudentDashboardView(GenericAPIView):
    """
    GET /api/v1/student/dashboard/
    Returns aggregated stats for the authenticated student:
      - profile basics
      - GPA placeholder (requires grades model)
      - attendance percentage
      - upcoming schedule slots
      - active extracurricular activities
      - tuition summary
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            profile = _get_student_profile(request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Student profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Attendance stats (single aggregate query instead of two count queries)
        attendance_stats = Attendance.objects.filter(student=profile).aggregate(
            total_days=Count('id'),
            present_days=Count('id', filter=Q(is_present=True)),
        )
        total_days = attendance_stats['total_days']
        present_days = attendance_stats['present_days']
        attendance_pct = (
            round((present_days / total_days) * 100, 1) if total_days else 0.0
        )

        # Upcoming schedule (today onward)
        today = timezone.localdate()
        current_day = today.isoweekday()  # 1=Mon ... 7=Sun
        upcoming_slots = []
        if profile.section:
            slots = (
                ScheduleSlot.objects
                .filter(course__section=profile.section, day__gte=current_day)
                .select_related('course__subject', 'course__teacher')
                .order_by('day', 'start_time')[:5]
            )
            for slot in slots:
                upcoming_slots.append({
                    'subject': slot.course.subject.name,
                    'teacher': (
                        slot.course.teacher.full_name
                        if slot.course.teacher else None
                    ),
                    'day': slot.get_day_display(),
                    'start_time': slot.start_time.strftime('%H:%M'),
                    'end_time': slot.end_time.strftime('%H:%M'),
                    'location': slot.location or slot.course.location,
                })

        # Active extracurricular activities
        activities = list(
            ExtracurricularActivity.objects
            .filter(student=profile, is_active=True)
            .values('id', 'name', 'role', 'schedule')
        )

        # Tuition summary
        tuition = None
        try:
            account = profile.tuition_account
            tuition = {
                'total_amount': str(account.total_amount),
                'paid_amount': str(account.paid_amount),
                'outstanding_balance': str(account.outstanding_balance),
                'status': account.status,
                'due_date': account.due_date,
                'semester': account.semester,
            }
        except TuitionAccount.DoesNotExist:
            pass

        data = {
            'profile': {
                'student_id': profile.student_id,
                'full_name': profile.user.full_name,
                'section': str(profile.section) if profile.section else None,
                'house': profile.house,
            },
            'attendance': {
                'total_days': total_days,
                'present_days': present_days,
                'percentage': attendance_pct,
            },
            'upcoming_schedule': upcoming_slots,
            'activities': activities,
            'tuition': tuition,
        }

        return Response({'success': True, 'data': data})


class StudentGradesView(GenericAPIView):
    """GET /api/v1/student/grades/ -- returns the authenticated student's grade entries."""
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            profile = _get_student_profile(request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Student profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        grade_entries = (
            GradeEntry.objects
            .filter(student=profile)
            .select_related(
                'assessment__subject',
                'assessment__course__section',
            )
            .order_by('-graded_at')
        )

        data = [
            {
                'assessment_title': entry.assessment.title,
                'subject_name': entry.assessment.subject.name,
                'section': str(entry.assessment.course.section) if entry.assessment.course else None,
                'marks_obtained': str(entry.marks_obtained),
                'total_marks': entry.assessment.total_marks,
                'letter_grade': entry.letter_grade,
                'remarks': entry.remarks,
                'graded_at': entry.graded_at.isoformat() if entry.graded_at else None,
            }
            for entry in grade_entries
        ]

        return Response({'success': True, 'data': data})


# ── Parent endpoints (merged into student app) ─────────────────────

class PaymentMethodViewSet(viewsets.ModelViewSet):
    """CRUD for parent's saved payment methods."""
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)


class ParentDashboardView(GenericAPIView):
    """
    GET /api/v1/student/parent-dashboard/
    Returns linked students, outstanding balances, recent receipts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        guardianships = Guardian.objects.filter(
            email=request.user.email,
        ).select_related(
            'student__user', 'student__section__grade',
        ).prefetch_related(
            'student__tuition_account',  # reverse OneToOne needs prefetch, not select_related
        )

        students_data = []
        total_outstanding = 0
        for g in guardianships:
            sp = g.student
            tuition = None
            try:
                acct = sp.tuition_account
                tuition = {
                    'total_amount': str(acct.total_amount),
                    'paid_amount': str(acct.paid_amount),
                    'outstanding': str(acct.outstanding_balance),
                    'status': acct.status,
                    'due_date': acct.due_date,
                }
                total_outstanding += float(acct.outstanding_balance)
            except TuitionAccount.DoesNotExist:
                pass
            students_data.append({
                'student_id': sp.student_id,
                'full_name': sp.user.full_name,
                'grade': str(sp.section) if sp.section else None,
                'tuition': tuition,
            })

        recent_receipts = list(
            Payment.objects.filter(
                paid_by=request.user,
            ).order_by('-paid_at')[:10].values(
                'receipt_id', 'amount', 'method', 'paid_at',
            )
        )

        return Response({
            'success': True,
            'data': {
                'students': students_data,
                'total_outstanding': str(total_outstanding),
                'recent_receipts': recent_receipts,
            },
        })
