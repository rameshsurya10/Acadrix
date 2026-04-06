from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.accounts.models import User
from apps.accounts.permissions import IsAdminOrPrincipal, IsPrincipal
from apps.student.models import StudentProfile
from apps.teacher.models import Assessment, TeacherProfile

from .models import GeneratedQuestion, InstitutionEvent, SourceDocument
from .serializers import (
    GeneratedQuestionSerializer,
    InstitutionEventSerializer,
    SourceDocumentSerializer,
)


class SourceDocumentViewSet(ModelViewSet):
    """Upload and list source documents for AI question generation."""

    serializer_class = SourceDocumentSerializer
    permission_classes = [IsAdminOrPrincipal]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'post', 'head', 'options']
    search_fields = ['file_name', 'subject_context']

    def get_queryset(self):
        return SourceDocument.objects.select_related('uploaded_by').all()


class GeneratedQuestionViewSet(ModelViewSet):
    """List, approve, reject, and update AI-generated questions."""

    serializer_class = GeneratedQuestionSerializer
    permission_classes = [IsAdminOrPrincipal]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']
    filterset_fields = ['status', 'difficulty', 'subject', 'source_document']
    search_fields = ['reference_id', 'question_text', 'topic']

    def get_queryset(self):
        return (
            GeneratedQuestion.objects
            .select_related('subject', 'source_document', 'approved_by')
            .all()
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        question = self.get_object()
        if question.status == GeneratedQuestion.Status.APPROVED:
            return Response(
                {'error': 'Question is already approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        question.status = GeneratedQuestion.Status.APPROVED
        question.approved_by = request.user
        question.approved_at = timezone.now()
        question.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(question).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        question = self.get_object()
        if question.status == GeneratedQuestion.Status.REJECTED:
            return Response(
                {'error': 'Question is already rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        question.status = GeneratedQuestion.Status.REJECTED
        question.approved_by = None
        question.approved_at = None
        question.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(question).data)


class InstitutionEventViewSet(ModelViewSet):
    """CRUD for school events, assemblies, and activities."""

    serializer_class = InstitutionEventSerializer
    permission_classes = [IsAdminOrPrincipal]
    filterset_fields = ['created_by']
    search_fields = ['title', 'description', 'location']

    def get_queryset(self):
        return InstitutionEvent.objects.select_related('created_by').all()


class PrincipalDashboardView(APIView):
    """GET — returns institutional metrics for the principal dashboard."""

    permission_classes = [IsPrincipal]

    def get(self, request):
        now = timezone.now()
        total_students = StudentProfile.objects.filter(is_active=True).count()
        total_teachers = TeacherProfile.objects.filter(is_active=True).count()

        question_stats = GeneratedQuestion.objects.aggregate(
            total=Count('id'),
            approved=Count('id', filter=Q(status=GeneratedQuestion.Status.APPROVED)),
            pending=Count('id', filter=Q(status=GeneratedQuestion.Status.DRAFT)),
            rejected=Count('id', filter=Q(status=GeneratedQuestion.Status.REJECTED)),
        )

        assessment_stats = Assessment.objects.aggregate(
            total=Count('id'),
            scheduled=Count('id', filter=Q(status=Assessment.Status.SCHEDULED)),
            completed=Count('id', filter=Q(status=Assessment.Status.COMPLETED)),
        )

        upcoming_events = InstitutionEventSerializer(
            InstitutionEvent.objects.filter(event_date__gte=now)[:5],
            many=True,
            context={'request': request},
        ).data

        return Response({
            'success': True,
            'data': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'questions': question_stats,
                'assessments': assessment_stats,
                'upcoming_events': upcoming_events,
            },
        })
