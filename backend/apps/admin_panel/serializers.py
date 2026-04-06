from rest_framework import serializers

from .models import AdmissionApplication, AdmissionDocument, AdminNotification, IDConfiguration


# ── AdmissionDocument ──────────────────────────────────────────────

class AdmissionDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionDocument
        fields = [
            'id',
            'application',
            'doc_type',
            'file',
            'file_name',
            'status',
            'verified_at',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at']


# ── AdmissionApplication ──────────────────────────────────────────

class AdmissionApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer used on list endpoints."""
    grade_label = serializers.CharField(
        source='grade_applying.label', read_only=True, default=None,
    )

    class Meta:
        model = AdmissionApplication
        fields = [
            'id',
            'application_id',
            'applicant_name',
            'applicant_email',
            'grade_applying',
            'grade_label',
            'program',
            'status',
            'applied_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'application_id', 'applied_at', 'updated_at']


class AdmissionApplicationDetailSerializer(serializers.ModelSerializer):
    """Full serializer used on retrieve / create / update."""
    documents = AdmissionDocumentSerializer(many=True, read_only=True)
    grade_label = serializers.CharField(
        source='grade_applying.label', read_only=True, default=None,
    )
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.full_name', read_only=True, default=None,
    )

    class Meta:
        model = AdmissionApplication
        fields = [
            'id',
            'application_id',
            'applicant_name',
            'applicant_email',
            'applicant_phone',
            'date_of_birth',
            'grade_applying',
            'grade_label',
            'program',
            'guardian_name',
            'guardian_phone',
            'guardian_email',
            'status',
            'notes',
            'reviewed_by',
            'reviewed_by_name',
            'student_created',
            'applied_at',
            'updated_at',
            'documents',
        ]
        read_only_fields = [
            'id',
            'application_id',
            'applied_at',
            'updated_at',
            'student_created',
        ]


# ── AdminNotification ─────────────────────────────────────────────

class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = [
            'id',
            'recipient',
            'title',
            'body',
            'priority',
            'category',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ── IDConfiguration ──────────────────────────────────────────────

class IDConfigurationSerializer(serializers.ModelSerializer):
    full_prefix = serializers.CharField(read_only=True)

    class Meta:
        model = IDConfiguration
        fields = ['id', 'role', 'prefix', 'year', 'full_prefix', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def validate_prefix(self, value):
        if len(value) != 3 or not value.isalpha():
            raise serializers.ValidationError('Prefix must be exactly 3 letters.')
        return value.upper()

    def validate_year(self, value):
        if len(value) != 4 or not value.isdigit():
            raise serializers.ValidationError('Year must be exactly 4 digits.')
        return value
