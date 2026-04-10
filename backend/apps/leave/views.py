import logging
from decimal import Decimal

from django.db.models import Sum, F, Value, CharField
from django.db.models.functions import Concat
from rest_framework import status, viewsets
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrPrincipal, IsSuperAdminOrAdmin
from apps.leave.models import (
    LeaveApplication,
    LeaveBalance,
    LeaveType,
)
from apps.leave.serializers import (
    AllocateBalancesSerializer,
    ApplyLeaveSerializer,
    ApproveLeaveSerializer,
    LeaveApplicationSerializer,
    LeaveBalanceSerializer,
    LeaveTypeSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Leave Types CRUD
# ---------------------------------------------------------------------------

class LeaveTypeViewSet(viewsets.ModelViewSet):
    """CRUD for leave types. Admin for write, any authenticated user for read."""

    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsSuperAdminOrAdmin()]

    def destroy(self, request, *args, **kwargs):
        """Soft-delete by deactivating instead of hard delete."""
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        return Response(
            {'success': True, 'message': 'Leave type deactivated.'},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Leave Balances
# ---------------------------------------------------------------------------

class LeaveBalanceView(ListAPIView):
    """
    GET own balances (any authenticated user).
    Admin/Principal can pass ?user_id= to view another user's balances.
    Optionally filter by ?academic_year_id=.
    """

    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        target_user_id = self.request.query_params.get('user_id')

        # Only admin/principal/super_admin can view other users' balances
        if target_user_id and user.role in ('super_admin', 'admin', 'principal'):
            qs = LeaveBalance.objects.filter(user_id=target_user_id)
        else:
            qs = LeaveBalance.objects.filter(user=user)

        academic_year_id = self.request.query_params.get('academic_year_id')
        if academic_year_id:
            qs = qs.filter(academic_year_id=academic_year_id)
        else:
            # Default to current academic year
            qs = qs.filter(academic_year__is_current=True)

        return qs.select_related('user', 'leave_type', 'academic_year')


# ---------------------------------------------------------------------------
# Apply for Leave
# ---------------------------------------------------------------------------

class ApplyLeaveView(APIView):
    """POST - Submit a new leave application."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ApplyLeaveSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        application = serializer.save()

        logger.info(
            'Leave application created: user=%s type=%s dates=%s-%s',
            request.user.id, application.leave_type.code,
            application.start_date, application.end_date,
        )

        return Response(
            {
                'success': True,
                'data': LeaveApplicationSerializer(application).data,
                'message': 'Leave application submitted successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# My Leaves
# ---------------------------------------------------------------------------

class MyLeavesView(ListAPIView):
    """GET - List own leave applications with optional status filter."""

    serializer_class = LeaveApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = LeaveApplication.objects.filter(
            applicant=self.request.user,
        ).select_related('applicant', 'leave_type')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs.prefetch_related('approval__approver')


# ---------------------------------------------------------------------------
# Pending Approvals (admin/principal)
# ---------------------------------------------------------------------------

class PendingApprovalsView(ListAPIView):
    """GET - List all pending leave applications for approval."""

    serializer_class = LeaveApplicationSerializer
    permission_classes = [IsAdminOrPrincipal]

    def get_queryset(self):
        return (
            LeaveApplication.objects
            .filter(status=LeaveApplication.Status.PENDING)
            .select_related('applicant', 'leave_type')
            .order_by('-applied_at')
        )


# ---------------------------------------------------------------------------
# Approve / Reject Leave
# ---------------------------------------------------------------------------

class ApproveLeaveView(APIView):
    """POST - Approve or reject a pending leave application."""

    permission_classes = [IsAdminOrPrincipal]

    def post(self, request, application_id):
        try:
            application = (
                LeaveApplication.objects
                .select_related('applicant', 'leave_type')
                .get(pk=application_id)
            )
        except LeaveApplication.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Leave application not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ApproveLeaveSerializer(
            data=request.data,
            context={'request': request, 'application': application},
        )
        serializer.is_valid(raise_exception=True)
        approval = serializer.save()

        logger.info(
            'Leave %s: application=%s approver=%s',
            approval.action, application.id, request.user.id,
        )

        return Response(
            {
                'success': True,
                'data': LeaveApplicationSerializer(application).data,
                'message': f'Leave application {approval.action}.',
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Cancel Leave
# ---------------------------------------------------------------------------

class CancelLeaveView(APIView):
    """POST - Cancel own pending leave application."""

    permission_classes = [IsAuthenticated]

    def post(self, request, application_id):
        try:
            application = LeaveApplication.objects.get(
                pk=application_id,
                applicant=request.user,
            )
        except LeaveApplication.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Leave application not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if application.status != LeaveApplication.Status.PENDING:
            return Response(
                {
                    'success': False,
                    'error': f'Cannot cancel a leave application with status "{application.status}".',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = LeaveApplication.Status.CANCELLED
        application.save(update_fields=['status'])

        logger.info(
            'Leave cancelled: application=%s user=%s',
            application.id, request.user.id,
        )

        return Response(
            {'success': True, 'message': 'Leave application cancelled.'},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Bulk Allocate Balances
# ---------------------------------------------------------------------------

class AllocateBalancesView(APIView):
    """POST - Bulk allocate leave balances for an academic year."""

    permission_classes = [IsSuperAdminOrAdmin]

    def post(self, request):
        serializer = AllocateBalancesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        logger.info(
            'Leave balances allocated: created=%s updated=%s by user=%s',
            result['created'], result['updated'], request.user.id,
        )

        return Response(
            {
                'success': True,
                'data': result,
                'message': (
                    f'Balances allocated: {result["created"]} created, '
                    f'{result["updated"]} updated.'
                ),
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Leave Report
# ---------------------------------------------------------------------------

class LeaveReportView(APIView):
    """
    GET - Monthly leave summary report.
    Query params: ?academic_year_id=&month= (optional)
    Returns per-user, per-type: used and remaining.
    """

    permission_classes = [IsSuperAdminOrAdmin]

    def get(self, request):
        from apps.shared.models import AcademicYear

        academic_year_id = request.query_params.get('academic_year_id')
        if academic_year_id:
            academic_year = AcademicYear.objects.filter(pk=academic_year_id).first()
        else:
            academic_year = AcademicYear.objects.filter(is_current=True).first()

        if not academic_year:
            return Response(
                {'success': False, 'error': 'No academic year found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        balances = (
            LeaveBalance.objects
            .filter(academic_year=academic_year)
            .select_related('user', 'leave_type')
            .order_by('user__last_name', 'user__first_name', 'leave_type__name')
        )

        # Optional month filter: count used days from approved applications
        month = request.query_params.get('month')

        # Prefetch monthly usage in a single query to avoid N+1
        month_usage = {}
        if month:
            all_applications = list(
                LeaveApplication.objects.filter(
                    status=LeaveApplication.Status.APPROVED,
                    start_date__month=int(month),
                    start_date__year__gte=academic_year.start_date.year,
                    start_date__year__lte=academic_year.end_date.year,
                ).only(
                    'applicant_id', 'leave_type_id',
                    'start_date', 'end_date', 'is_half_day',
                )
            )
            for app in all_applications:
                key = (app.applicant_id, app.leave_type_id)
                month_usage[key] = month_usage.get(key, 0) + app.days_count

        report = []
        for balance in balances:
            entry = {
                'user_id': balance.user_id,
                'user_name': balance.user.full_name,
                'role': balance.user.role,
                'leave_type': balance.leave_type.name,
                'leave_type_code': balance.leave_type.code,
                'allocated': balance.allocated,
                'carried_forward': str(balance.carried_forward),
                'used': str(balance.used),
                'remaining': str(balance.remaining),
            }

            if month:
                key = (balance.user_id, balance.leave_type_id)
                entry['month_used'] = str(month_usage.get(key, 0))

            report.append(entry)

        return Response(
            {
                'success': True,
                'data': report,
                'meta': {
                    'academic_year': str(academic_year),
                    'total_users': len(set(b.user_id for b in balances)),
                },
            },
            status=status.HTTP_200_OK,
        )
