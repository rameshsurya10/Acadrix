import csv
import io
import logging

from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.generics import GenericAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response

from apps.accounts.permissions import IsSuperAdminOrAdmin as IsAdmin

from .models import UDISEAnnualData, UDISEExportLog, UDISEProfile
from .serializers import (
    AutoPopulateSerializer,
    UDISEAnnualDataSerializer,
    UDISEExportLogSerializer,
    UDISEProfileSerializer,
)

logger = logging.getLogger(__name__)


# ── U-DISE Profile (single-row GET / PATCH) ──────────────────────────

class UDISEProfileView(RetrieveUpdateAPIView):
    """GET/PATCH the school's U-DISE profile (single row)."""
    permission_classes = [IsAdmin]
    serializer_class = UDISEProfileSerializer

    def get_object(self):
        return UDISEProfile.load()


# ── Annual Data ───────────────────────────────────────────────────────

class UDISEAnnualDataViewSet(viewsets.ModelViewSet):
    """CRUD for annual U-DISE data. Admin-only."""
    permission_classes = [IsAdmin]
    serializer_class = UDISEAnnualDataSerializer
    queryset = UDISEAnnualData.objects.select_related('academic_year').order_by('-academic_year__start_date')
    filterset_fields = ['academic_year', 'status']


# ── Auto-Populate ─────────────────────────────────────────────────────

class AutoPopulateView(GenericAPIView):
    """POST: Auto-populate enrollment and teacher data from existing records."""
    permission_classes = [IsAdmin]
    serializer_class = AutoPopulateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        annual = serializer.save()
        logger.info(
            'U-DISE auto-populate for %s by %s',
            annual.academic_year.label, request.user.full_name,
        )
        return Response(
            {
                'success': True,
                'message': f'Data auto-populated for {annual.academic_year.label}.',
                'data': UDISEAnnualDataSerializer(annual).data,
            },
            status=status.HTTP_200_OK,
        )


# ── Validate Data ─────────────────────────────────────────────────────

