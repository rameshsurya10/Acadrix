from rest_framework import serializers
from django.db import transaction

from apps.accounts.models import User
from apps.accounts.utils import generate_id
from apps.accounts.emails import send_welcome_email
from .models import Announcement, AuditLog, SchoolSettings


# ── School Settings ────────────────────────────────────────────────

class SchoolSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = SchoolSettings
        fields = [
            'school_name', 'logo', 'logo_url', 'address', 'phone',
            'email', 'website', 'timezone', 'currency', 'motto',
            'updated_at',
        ]
        read_only_fields = ['updated_at', 'logo_url']

    def get_logo_url(self, obj):
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None


# ── User Management ────────────────────────────────────────────────

class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'role', 'phone', 'is_active', 'date_joined',
        ]
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'role', 'phone', 'is_active', 'date_joined', 'last_login',
        ]
        read_only_fields = fields


class UserToggleActiveSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()


# ── Enrollment ─────────────────────────────────────────────────────

class EnrollAdminSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            role='admin',
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])
        send_welcome_email(user)
        return user


class EnrollFinanceSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            role='finance',
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])
        send_welcome_email(user)
        return user


class EnrollPrincipalSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')
    department = serializers.IntegerField(required=False, allow_null=True, default=None)
    title = serializers.CharField(max_length=60, required=False, default='')
    qualification = serializers.CharField(max_length=200, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        from apps.principal.models import PrincipalProfile
        from apps.shared.models import Department

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            role='principal',
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])

        dept_id = validated_data.get('department')
        department = None
        if dept_id:
            department = Department.objects.filter(pk=dept_id).first()

        employee_id = generate_id('principal')
        PrincipalProfile.objects.create(
            user=user,
            employee_id=employee_id,
            department=department,
            title=validated_data.get('title', ''),
            qualification=validated_data.get('qualification', ''),
        )
        send_welcome_email(user)
        return user


# ── Audit Log ──────────────────────────────────────────────────────

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True, default=None)
    target_name = serializers.CharField(source='target_user.get_full_name', read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'actor', 'actor_name', 'action',
            'target_user', 'target_name', 'detail', 'created_at',
        ]
        read_only_fields = fields


# ── Announcements ──────────────────────────────────────────────────

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True, default=None,
    )

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'body', 'target_role', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']
