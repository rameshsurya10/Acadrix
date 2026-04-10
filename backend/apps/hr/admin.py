from django.contrib import admin

from .models import PayrollRun, PayslipEntry, SalaryStructure, StaffDocument, StaffProfile


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'user', 'designation', 'department', 'employment_type', 'is_active']
    list_filter = ['is_active', 'employment_type', 'department']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'user__email']
    raw_id_fields = ['user', 'department']


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ['user', 'basic', 'effective_from', 'is_active']
    list_filter = ['is_active']
    search_fields = ['user__first_name', 'user__last_name']
    raw_id_fields = ['user']


@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ['month', 'year', 'status', 'total_gross', 'total_net', 'processed_at']
    list_filter = ['status', 'year']
    raw_id_fields = ['academic_year', 'processed_by']


@admin.register(PayslipEntry)
class PayslipEntryAdmin(admin.ModelAdmin):
    list_display = ['staff', 'payroll_run', 'gross_salary', 'total_deductions', 'net_salary', 'status']
    list_filter = ['status', 'payroll_run']
    search_fields = ['staff__first_name', 'staff__last_name']
    raw_id_fields = ['payroll_run', 'staff']


@admin.register(StaffDocument)
class StaffDocumentAdmin(admin.ModelAdmin):
    list_display = ['staff', 'doc_type', 'file_name', 'uploaded_at']
    list_filter = ['doc_type']
    search_fields = ['staff__first_name', 'staff__last_name', 'file_name']
    raw_id_fields = ['staff']
