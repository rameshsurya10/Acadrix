from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.models import User
from apps.accounts.permissions import IsSuperAdmin
from apps.accounts.serializers import UserSerializer
from .models import Announcement, AuditLog, SchoolSettings
from .serializers import (
    AnnouncementSerializer,
    AuditLogSerializer,
    EnrollAdminSerializer,
    EnrollFinanceSerializer,
    EnrollPrincipalSerializer,
    SchoolSettingsSerializer,
    UserDetailSerializer,
    UserListSerializer,
    UserToggleActiveSerializer,
)


# ── Dashboard ──────────────────────────────────────────────────────

class SuperAdminDashboardView(GenericAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from apps.shared.cache_utils import cache_or_compute

        def _compute():
            role_counts = dict(
                User.objects.filter(is_active=True)
                .values_list('role')
                .annotate(c=Count('id'))
                .values_list('role', 'c')
            )
            total_users = sum(role_counts.values())

            recent_admins = list(
                User.objects.filter(role='admin', is_active=True)
                .order_by('-date_joined')[:5]
                .values('id', 'first_name', 'last_name', 'email', 'date_joined')
            )
            recent_principals = list(
                User.objects.filter(role='principal', is_active=True)
                .order_by('-date_joined')[:5]
                .values('id', 'first_name', 'last_name', 'email', 'date_joined')
            )

            recent_logs = list(
                AuditLog.objects.select_related('actor', 'target_user')
                .order_by('-created_at')[:10]
                .values(
                    'id', 'action', 'detail', 'created_at',
                    'actor__first_name', 'actor__last_name',
                    'target_user__first_name', 'target_user__last_name',
                )
            )

            return {
                'total_users': total_users,
                'admins': role_counts.get('admin', 0),
                'principals': role_counts.get('principal', 0),
                'teachers': role_counts.get('teacher', 0),
                'students': role_counts.get('student', 0),
                'recent_admins': recent_admins,
                'recent_principals': recent_principals,
                'recent_activity': recent_logs,
            }

        data = cache_or_compute(
            group='dashboard',
            parts=('super_admin_stats',),
            timeout=120,
            compute=_compute,
        )
        return Response({'success': True, 'data': data})


# ── User Management ────────────────────────────────────────────────

class UserManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """List / retrieve users. Supports filter by role and search."""
    permission_classes = [IsSuperAdmin]
    filterset_fields = ['role', 'is_active']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'last_login', 'email']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserListSerializer

    def get_queryset(self):
        return User.objects.exclude(role='super_admin').order_by('-date_joined')

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        serializer = UserToggleActiveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.is_active = serializer.validated_data['is_active']
        user.save(update_fields=['is_active'])

        action_type = AuditLog.Action.ACTIVATE_USER if user.is_active else AuditLog.Action.DEACTIVATE_USER
        AuditLog.objects.create(
            actor=request.user,
            action=action_type,
            target_user=user,
            detail=f'{"Activated" if user.is_active else "Deactivated"} {user.get_full_name()} ({user.role})',
        )

        return Response({
            'success': True,
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully.',
            'data': UserListSerializer(user).data,
        })

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        user = self.get_object()
        user.set_unusable_password()
        user.save(update_fields=['password'])

        AuditLog.objects.create(
            actor=request.user,
            action=AuditLog.Action.RESET_PASSWORD,
            target_user=user,
            detail=f'Password reset for {user.get_full_name()} ({user.role}). User must set a new password on next login.',
        )

        return Response({
            'success': True,
            'message': 'Password has been reset. User will be prompted to set a new password on next login.',
        })


# ── Enrollment (Admin & Principal) ─────────────────────────────────

class EnrollAdminView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = EnrollAdminSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        AuditLog.objects.create(
            actor=request.user,
            action=AuditLog.Action.CREATE_ADMIN,
            target_user=user,
            detail=f'Enrolled admin: {user.get_full_name()} ({user.email})',
        )

        return Response({
            'success': True,
            'message': f'Admin {user.get_full_name()} enrolled successfully.',
            'data': UserSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


class EnrollFinanceView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = EnrollFinanceSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        AuditLog.objects.create(
            actor=request.user,
            action='create_finance',
            target_user=user,
            detail=f'Enrolled finance staff: {user.get_full_name()} ({user.email})',
        )

        return Response({
            'success': True,
            'message': f'Finance staff {user.get_full_name()} enrolled successfully.',
            'data': UserSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


class EnrollPrincipalView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = EnrollPrincipalSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        AuditLog.objects.create(
            actor=request.user,
            action=AuditLog.Action.CREATE_PRINCIPAL,
            target_user=user,
            detail=f'Enrolled principal: {user.get_full_name()} ({user.email})',
        )

        return Response({
            'success': True,
            'message': f'Principal {user.get_full_name()} enrolled successfully.',
            'data': UserSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


# ── School Settings ────────────────────────────────────────────────

class SchoolSettingsView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = SchoolSettingsSerializer

    def get(self, request):
        settings_obj = SchoolSettings.load()
        serializer = self.get_serializer(settings_obj)
        return Response({'success': True, 'data': serializer.data})

    def patch(self, request):
        settings_obj = SchoolSettings.load()
        serializer = self.get_serializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        AuditLog.objects.create(
            actor=request.user,
            action=AuditLog.Action.UPDATE_SETTINGS,
            detail=f'Updated school settings: {", ".join(request.data.keys())}',
        )

        return Response({'success': True, 'data': serializer.data})


# ── Audit Log ──────────────────────────────────────────────────────

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsSuperAdmin]
    serializer_class = AuditLogSerializer
    filterset_fields = ['action']
    search_fields = ['detail', 'actor__first_name', 'target_user__first_name']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return AuditLog.objects.select_related('actor', 'target_user')


# ── Announcements ──────────────────────────────────────────────────

class AnnouncementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSuperAdmin]
    serializer_class = AnnouncementSerializer
    filterset_fields = ['target_role', 'is_active']
    search_fields = ['title', 'body']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Announcement.objects.select_related('created_by')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
