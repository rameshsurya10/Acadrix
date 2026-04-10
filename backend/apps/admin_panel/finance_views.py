import logging
from datetime import date

from django.db.models import F
from rest_framework import status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.permissions import IsFinanceOrAdmin
from apps.student.models import Payment, StudentProfile, TuitionAccount
from apps.super_admin.models import SchoolSettings
from .models import FeeTemplate, FeeTemplateItem, StudentDiscount
from .finance_serializers import (
    FeeTemplateSerializer,
    RecordPaymentSerializer,
    StudentDiscountSerializer,
    apply_fee_template_to_student,
)

logger = logging.getLogger('apps')


# ── Fee Templates ──────────────────────────────────────────────────

class FeeTemplateViewSet(viewsets.ModelViewSet):
    """CRUD for grade-based fee templates. Finance role + super admin only."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = FeeTemplateSerializer
    filterset_fields = ['grade', 'academic_year', 'is_active']
    search_fields = ['name']

    def get_queryset(self):
        return (
            FeeTemplate.objects
            .select_related('grade', 'academic_year')
            .prefetch_related('items')
            .all()
        )


# ── Student Discounts ──────────────────────────────────────────────

class StudentDiscountViewSet(viewsets.ModelViewSet):
    """CRUD for per-student scholarships/discounts. Finance role + super admin only."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = StudentDiscountSerializer
    filterset_fields = ['student', 'discount_type']
    search_fields = ['description']

    def get_queryset(self):
        return StudentDiscount.objects.select_related('student__user', 'applied_by').all()

    def perform_create(self, serializer):
        serializer.save(applied_by=self.request.user)


# ── Record Payment ─────────────────────────────────────────────────

class RecordPaymentView(GenericAPIView):
    """POST — Finance staff records a payment for a student."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = RecordPaymentSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        logger.info(
            'Payment recorded: %s for student %s, amount %s by %s',
            payment.receipt_id, payment.account.student, payment.amount, request.user,
        )

        return Response({
            'success': True,
            'data': {
                'receipt_id': payment.receipt_id,
                'amount': str(payment.amount),
                'method': payment.method,
                'paid_at': payment.paid_at.isoformat(),
            },
            'message': f'Payment of {payment.amount} recorded successfully.',
        }, status=status.HTTP_201_CREATED)


# ── Apply Template to Existing Students ────────────────────────────

class ApplyFeeTemplateView(GenericAPIView):
    """POST — Bulk-apply a fee template to all students in a grade. Finance role + super admin only."""
    permission_classes = [IsFinanceOrAdmin]

    def post(self, request):
        template_id = request.data.get('template_id')
        if not template_id:
            return Response(
                {'success': False, 'error': 'template_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            template = FeeTemplate.objects.prefetch_related('items').get(pk=template_id)
        except FeeTemplate.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Template not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        students = (
            StudentProfile.objects
            .filter(
                section__grade=template.grade,
                section__academic_year=template.academic_year,
                is_active=True,
            )
            .exclude(tuition_account__isnull=False)
        )

        created_count = 0
        for profile in students:
            account = apply_fee_template_to_student(profile)
            if account:
                created_count += 1

        logger.info(
            'Fee template "%s" applied to %d students by %s',
            template.name, created_count, request.user,
        )

        return Response({
            'success': True,
            'message': f'Fee template applied to {created_count} students.',
            'data': {'created_count': created_count},
        })


# ── Fee Defaulters ────────────────────────────────────────────────

class FeeDefaultersView(GenericAPIView):
    """GET /api/v1/admin/fee-defaulters/ -- list students with overdue/pending tuition."""
    permission_classes = [IsFinanceOrAdmin]

    ALLOWED_STATUSES = {'overdue', 'pending', 'partial'}

    def get(self, request):
        qs = (
            TuitionAccount.objects
            .filter(
                status__in=self.ALLOWED_STATUSES,
            )
            .select_related(
                'student__user',
                'student__section__grade',
            )
        )

        # -- optional filters --
        status_filter = request.query_params.get('status')
        if status_filter and status_filter in self.ALLOWED_STATUSES:
            qs = qs.filter(status=status_filter)

        grade_filter = request.query_params.get('grade')
        if grade_filter:
            qs = qs.filter(student__section__grade__level=grade_filter)

        # Annotate outstanding_balance at DB level for filtering and ordering
        qs = qs.annotate(
            db_outstanding=F('total_amount') - F('paid_amount'),
        ).filter(db_outstanding__gt=0)

        # Order by due_date ascending (most overdue first = earliest due_date)
        qs = qs.order_by(F('due_date').asc(nulls_last=True))

        today = date.today()
        results = []
        for account in qs:
            student = account.student
            user = student.user
            section = student.section

            days_overdue = 0
            if account.due_date and account.due_date < today:
                days_overdue = (today - account.due_date).days

            results.append({
                'student_id': student.student_id,
                'student_name': user.full_name,
                'section': str(section) if section else '',
                'total_amount': str(account.total_amount),
                'paid_amount': str(account.paid_amount),
                'outstanding_balance': str(account.outstanding_balance),
                'status': account.status,
                'due_date': account.due_date.isoformat() if account.due_date else None,
                'days_overdue': days_overdue,
            })

        # Sort by days_overdue descending (most overdue first)
        results.sort(key=lambda r: r['days_overdue'], reverse=True)

        return Response({
            'success': True,
            'data': results,
            'total': len(results),
        })


# ── Payment Receipt ───────────────────────────────────────────────

class PaymentReceiptView(GenericAPIView):
    """GET /api/v1/admin/payments/{payment_id}/receipt/ -- generate receipt data."""
    permission_classes = [IsFinanceOrAdmin]

    def get(self, request, payment_id):
        try:
            payment = (
                Payment.objects
                .select_related(
                    'account__student__user',
                    'account__student__section__grade',
                    'paid_by',
                )
                .get(pk=payment_id)
            )
        except Payment.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        account = payment.account
        student = account.student
        user = student.user
        section = student.section

        # Fetch school settings (single-row table)
        school = SchoolSettings.objects.first()
        school_name = school.school_name if school else 'Acadrix School'
        school_address = school.address if school else ''

        paid_by_name = ''
        if payment.paid_by:
            paid_by_name = payment.paid_by.full_name

        receipt_data = {
            'school_name': school_name,
            'school_address': school_address,
            'receipt_number': payment.receipt_id,
            'student_name': user.full_name,
            'student_id': student.student_id,
            'section': str(section) if section else '',
            'amount': str(payment.amount),
            'method': payment.get_method_display(),
            'paid_at': payment.paid_at.isoformat(),
            'paid_by_name': paid_by_name,
            'notes': payment.notes,
            'account_balance_after_payment': str(account.outstanding_balance),
        }

        return Response({
            'success': True,
            'data': receipt_data,
        })