class ValidateDataView(GenericAPIView):
    """POST: Validate mandatory fields before export."""
    permission_classes = [IsAdmin]

    def post(self, request):
        academic_year_id = request.data.get('academic_year_id')
        if not academic_year_id:
            return Response(
                {'success': False, 'error': 'academic_year_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            annual = UDISEAnnualData.objects.select_related('academic_year').get(
                academic_year_id=academic_year_id,
            )
        except UDISEAnnualData.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No U-DISE data found for this academic year.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        errors = []

        # Check profile exists
        try:
            profile = UDISEProfile.objects.get(pk=1)
            if profile.udise_code == '00000000000':
                errors.append('U-DISE code has not been configured.')
        except UDISEProfile.DoesNotExist:
            errors.append('U-DISE profile has not been created.')

        # Check enrollment data
        if not annual.enrollment_data:
            errors.append('Enrollment data is empty. Run auto-populate first.')

        # Check teacher data
        if not annual.teacher_data:
            errors.append('Teacher data is empty. Run auto-populate first.')

        # Check infrastructure
        if not annual.infrastructure:
            errors.append('Infrastructure data is empty. Please fill in infrastructure details.')

        if errors:
            return Response(
                {
                    'success': False,
                    'message': 'Validation failed. Please fix the following issues.',
                    'errors': errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark as validated
        annual.status = UDISEAnnualData.Status.VALIDATED
        annual.save(update_fields=['status', 'updated_at'])

        return Response(
            {
                'success': True,
                'message': f'Data for {annual.academic_year.label} validated successfully.',
                'data': UDISEAnnualDataSerializer(annual).data,
            },
            status=status.HTTP_200_OK,
        )


# ── Export CSV ────────────────────────────────────────────────────────

class ExportView(GenericAPIView):
    """POST: Generate a CSV matching U-DISE+ portal format and log the export."""
    permission_classes = [IsAdmin]

    def post(self, request):
        academic_year_id = request.data.get('academic_year_id')
        if not academic_year_id:
            return Response(
                {'success': False, 'error': 'academic_year_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            annual = UDISEAnnualData.objects.select_related('academic_year').get(
                academic_year_id=academic_year_id,
            )
        except UDISEAnnualData.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No U-DISE data found for this academic year.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = UDISEProfile.load()

        # Build CSV in memory
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        # ── Header row (U-DISE+ portal columns) ──────────────────
        header = [
            'UDISE_Code', 'School_Name', 'Block_Code', 'District_Code', 'State_Code',
            'School_Category', 'School_Type', 'Management_Type',
            'Medium', 'Year_Established', 'Affiliation_Board', 'Affiliation_Number',
            'Academic_Year',
        ]

        # Enrollment columns per grade
        enrollment = annual.enrollment_data or {}
        grade_levels = sorted(enrollment.keys(), key=lambda x: int(x) if x.isdigit() else 999)
        for level in grade_levels:
            label = enrollment[level].get('label', f'Grade {level}')
            header.extend([
                f'{label}_Boys', f'{label}_Girls', f'{label}_Total',
                f'{label}_SC', f'{label}_ST', f'{label}_OBC', f'{label}_General',
            ])

        # Teacher summary
        header.extend(['Total_Teachers'])

        # Infrastructure
        infra = annual.infrastructure or {}
        infra_keys = [
            'classrooms', 'labs', 'toilets_boys', 'toilets_girls',
            'computers', 'internet', 'library_books',
        ]
        header.extend([k.replace('_', ' ').title() for k in infra_keys])

        # Additional fields
        header.extend([
            'CWSN_Count', 'RTE_Count', 'Minority_Count',
            'Mid_Day_Meal', 'Has_Boundary_Wall', 'Has_Ramp',
        ])

        writer.writerow(header)

        # ── Data row ─────────────────────────────────────────────
        from apps.super_admin.models import SchoolSettings
        school = SchoolSettings.load()

        row = [
            profile.udise_code,
            school.school_name,
            profile.block_code,
            profile.district_code,
            profile.state_code,
            profile.get_school_category_display(),
            profile.get_school_type_display(),
            profile.get_management_type_display(),
            profile.medium,
            profile.year_established,
            profile.affiliation_board,
            profile.affiliation_number,
            annual.academic_year.label,
        ]

        for level in grade_levels:
            data = enrollment[level]
            row.extend([
                data.get('boys', 0),
                data.get('girls', 0),
                data.get('total', 0),
                data.get('sc', 0),
                data.get('st', 0),
                data.get('obc', 0),
                data.get('general', 0),
            ])

        # Teacher total
        teacher_data = annual.teacher_data or {}
        summary = teacher_data.get('_summary', {})
        row.append(summary.get('total_teachers', 0))

        # Infrastructure
        for key in infra_keys:
            row.append(infra.get(key, 0))

        # Additional
        row.extend([
            annual.cwsn_count,
            annual.rte_count,
            annual.minority_count,
            'Yes' if annual.mid_day_meal else 'No',
            'Yes' if annual.has_boundary_wall else 'No',
            'Yes' if annual.has_ramp else 'No',
        ])

        writer.writerow(row)

        # ── Mark as exported and create log ──────────────────────
        annual.status = UDISEAnnualData.Status.EXPORTED
        annual.save(update_fields=['status', 'updated_at'])

        UDISEExportLog.objects.create(
            academic_year=annual.academic_year,
            exported_by=request.user,
            format=UDISEExportLog.Format.CSV,
            record_count=1,
        )

        logger.info(
            'U-DISE CSV exported for %s by %s',
            annual.academic_year.label, request.user.full_name,
        )

        # Return CSV as downloadable file
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        filename = f'udise_{annual.academic_year.label.replace("-", "_")}.csv'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


# ── Export Log ────────────────────────────────────────────────────────

class ExportLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only list of U-DISE export history."""
    permission_classes = [IsAdmin]
    serializer_class = UDISEExportLogSerializer
    queryset = (
        UDISEExportLog.objects
        .select_related('academic_year', 'exported_by')
        .order_by('-exported_at')
    )
    filterset_fields = ['academic_year', 'format']
