from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.leave.views import (
    AllocateBalancesView,
    ApplyLeaveView,
    ApproveLeaveView,
    CancelLeaveView,
    LeaveBalanceView,
    LeaveReportView,
    LeaveTypeViewSet,
    MyLeavesView,
    PendingApprovalsView,
)

app_name = 'leave'

router = DefaultRouter()
router.register(r'types', LeaveTypeViewSet, basename='leave-type')

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),

    # Balance
    path('balances/', LeaveBalanceView.as_view(), name='leave-balances'),

    # Application flow
    path('apply/', ApplyLeaveView.as_view(), name='apply-leave'),
    path('my-leaves/', MyLeavesView.as_view(), name='my-leaves'),

    # Approval flow
    path('pending/', PendingApprovalsView.as_view(), name='pending-approvals'),
    path('<int:application_id>/approve/', ApproveLeaveView.as_view(), name='approve-leave'),
    path('<int:application_id>/cancel/', CancelLeaveView.as_view(), name='cancel-leave'),

    # Admin operations
    path('allocate/', AllocateBalancesView.as_view(), name='allocate-balances'),
    path('report/', LeaveReportView.as_view(), name='leave-report'),
]
