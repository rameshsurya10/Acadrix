from django.contrib import admin

from apps.leave.models import (
    LeaveApplication,
    LeaveApproval,
    LeaveBalance,
    LeaveType,
)


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'annual_quota', 'applicable_to', 'carries_forward', 'is_active')
    list_filter = ('applicable_to', 'is_active', 'carries_forward')
    search_fields = ('name', 'code')


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'leave_type', 'academic_year', 'allocated', 'used', 'carried_forward')
    list_filter = ('academic_year', 'leave_type')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)


@admin.register(LeaveApplication)
class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'leave_type', 'start_date', 'end_date', 'is_half_day', 'status', 'applied_at')
    list_filter = ('status', 'leave_type', 'is_half_day')
    search_fields = ('applicant__email', 'applicant__first_name', 'applicant__last_name')
    raw_id_fields = ('applicant',)
    date_hierarchy = 'applied_at'


@admin.register(LeaveApproval)
class LeaveApprovalAdmin(admin.ModelAdmin):
    list_display = ('application', 'approver', 'action', 'acted_at')
    list_filter = ('action',)
    raw_id_fields = ('application', 'approver')
