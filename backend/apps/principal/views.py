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
    """Upload and list source documents for AI question generation.

    On POST, dispatches an async Celery task that runs the LLM question
    generator (Phase 3.1). The upload request returns immediately with the
    SourceDocument; the frontend polls GET /principal/questions/?source_document=ID
    to see questions as they arrive.
    """

    serializer_class = SourceDocumentSerializer
    permission_classes = [IsAdminOrPrincipal]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'post', 'head', 'options']
    search_fields = ['file_name', 'subject_context']

    def get_queryset(self):
        return SourceDocument.objects.select_related('uploaded_by').all()

    def perform_create(self, serializer):
        doc = serializer.save()
        subject_id = self.request.data.get('subject_id')
        if not subject_id:
            return  # No subject = no question generation (user uploaded for later)

        try:
            num_questions = int(self.request.data.get('num_questions', 10))
        except (TypeError, ValueError):
            num_questions = 10
        num_questions = max(1, min(num_questions, 50))

        from apps.principal.tasks import generate_questions_from_document_task
        generate_questions_from_document_task.delay(
            source_document_id=doc.id,
            subject_id=int(subject_id),
            num_questions=num_questions,
        )


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
    """GET — returns institutional metrics for the principal dashboard.

    Cached for 120s globally (Phase 1.6). Not per-user because the data is
    the same for every principal who views it.
    """

    permission_classes = [IsPrincipal]

    def get(self, request):
        from apps.shared.cache_utils import cache_or_compute

        def _compute():
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

            return {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'questions': question_stats,
                'assessments': assessment_stats,
                'upcoming_events': upcoming_events,
            }

        data = cache_or_compute(
            group='dashboard',
            parts=('principal_stats',),
            timeout=120,
            compute=_compute,
        )
        return Response({'success': True, 'data': data})
