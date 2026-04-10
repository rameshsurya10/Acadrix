from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    """Base permission — subclass and set `allowed_roles`."""
    allowed_roles: list[str] = []

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsSuperAdmin(IsRole):
    allowed_roles = ['super_admin']


class IsAdmin(IsRole):
    allowed_roles = ['admin']


class IsFinance(IsRole):
    allowed_roles = ['finance']


class IsPrincipal(IsRole):
    allowed_roles = ['principal']


class IsTeacher(IsRole):
    allowed_roles = ['teacher']


class IsStudent(IsRole):
    allowed_roles = ['student']


class IsSuperAdminOrAdmin(IsRole):
    allowed_roles = ['super_admin', 'admin']


class IsFinanceOrAdmin(IsRole):
    """Finance staff + super admin for billing. Admin gets read-only via separate view."""
    allowed_roles = ['super_admin', 'finance']


class IsFinanceViewer(IsRole):
    """Anyone who can VIEW finance data (read-only for admin/principal, full for finance/super_admin)."""
    allowed_roles = ['super_admin', 'admin', 'finance', 'principal']


class IsAdminOrPrincipal(IsRole):
    allowed_roles = ['super_admin', 'admin', 'principal']


class IsStaff(IsRole):
    allowed_roles = ['super_admin', 'admin', 'finance', 'principal', 'teacher']
