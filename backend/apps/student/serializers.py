from rest_framework import serializers

from apps.shared.models import Grade, Section
from .models import (
    Attendance,
    Document,
    ExtracurricularActivity,
    Guardian,
    HealthRecord,
    Payment,
    PaymentMethod,
    StudentProfile,
    TuitionAccount,
    TuitionLineItem,
)


# ── Nested helpers ──────────────────────────────────────────────────

class _GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'level', 'label']
        read_only_fields = fields


class _SectionSerializer(serializers.ModelSerializer):
    grade = _GradeSerializer(read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'grade', 'capacity']
        read_only_fields = fields


# ── Core serializers ────────────────────────────────────────────────

class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = [
            'id', 'name', 'email', 'phone',
            'relationship', 'is_primary', 'created_at',
        ]
        read_only_fields = fields


class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    section_detail = _SectionSerializer(source='section', read_only=True)
    guardians = GuardianSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'student_id', 'full_name', 'email', 'avatar_url',
            'section', 'section_detail', 'house', 'date_of_birth',
            'address', 'enrollment_date', 'is_active',
            'guardians', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'student_id', 'full_name', 'email', 'avatar_url',
            'section_detail', 'guardians', 'enrollment_date',
            'is_active', 'created_at', 'updated_at',
        ]

    def get_avatar_url(self, obj):
        user = obj.user
        if user.avatar and hasattr(user.avatar, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(user.avatar.url)
            return user.avatar.url
        return None


class HealthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRecord
        fields = [
            'id', 'student', 'height_cm', 'weight_kg',
            'notes', 'check_date', 'created_at',
        ]
        read_only_fields = ['id', 'student', 'created_at']


class ExtracurricularActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtracurricularActivity
        fields = [
            'id', 'student', 'name', 'role',
            'schedule', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'student', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    verified_by_name = serializers.CharField(
        source='verified_by.full_name', read_only=True, default=None,
    )

    class Meta:
        model = Document
        fields = [
            'id', 'student', 'doc_type', 'file', 'file_url',
            'file_name', 'file_size_bytes', 'status',
            'verified_at', 'verified_by_name', 'uploaded_at',
        ]
        read_only_fields = [
            'id', 'student', 'file_url', 'file_size_bytes',
            'status', 'verified_at', 'verified_by_name', 'uploaded_at',
        ]

    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def validate_file(self, value):
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError(
                'File size must not exceed 10 MB.'
            )
        return value

    def create(self, validated_data):
        uploaded_file = validated_data.get('file')
        if uploaded_file:
            validated_data['file_name'] = uploaded_file.name
            validated_data['file_size_bytes'] = uploaded_file.size
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'date', 'is_present',
            'remarks', 'created_at',
        ]
        read_only_fields = fields


# ── Tuition & payments ──────────────────────────────────────────────

class TuitionLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TuitionLineItem
        fields = [
            'id', 'description', 'amount',
            'credit_hours', 'rate_per_hour', 'created_at',
        ]
        read_only_fields = fields


class TuitionAccountSerializer(serializers.ModelSerializer):
    line_items = TuitionLineItemSerializer(many=True, read_only=True)
    outstanding_balance = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = TuitionAccount
        fields = [
            'id', 'student', 'total_amount', 'paid_amount',
            'outstanding_balance', 'status', 'due_date',
            'semester', 'line_items', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    paid_by_name = serializers.CharField(
        source='paid_by.full_name', read_only=True, default=None,
    )

    class Meta:
        model = Payment
        fields = [
            'id', 'account', 'receipt_id', 'amount',
            'method', 'paid_by', 'paid_by_name',
            'paid_at', 'notes',
        ]
        read_only_fields = fields


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'user', 'method_type', 'display_name',
            'last_four', 'expiry', 'is_default', 'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
