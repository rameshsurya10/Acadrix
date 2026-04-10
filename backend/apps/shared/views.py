from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.accounts.permissions import IsSuperAdminOrAdmin as IsAdmin

from .models import (
    AcademicYear,
    Conversation,
    Course,
    Department,
    Grade,
    Message,
    ScheduleSlot,
    Section,
    Subject,
)
from .serializers import (
    AcademicYearSerializer,
    ConversationSerializer,
    CourseSerializer,
    DepartmentSerializer,
    GradeSerializer,
    MessageSerializer,
    ScheduleSlotSerializer,
    SectionSerializer,
    SubjectSerializer,
)


class AcademicYearViewSet(ModelViewSet):
    """Read for all; write for admins."""

    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]
    ordering_fields = ['start_date', 'label']

    def get_queryset(self):
        return AcademicYear.objects.all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class DepartmentViewSet(ModelViewSet):
    """Read-only for most users; full CRUD for admins."""

    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code']

    def get_queryset(self):
        return Department.objects.all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class SubjectViewSet(ModelViewSet):
    """Read for all; write for admins."""

    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['department', 'is_active']
    search_fields = ['name', 'code']

    def get_queryset(self):
        return Subject.objects.select_related('department').all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class GradeViewSet(ModelViewSet):
    """Read for all; write for admins."""

    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Grade.objects.all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class SectionViewSet(ModelViewSet):
    """Read for all; write for admins."""

    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['grade', 'academic_year']
    search_fields = ['name']

    def get_queryset(self):
        return Section.objects.select_related('grade', 'academic_year').all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class CourseViewSet(ModelViewSet):
    """Read for all; write for admins."""

    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['section', 'teacher', 'subject', 'academic_year']
    search_fields = ['subject__name', 'location']

    def get_queryset(self):
        return Course.objects.select_related(
            'subject', 'section__grade', 'teacher', 'academic_year',
        ).all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class ScheduleSlotViewSet(ModelViewSet):
    """Read for all; write for admins."""

    serializer_class = ScheduleSlotSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['course', 'day']

    def get_queryset(self):
        return ScheduleSlot.objects.select_related(
            'course__subject', 'course__section__grade',
        ).all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class ConversationViewSet(ModelViewSet):
    """List own conversations and create new ones."""

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']
    filterset_fields = ['category']
    search_fields = ['subject']

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(participants=self.request.user)
            .prefetch_related('participants', 'messages__sender')
            .distinct()
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        # Ensure the creator is always a participant
        if request.user.id not in list(conversation.participants.values_list('id', flat=True)):
            conversation.participants.add(request.user)
        return Response(
            self.get_serializer(conversation).data,
            status=status.HTTP_201_CREATED,
        )


class MessageViewSet(ModelViewSet):
    """List messages in a conversation and create new messages."""

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']
    filterset_fields = ['conversation', 'is_read']
    search_fields = ['body']

    def get_queryset(self):
        qs = Message.objects.select_related('sender').filter(
            conversation__participants=self.request.user,
        )
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs.distinct()

    def create(self, request, *args, **kwargs):
        conversation_id = request.data.get('conversation')
        if conversation_id:
            is_participant = Conversation.objects.filter(
                id=conversation_id, participants=request.user,
            ).exists()
            if not is_participant:
                return Response(
                    {'error': 'You are not a participant in this conversation.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
        return super().create(request, *args, **kwargs)


class FacultyDirectoryView(APIView):
    """GET — list all teachers with profile, department, and performance info."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.teacher.models import TeacherProfile

        queryset = (
            TeacherProfile.objects
            .filter(is_active=True)
            .select_related('user', 'department')
        )

        # Optional search filter
        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(department__name__icontains=search)
                | Q(specialization__icontains=search)
            ).distinct()

        # Optional department filter
        department_id = request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)

        teachers = [
            {
                'id': tp.user_id,
                'employee_id': tp.employee_id,
                'name': tp.user.full_name,
                'email': tp.user.email,
                'avatar_url': request.build_absolute_uri(tp.user.avatar.url) if tp.user.avatar else None,
                'department': tp.department.name if tp.department else None,
                'department_id': tp.department_id,
                'title': tp.title,
                'qualification': tp.qualification,
                'specialization': tp.specialization,
                'employment_status': tp.employment_status,
                'performance_score': float(tp.performance_score) if tp.performance_score else None,
            }
            for tp in queryset
        ]

        return Response({'success': True, 'data': teachers})


class FacultyProfileView(APIView):
    """GET — retrieve a single teacher's full profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        from apps.teacher.models import TeacherProfile

        try:
            tp = (
                TeacherProfile.objects
                .select_related('user', 'department')
                .get(user_id=user_id, is_active=True)
            )
        except TeacherProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Teacher not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        courses = (
            Course.objects
            .filter(teacher_id=user_id)
            .select_related('subject', 'section__grade', 'academic_year')
        )

        course_data = [
            {
                'id': c.id,
                'subject': c.subject.name,
                'section': str(c.section),
                'academic_year': c.academic_year.label if c.academic_year else None,
                'location': c.location,
            }
            for c in courses
        ]

        data = {
            'id': tp.user_id,
            'employee_id': tp.employee_id,
            'name': tp.user.full_name,
            'email': tp.user.email,
            'phone': tp.user.phone,
            'avatar_url': request.build_absolute_uri(tp.user.avatar.url) if tp.user.avatar else None,
            'department': tp.department.name if tp.department else None,
            'department_id': tp.department_id,
            'title': tp.title,
            'qualification': tp.qualification,
            'specialization': tp.specialization,
            'research_focus': tp.research_focus,
            'employment_status': tp.employment_status,
            'date_joined': tp.date_joined,
            'performance_score': float(tp.performance_score) if tp.performance_score else None,
            'courses': course_data,
        }

        return Response({'success': True, 'data': data})


class UserSearchView(APIView):
    """GET /api/v1/shared/users/search/?q=term — search users by name/email for messaging."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.accounts.models import User
        from django.db.models import Q

        q = request.query_params.get('q', '').strip()
        if len(q) < 2:
            return Response({'success': True, 'data': []})

        users = (
            User.objects
            .filter(
                Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(email__icontains=q),
                is_active=True,
            )
            .exclude(pk=request.user.pk)
            .only('id', 'first_name', 'last_name', 'email', 'role')
            .order_by('first_name')[:20]
        )

        data = [
            {'id': u.id, 'name': u.get_full_name(), 'email': u.email, 'role': u.role}
            for u in users
        ]

        return Response({'success': True, 'data': data})
