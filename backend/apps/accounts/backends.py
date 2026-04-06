from django.contrib.auth import get_user_model

User = get_user_model()


class MultiMethodAuthBackend:
    """
    Authenticates by:
    1. Email + password (all roles)
    2. Employee ID + password (teacher, principal)
    3. Student ID + password (student)
    """

    def authenticate(self, request, identifier=None, password=None, **kwargs):
        if not identifier or not password:
            return None

        user = self._resolve_user(identifier)
        if user is None:
            return None

        if not user.is_active:
            return None

        if user.check_password(password):
            return user

        return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
            return user if user.is_active else None
        except User.DoesNotExist:
            return None

    def _resolve_user(self, identifier: str):
        """Resolve identifier (email or ID) to User. Uses select_related -- no N+1."""
        if '@' in identifier:
            return (
                User.objects
                .filter(email=identifier)
                .only('id', 'email', 'password', 'role', 'is_active', 'first_name', 'last_name')
                .first()
            )

        from apps.teacher.models import TeacherProfile
        from apps.student.models import StudentProfile
        from apps.principal.models import PrincipalProfile

        teacher = (
            TeacherProfile.objects
            .select_related('user')
            .filter(employee_id=identifier, is_active=True)
            .only('user__id', 'user__email', 'user__password', 'user__role',
                  'user__is_active', 'user__first_name', 'user__last_name',
                  'employee_id', 'is_active')
            .first()
        )
        if teacher:
            return teacher.user

        student = (
            StudentProfile.objects
            .select_related('user')
            .filter(student_id=identifier, is_active=True)
            .only('user__id', 'user__email', 'user__password', 'user__role',
                  'user__is_active', 'user__first_name', 'user__last_name',
                  'student_id', 'is_active')
            .first()
        )
        if student:
            return student.user

        principal = (
            PrincipalProfile.objects
            .select_related('user')
            .filter(employee_id=identifier, is_active=True)
            .only('user__id', 'user__email', 'user__password', 'user__role',
                  'user__is_active', 'user__first_name', 'user__last_name',
                  'employee_id', 'is_active')
            .first()
        )
        if principal:
            return principal.user

        return None
