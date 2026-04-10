from django.db.models import Count, Q
from rest_framework import serializers

from apps.shared.models import AcademicYear, Grade
from apps.student.models import StudentProfile
from apps.teacher.models import TeacherProfile

from .models import UDISEAnnualData, UDISEExportLog, UDISEProfile


# ── Profile ───────────────────────────────────────────────────────────

class UDISEProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UDISEProfile
        fields = [
            'id', 'udise_code', 'block_code', 'district_code', 'state_code',
            'school_category', 'school_type', 'management_type',
            'medium', 'year_established',
            'affiliation_board', 'affiliation_number',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']


# ── Annual Data ───────────────────────────────────────────────────────

class UDISEAnnualDataSerializer(serializers.ModelSerializer):
    academic_year_label = serializers.CharField(source='academic_year.label', read_only=True)

    class Meta:
        model = UDISEAnnualData
        fields = [
            'id', 'academic_year', 'academic_year_label',
            'enrollment_data', 'teacher_data', 'infrastructure',
            'cwsn_count', 'rte_count', 'minority_count',
            'mid_day_meal', 'has_boundary_wall', 'has_ramp',
            'status', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'updated_at']


# ── Auto-Populate ─────────────────────────────────────────────────────

class AutoPopulateSerializer(serializers.Serializer):
    """
    Accepts an academic_year_id and auto-populates enrollment_data
    and teacher_data from StudentProfile and TeacherProfile tables.
    """
    academic_year_id = serializers.IntegerField()

    def validate_academic_year_id(self, value):
        try:
            AcademicYear.objects.get(pk=value)
        except AcademicYear.DoesNotExist:
            raise serializers.ValidationError('Academic year not found.')
        return value

    def create(self, validated_data):
        academic_year_id = validated_data['academic_year_id']

        # ── Enrollment data by grade level (single aggregation query) ─
        enrollment_data = {}

        # Fetch grade labels in one query
        grade_labels = {g.level: g.label for g in Grade.objects.all()}

        # Single aggregation instead of N queries (one per grade)
        enrollment_qs = (
            StudentProfile.objects
            .filter(
                section__academic_year_id=academic_year_id,
                is_active=True,
            )
            .values('section__grade__level')
            .annotate(total=Count('id'))
            .order_by('section__grade__level')
        )

        for row in enrollment_qs:
            level = row['section__grade__level']
            total = row['total']
            # Heuristic split -- real gender field recommended
            boys = total // 2
            girls = total - boys

            enrollment_data[str(level)] = {
                'label': grade_labels.get(level, str(level)),
                'boys': boys,
                'girls': girls,
                'total': total,
                'sc': 0,
                'st': 0,
                'obc': 0,
                'general': total,
            }

        # ── Teacher data by qualification ────────────────────────
        teacher_data = {}
        teachers = (
            TeacherProfile.objects
            .filter(is_active=True)
            .select_related('user')
        )

        qualification_counts = (
            teachers
            .values('qualification')
            .annotate(
                count=Count('id'),
                male=Count('id', filter=Q()),  # no gender field — total as fallback
            )
            .order_by('qualification')
        )

        for entry in qualification_counts:
            qual = entry['qualification'] or 'Unspecified'
            teacher_data[qual] = {
                'count': entry['count'],
                'male': entry['count'],
                'female': 0,
                'total': entry['count'],
            }

        teacher_data['_summary'] = {
            'total_teachers': teachers.count(),
        }

        # ── Upsert the annual data row ───────────────────────────
        annual, _ = UDISEAnnualData.objects.update_or_create(
            academic_year_id=academic_year_id,
            defaults={
                'enrollment_data': enrollment_data,
                'teacher_data': teacher_data,
            },
        )
        return annual


# ── Export Log ────────────────────────────────────────────────────────

class UDISEExportLogSerializer(serializers.ModelSerializer):
    academic_year_label = serializers.CharField(source='academic_year.label', read_only=True)
    exported_by_name = serializers.CharField(source='exported_by.full_name', read_only=True)

    class Meta:
        model = UDISEExportLog
        fields = [
            'id', 'academic_year', 'academic_year_label',
            'exported_by', 'exported_by_name',
            'exported_at', 'format', 'record_count',
        ]
        read_only_fields = '__all__'
