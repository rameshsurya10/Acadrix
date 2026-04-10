from django.db import transaction
from django.db.models import Count, Q, Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.emails import send_welcome_email
from apps.accounts.models import User
from apps.accounts.permissions import IsSuperAdminOrAdmin as IsAdmin, IsFinanceOrAdmin, IsFinanceViewer
from apps.accounts.utils import generate_id
from apps.shared.models import Section
from apps.student.models import StudentProfile
from apps.teacher.models import TeacherProfile

from .models import AdmissionApplication, AdmissionDocument, AdminNotification, IDConfiguration
from .serializers import (
    AdmissionApplicationDetailSerializer,
    AdmissionApplicationListSerializer,
    AdmissionDocumentSerializer,
    AdminNotificationSerializer,
    IDConfigurationSerializer,
)


# ── Admission Applications ─────────────────────────────────────────

class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    """CRUD for admission applications. Admin-only."""
    permission_classes = [IsAdmin]
    queryset = AdmissionApplication.objects.select_related(
        'grade_applying', 'reviewed_by', 'student_created',
    ).prefetch_related('documents')
    filterset_fields = ['status', 'grade_applying', 'program']
    search_fields = ['applicant_name', 'applicant_email', 'application_id']
    ordering_fields = ['applied_at', 'updated_at', 'applicant_name', 'status']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdmissionApplicationListSerializer
        return AdmissionApplicationDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save(reviewed_by=self.request.user)
        if instance.status == 'finalized' and instance.student_created is None:
            self._create_student_from_application(instance)

    def _create_student_from_application(self, application):
        if User.objects.filter(email=application.applicant_email).exists():
            return

        try:
            student_id = generate_id('student')
        except ValueError:
            return

        name_parts = application.applicant_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        section = None
        if application.grade_applying:
            section = (
                application.grade_applying.sections
                .filter(academic_year__is_current=True)
                .order_by('name')
                .first()
            )

        with transaction.atomic():
            user = User(
                username=application.applicant_email,
                email=application.applicant_email,
                first_name=first_name, last_name=last_name,
                phone=application.applicant_phone, role='student',
            )
            user.set_unusable_password()
            user.save()

            profile = StudentProfile.objects.create(
                user=user, student_id=student_id,
                section=section, date_of_birth=application.date_of_birth,
            )

            if application.guardian_name:
                from apps.student.models import Guardian
                Guardian.objects.create(
                    student=profile, name=application.guardian_name,
                    phone=application.guardian_phone,
                    email=application.guardian_email, is_primary=True,
                )

            # Auto-apply fee template for the student's grade
            from .finance_serializers import apply_fee_template_to_student
            apply_fee_template_to_student(profile)

            application.student_created = profile
            application.save(update_fields=['student_created'])

        send_welcome_email(
            email=user.email, first_name=first_name,
            role='student', generated_id=student_id,
        )


# ── Admission Documents ────────────────────────────────────────────

class AdmissionDocumentViewSet(viewsets.ModelViewSet):
    """Documents belonging to a specific admission application."""
    permission_classes = [IsAdmin]
    serializer_class = AdmissionDocumentSerializer
    filterset_fields = ['status', 'doc_type']
    ordering_fields = ['uploaded_at']

    def get_queryset(self):
        return AdmissionDocument.objects.filter(
            application_id=self.kwargs['application_pk'],
        ).select_related('application')

    def perform_create(self, serializer):
        serializer.save(application_id=self.kwargs['application_pk'])


# ── Admin Notifications ────────────────────────────────────────────

class AdminNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """List & retrieve notifications for the authenticated admin."""
    permission_classes = [IsAdmin]
    serializer_class = AdminNotificationSerializer
    filterset_fields = ['priority', 'category', 'is_read']
    search_fields = ['title', 'body']
    ordering_fields = ['created_at', 'priority']

    def get_queryset(self):
        return AdminNotification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """PATCH /notifications/{id}/mark_read/ — mark a single notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        """PATCH /notifications/mark_all_read/ — mark every unread notification as read."""
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'updated': updated})


# ── Dashboard Stats ────────────────────────────────────────────────

class DashboardStatsView(GenericAPIView):
    """GET /dashboard-stats/ — aggregated metrics for the admin dashboard."""
    permission_classes = [IsAdmin]

    def get(self, request):
        total_students = StudentProfile.objects.filter(is_active=True).count()
        total_teachers = TeacherProfile.objects.filter(is_active=True).count()
        pending_admissions = AdmissionApplication.objects.filter(
            status=AdmissionApplication.Status.PENDING,
        ).count()

        # Capacity: sum of section capacities vs enrolled students
        total_capacity = Section.objects.aggregate(
            total=Sum('capacity'),
        )['total'] or 0
        capacity_pct = (
            round((total_students / total_capacity) * 100, 1)
            if total_capacity > 0
            else 0.0
        )

        unread_notifications = AdminNotification.objects.filter(
            recipient=request.user, is_read=False,
        ).count()

        return Response({
            'total_students': total_students,
            'total_teachers': total_teachers,
            'pending_admissions': pending_admissions,
            'capacity_percent': capacity_pct,
            'total_capacity': total_capacity,
            'unread_notifications': unread_notifications,
        })


# ── ID Configuration ──────────────────────────────────────────────

class IDConfigurationViewSet(viewsets.ModelViewSet):
    """CRUD for ID prefix configuration. Admin only."""
    permission_classes = [IsAdmin]
    queryset = IDConfiguration.objects.all()
    serializer_class = IDConfigurationSerializer
    lookup_field = 'role'
    http_method_names = ['get', 'put', 'patch']


# ── Admin Assessment List (read-only) ────────────────────────────

class AdminAssessmentListView(GenericAPIView):
    """GET /admin/assessments/ — list all assessments for admin oversight."""
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.teacher.models import Assessment

        queryset = Assessment.objects.select_related(
            'course__subject', 'course__section__grade', 'teacher',
        ).order_by('-created_at')

        # Optional filters
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(teacher__first_name__icontains=search)
                | Q(teacher__last_name__icontains=search)
            )

        assessments = []
        for a in queryset[:50]:
            assessments.append({
                'id': a.id,
                'title': a.title,
                'teacher_name': a.teacher.full_name if a.teacher else None,
                'teacher_id': a.teacher_id,
                'subject_name': a.course.subject.name if a.course and a.course.subject else None,
                'section': str(a.course.section) if a.course and a.course.section else None,
                'total_marks': a.total_marks,
                'scheduled_date': a.scheduled_date,
                'duration_minutes': a.duration_minutes,
                'status': a.status,
                'created_at': a.created_at,
            })

        # Stats
        total = Assessment.objects.count()
        stats = Assessment.objects.aggregate(
            drafts=Count('id', filter=Q(status='draft')),
            live=Count('id', filter=Q(status='live')),
            scheduled=Count('id', filter=Q(status='scheduled')),
            pending_approval=Count('id', filter=Q(status='pending_approval')),
            completed=Count('id', filter=Q(status='completed')),
        )

        return Response({
            'success': True,
            'data': assessments,
            'stats': {
                'total': total,
                'drafts': stats['drafts'],
                'live': stats['live'],
                'scheduled': stats['scheduled'],
                'pending_approval': stats['pending_approval'],
                'completed': stats['completed'],
            },
        })


# ── Admin Finance Overview ────────────────────────────────────────

class AdminFinanceOverviewView(GenericAPIView):
    """GET /admin/finance-overview/ — financial summary (read-only for admin, principal; full for finance)."""
    permission_classes = [IsFinanceViewer]

    def get(self, request):
        from apps.student.models import TuitionAccount

        accounts = TuitionAccount.objects.select_related(
            'student__user', 'student__section__grade',
        )

        # Aggregate stats
        totals = accounts.aggregate(
            total_revenue=Sum('total_amount'),
            total_collected=Sum('paid_amount'),
            total_accounts=Count('id'),
            paid_count=Count('id', filter=Q(status='paid')),
            overdue_count=Count('id', filter=Q(status='overdue')),
            pending_count=Count('id', filter=Q(status='pending')),
            partial_count=Count('id', filter=Q(status='partial')),
        )

        total_revenue = float(totals['total_revenue'] or 0)
        total_collected = float(totals['total_collected'] or 0)
        outstanding = total_revenue - total_collected
        collection_rate = (
            round((total_collected / total_revenue * 100), 1)
            if total_revenue > 0 else 0
        )

        # Search & filter
        qs = accounts.order_by('-updated_at')

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        search = request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(student__user__first_name__icontains=search)
                | Q(student__user__last_name__icontains=search)
                | Q(student__student_id__icontains=search)
            )

        # Paginate manually
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        total_count = qs.count()
        offset = (page - 1) * page_size

        account_list = []
        for acct in qs[offset:offset + page_size]:
            account_list.append({
                'id': acct.id,
                'student_id': acct.student.student_id,
                'student_name': acct.student.user.full_name,
                'section': str(acct.student.section) if acct.student.section else None,
                'total_amount': str(acct.total_amount),
                'paid_amount': str(acct.paid_amount),
                'outstanding': str(acct.outstanding_balance),
                'status': acct.status,
                'due_date': acct.due_date,
                'semester': acct.semester,
            })

        return Response({
            'success': True,
            'data': account_list,
            'stats': {
                'total_revenue': str(total_revenue),
                'total_collected': str(total_collected),
                'outstanding': str(outstanding),
                'collection_rate': collection_rate,
                'total_accounts': totals['total_accounts'],
                'paid_count': totals['paid_count'],
                'overdue_count': totals['overdue_count'],
                'pending_count': totals['pending_count'],
                'partial_count': totals['partial_count'],
            },
            'pagination': {
                'total': total_count,
                'page': page,
                'page_size': page_size,
            },
        })
