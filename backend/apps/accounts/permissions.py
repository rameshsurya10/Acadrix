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


class IsAdmin(IsRole):
    allowed_roles = ['admin']


class IsPrincipal(IsRole):
    allowed_roles = ['principal']


class IsTeacher(IsRole):
    allowed_roles = ['teacher']


class IsStudent(IsRole):
    allowed_roles = ['student']


class IsAdminOrPrincipal(IsRole):
    allowed_roles = ['admin', 'principal']


class IsStaff(IsRole):
    allowed_roles = ['admin', 'principal', 'teacher']
