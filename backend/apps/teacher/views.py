from datetime import date

from django.db import transaction
from django.db.models import Avg, Count, Q
from rest_framework import serializers, status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsTeacher
from apps.shared.models import Course
from apps.student.models import Attendance, StudentProfile
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

        # Assignments: combine total + active into one query (was 2)
        assignment_stats = Assignment.objects.filter(teacher=user).aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(status=Assignment.Status.ACTIVE)),
        )

        # Assessments: combine total + status breakdown into one query (was 2)
        assessment_status_qs = (
            Assessment.objects.filter(teacher=user)
            .values('status')
            .annotate(count=Count('id'))
        )
        assessment_status_breakdown = {
            row['status']: row['count'] for row in assessment_status_qs
        }
        assessment_total = sum(assessment_status_breakdown.values())

        # Grade entries: combine count + avg into one query (was 2)
        grade_stats = GradeEntry.objects.filter(
            assessment__teacher=user,
        ).aggregate(
            total_students=Count('student', distinct=True),
            average_score=Avg('marks_obtained'),
        )

        # Health: combine total + students into one query (was 2)
        health_stats = HealthObservation.objects.filter(
            teacher=user,
        ).aggregate(
            total=Count('id'),
            students_observed=Count('student', distinct=True),
        )

        avg_score = grade_stats['average_score']

        data = {
            'assignments': {
                'total': assignment_stats['total'],
                'active': assignment_stats['active'],
            },
            'assessments': {
                'total': assessment_total,
                'by_status': assessment_status_breakdown,
            },
            'grading': {
                'total_students_graded': grade_stats['total_students'],
                'average_score': (
                    round(float(avg_score), 2) if avg_score else None
                ),
            },
            'health': {
                'total_observations': health_stats['total'],
                'students_observed': health_stats['students_observed'],
            },
        }

        return Response({'success': True, 'data': data})


# ── Attendance serializers (inline, thin) ──────────────────────────

class _AttendanceRecordSerializer(serializers.Serializer):
    """Validates a single attendance record inside the bulk payload."""
    student_id = serializers.IntegerField()
    is_present = serializers.BooleanField()
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class _BulkAttendanceSerializer(serializers.Serializer):
    """Validates the top-level bulk attendance request body."""
    section_id = serializers.IntegerField()
    date = serializers.DateField()
    records = _AttendanceRecordSerializer(many=True, allow_empty=False)


# ── Attendance Views ───────────────────────────────────────────────

class BulkMarkAttendanceView(GenericAPIView):
    """
    POST /api/v1/teacher/attendance/bulk-mark/
    Accepts a section_id, date, and list of attendance records.
    Creates or updates Attendance rows for each student.
    """
    permission_classes = [IsTeacher]
    serializer_class = _BulkAttendanceSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        section_id = data['section_id']
        att_date = data['date']
        records = data['records']

        # Verify teacher teaches a course in this section
        has_course = Course.objects.filter(
            section_id=section_id,
            teacher=request.user,
        ).exists()
        if not has_course:
            return Response(
                {
                    'success': False,
                    'error': 'You do not teach any course in this section.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate all student_ids belong to this section
        student_ids = [r['student_id'] for r in records]
        valid_profiles = StudentProfile.objects.filter(
            id__in=student_ids,
            section_id=section_id,
            is_active=True,
        ).values_list('id', flat=True)
        valid_set = set(valid_profiles)

        invalid_ids = [sid for sid in student_ids if sid not in valid_set]
        if invalid_ids:
            return Response(
                {
                    'success': False,
                    'error': f'Invalid or mismatched student IDs for this section: {invalid_ids}',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for record in records:
                _, created = Attendance.objects.update_or_create(
                    student_id=record['student_id'],
                    date=att_date,
                    defaults={
                        'is_present': record['is_present'],
                        'remarks': record.get('remarks', ''),
                    },
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        return Response(
            {
                'success': True,
                'data': {
                    'created': created_count,
                    'updated': updated_count,
                    'total': created_count + updated_count,
                },
                'message': f'Attendance marked for {created_count + updated_count} students.',
            },
            status=status.HTTP_200_OK,
        )


class TeacherAttendanceView(GenericAPIView):
    """
    GET /api/v1/teacher/attendance/?section_id=&date=
    Returns attendance records for a section on a given date.
    Only accessible if the teacher teaches a course in the section.
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        section_id = request.query_params.get('section_id')
        att_date = request.query_params.get('date')

        if not section_id or not att_date:
            return Response(
                {
                    'success': False,
                    'error': 'Both section_id and date query parameters are required.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            section_id = int(section_id)
        except (TypeError, ValueError):
            return Response(
                {'success': False, 'error': 'section_id must be an integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            att_date = date.fromisoformat(att_date)
        except (TypeError, ValueError):
            return Response(
                {'success': False, 'error': 'date must be in YYYY-MM-DD format.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify teacher teaches a course in this section
        has_course = Course.objects.filter(
            section_id=section_id,
            teacher=request.user,
        ).exists()
        if not has_course:
            return Response(
                {
                    'success': False,
                    'error': 'You do not teach any course in this section.',
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        records = (
            Attendance.objects
            .filter(student__section_id=section_id, date=att_date)
            .select_related('student__user')
            .order_by('student__user__first_name', 'student__user__last_name')
        )

        data = [
            {
                'student_id': r.student_id,
                'student_name': r.student.user.full_name,
                'is_present': r.is_present,
                'remarks': r.remarks,
            }
            for r in records
        ]

        return Response({
            'success': True,
            'data': data,
            'total': len(data),
        })
