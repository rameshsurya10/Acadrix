import logging

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsFinanceOrAdmin, IsSuperAdminOrAdmin as IsAdmin

from .models import PayrollRun, PayslipEntry, SalaryStructure, StaffDocument, StaffProfile
from .serializers import (
    PayrollRunSerializer,
    PayslipEntrySerializer,
    ProcessPayrollSerializer,
    SalaryStructureSerializer,
    StaffDocumentSerializer,
    StaffProfileSerializer,
)

logger = logging.getLogger(__name__)


# ── Staff Profile ─────────────────────────────────────────────────────

class StaffProfileViewSet(viewsets.ModelViewSet):
    """CRUD for non-teaching staff profiles. Admin-only."""
    permission_classes = [IsAdmin]
    serializer_class = StaffProfileSerializer
    queryset = StaffProfile.objects.select_related('user', 'department').order_by('-created_at')
    filterset_fields = ['is_active', 'employment_type', 'department']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id', 'designation']
    ordering_fields = ['created_at', 'date_of_joining', 'employee_id']


# ── Salary Structure ──────────────────────────────────────────────────

class SalaryStructureViewSet(viewsets.ModelViewSet):
    """CRUD for salary structures. Finance/Admin only."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = SalaryStructureSerializer
    queryset = SalaryStructure.objects.select_related('user').order_by('-effective_from')
    filterset_fields = ['user', 'is_active']
    search_fields = ['user__first_name', 'user__last_name']
    ordering_fields = ['effective_from', 'basic', 'created_at']


# ── Payroll Run ───────────────────────────────────────────────────────

class PayrollRunViewSet(viewsets.ModelViewSet):
    """CRUD for payroll runs. Finance/Admin only."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = PayrollRunSerializer
    queryset = (
        PayrollRun.objects
        .select_related('academic_year', 'processed_by')
        .prefetch_related('payslips')
        .order_by('-year', '-month')
    )
    filterset_fields = ['status', 'year', 'academic_year']
    ordering_fields = ['year', 'month', 'total_net']


# ── Process Payroll ───────────────────────────────────────────────────

class ProcessPayrollView(GenericAPIView):
    """POST: Calculate all payslips for a draft payroll run."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = ProcessPayrollSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        run = serializer.save()
        logger.info(
            'Payroll processed: %s/%s by %s — %d payslips',
            run.month, run.year, request.user.full_name, run.payslips.count(),
        )
        return Response(
            {
                'success': True,
                'message': f'Payroll for {run.month:02d}/{run.year} processed successfully.',
                'data': PayrollRunSerializer(run).data,
            },
            status=status.HTTP_200_OK,
        )


# ── Finalize Payroll ──────────────────────────────────────────────────

class FinalizePayrollView(GenericAPIView):
    """POST: Lock a processed payroll run so it cannot be re-processed."""
    permission_classes = [IsFinanceOrAdmin]

    def post(self, request):
        payroll_run_id = request.data.get('payroll_run_id')
        if not payroll_run_id:
            return Response(
                {'success': False, 'error': 'payroll_run_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            run = PayrollRun.objects.get(pk=payroll_run_id)
        except PayrollRun.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Payroll run not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if run.status != PayrollRun.Status.PROCESSED:
            return Response(
                {'success': False, 'error': 'Only processed payroll runs can be finalized.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        run.status = PayrollRun.Status.FINALIZED
        run.save(update_fields=['status', 'updated_at'])

        logger.info(
            'Payroll finalized: %s/%s by %s',
            run.month, run.year, request.user.full_name,
        )
        return Response(
            {
                'success': True,
                'message': f'Payroll for {run.month:02d}/{run.year} has been finalized.',
                'data': PayrollRunSerializer(run).data,
            },
            status=status.HTTP_200_OK,
        )


# ── Payslip Views ─────────────────────────────────────────────────────

class PayslipViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only payslip list for Finance/Admin (all staff payslips)."""
    permission_classes = [IsFinanceOrAdmin]
    serializer_class = PayslipEntrySerializer
    queryset = (
        PayslipEntry.objects
        .select_related('payroll_run', 'staff')
        .order_by('-payroll_run__year', '-payroll_run__month')
    )
    filterset_fields = ['payroll_run', 'staff', 'status']
    search_fields = ['staff__first_name', 'staff__last_name']
    ordering_fields = ['net_salary', 'gross_salary']


class MyPayslipsView(ListAPIView):
    """GET: Authenticated user retrieves their own payslips."""
    permission_classes = [IsAuthenticated]
    serializer_class = PayslipEntrySerializer

    def get_queryset(self):
        return (
            PayslipEntry.objects
            .filter(staff=self.request.user)
            .select_related('payroll_run')
            .order_by('-payroll_run__year', '-payroll_run__month')
        )


# ── Staff Document ────────────────────────────────────────────────────

class StaffDocumentViewSet(viewsets.ModelViewSet):
    """CRUD for staff HR documents. Admin-only."""
    permission_classes = [IsAdmin]
    serializer_class = StaffDocumentSerializer
    queryset = StaffDocument.objects.select_related('staff').order_by('-uploaded_at')
    filterset_fields = ['staff', 'doc_type']
    search_fields = ['staff__first_name', 'staff__last_name', 'file_name']
