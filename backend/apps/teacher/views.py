from django.db.models import Avg, Count
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTeacher
from apps.teacher.models import (
    Assessment,
    Assignment,
    GradeEntry,
    HealthObservation,
    TeacherProfile,
)
from apps.teacher.serializers import (
    AssessmentDetailSerializer,
    AssessmentListSerializer,
    AssignmentSerializer,
    GradeEntrySerializer,
    HealthObservationSerializer,
    TeacherProfileSerializer,
)


class TeacherProfileViewSet(viewsets.ModelViewSet):
    """Retrieve or update the authenticated teacher's profile."""

    serializer_class = TeacherProfileSerializer
    permission_classes = [IsTeacher]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return TeacherProfile.objects.select_related(
            'user', 'department',
        ).filter(user=self.request.user)

    def get_object(self):
        """Always return the current teacher's profile."""
        return self.get_queryset().get()

    def list(self, request, *args, **kwargs):
        """Return the single profile instead of a list."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Profile updated successfully.',
            },
        )


class AssignmentViewSet(viewsets.ModelViewSet):
    """CRUD operations for teacher assignments."""

    serializer_class = AssignmentSerializer
    permission_classes = [IsTeacher]
    filterset_fields = ['course', 'status']
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Assignment.objects.select_related(
            'course',
        ).filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            paginated.data = {
                'success': True,
                **paginated.data,
            }
            return paginated

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Assignment created successfully.',
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Assignment updated successfully.',
            },
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {'success': True, 'message': 'Assignment deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class AssessmentViewSet(viewsets.ModelViewSet):
    """CRUD operations for teacher assessments."""

    permission_classes = [IsTeacher]
    filterset_fields = ['status', 'subject', 'course']
    search_fields = ['title', 'description']

    def get_queryset(self):
        return Assessment.objects.select_related(
            'course', 'subject',
        ).filter(teacher=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return AssessmentListSerializer
        return AssessmentDetailSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            paginated.data = {
                'success': True,
                **paginated.data,
            }
            return paginated

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Assessment created successfully.',
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Assessment updated successfully.',
            },
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {'success': True, 'message': 'Assessment deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class GradeEntryViewSet(viewsets.ModelViewSet):
    """List, create, and update grade entries for an assessment."""

    serializer_class = GradeEntrySerializer
    permission_classes = [IsTeacher]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']
    filterset_fields = ['assessment', 'student']
    search_fields = ['student__user__first_name', 'student__user__last_name']

    def get_queryset(self):
        return GradeEntry.objects.select_related(
            'student', 'student__user', 'assessment',
        ).filter(assessment__teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(graded_by=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            paginated.data = {
                'success': True,
                **paginated.data,
            }
            return paginated

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Grade entry created successfully.',
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Grade entry updated successfully.',
            },
        )


class HealthObservationViewSet(viewsets.ModelViewSet):
    """List and create health observations."""

    serializer_class = HealthObservationSerializer
    permission_classes = [IsTeacher]
    http_method_names = ['get', 'post', 'head', 'options']
    filterset_fields = ['student']
    search_fields = ['observation']

    def get_queryset(self):
        return HealthObservation.objects.select_related(
            'student', 'student__user', 'teacher',
        ).filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            paginated.data = {
                'success': True,
                **paginated.data,
            }
            return paginated

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {'success': True, 'data': serializer.data},
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'success': True,
                'data': serializer.data,
                'message': 'Health observation recorded successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class TeacherDashboardView(APIView):
    """Aggregated dashboard stats for the authenticated teacher."""

    permission_classes = [IsTeacher]

    def get(self, request):
        user = request.user

        assignment_count = Assignment.objects.filter(teacher=user).count()
        active_assignments = Assignment.objects.filter(
            teacher=user, status=Assignment.Status.ACTIVE,
        ).count()

        assessment_count = Assessment.objects.filter(teacher=user).count()
        assessment_status_breakdown = dict(
            Assessment.objects.filter(teacher=user)
            .values_list('status')
            .annotate(count=Count('id'))
            .order_by('status'),
        )

        total_students_graded = (
            GradeEntry.objects.filter(assessment__teacher=user)
            .values('student')
            .distinct()
            .count()
        )

        avg_score = (
            GradeEntry.objects.filter(assessment__teacher=user).aggregate(
                avg=Avg('marks_obtained'),
            )['avg']
        )

        health_observation_count = HealthObservation.objects.filter(
            teacher=user,
        ).count()

        students_with_observations = (
            HealthObservation.objects.filter(teacher=user)
            .values('student')
            .distinct()
            .count()
        )

        data = {
            'assignments': {
                'total': assignment_count,
                'active': active_assignments,
            },
            'assessments': {
                'total': assessment_count,
                'by_status': assessment_status_breakdown,
            },
            'grading': {
                'total_students_graded': total_students_graded,
                'average_score': (
                    round(float(avg_score), 2) if avg_score else None
                ),
            },
            'health': {
                'total_observations': health_observation_count,
                'students_observed': students_with_observations,
            },
        }

        return Response({'success': True, 'data': data})
