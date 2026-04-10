from django.contrib import admin

from apps.academics.models import (
    CertificateTemplate,
    GeneratedReportCard,
    IssuedCertificate,
    ReportCardTemplate,
    ReportCardTerm,
)


class ReportCardTermInline(admin.TabularInline):
    model = ReportCardTerm
    extra = 0
    filter_horizontal = ('assessments',)


@admin.register(ReportCardTemplate)
class ReportCardTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'board_type', 'grade', 'academic_year', 'grading_scale', 'is_active']
    list_filter = ['board_type', 'grading_scale', 'is_active', 'academic_year']
    search_fields = ['name']
    inlines = [ReportCardTermInline]


@admin.register(ReportCardTerm)
class ReportCardTermAdmin(admin.ModelAdmin):
    list_display = ['template', 'term']
    list_filter = ['term']
    filter_horizontal = ('assessments',)


@admin.register(GeneratedReportCard)
class GeneratedReportCardAdmin(admin.ModelAdmin):
    list_display = ['student', 'template', 'term', 'academic_year', 'status', 'generated_at']
    list_filter = ['status', 'academic_year', 'template__board_type']
    search_fields = ['student__user__full_name', 'student__student_id']
    readonly_fields = ['data_snapshot', 'generated_at']


@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'cert_type', 'is_active', 'created_at']
    list_filter = ['cert_type', 'is_active']
    search_fields = ['name']


@admin.register(IssuedCertificate)
class IssuedCertificateAdmin(admin.ModelAdmin):
    list_display = ['serial_number', 'student', 'template', 'issued_date', 'issued_by']
    list_filter = ['template__cert_type', 'issued_date']
    search_fields = ['serial_number', 'student__user__full_name', 'student__student_id']
    readonly_fields = ['rendered_body', 'created_at']
