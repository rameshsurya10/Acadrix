from django.contrib import admin

from .models import UDISEAnnualData, UDISEExportLog, UDISEProfile


@admin.register(UDISEProfile)
class UDISEProfileAdmin(admin.ModelAdmin):
    list_display = ['udise_code', 'school_category', 'school_type', 'management_type', 'medium']

    def has_add_permission(self, request):
        # Single-row model — prevent adding more than one
        return not UDISEProfile.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UDISEAnnualData)
class UDISEAnnualDataAdmin(admin.ModelAdmin):
    list_display = ['academic_year', 'status', 'cwsn_count', 'rte_count', 'updated_at']
    list_filter = ['status']
    raw_id_fields = ['academic_year']


@admin.register(UDISEExportLog)
class UDISEExportLogAdmin(admin.ModelAdmin):
    list_display = ['academic_year', 'exported_by', 'format', 'record_count', 'exported_at']
    list_filter = ['format']
    raw_id_fields = ['academic_year', 'exported_by']
