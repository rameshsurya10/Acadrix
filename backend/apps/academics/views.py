from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsSuperAdminOrAdmin as IsAdmin, IsStaff, IsStudent
from apps.academics.models import (
    CertificateTemplate,
    GeneratedReportCard,
    IssuedCertificate,
    ReportCardTemplate,
    ReportCardTerm,
)
from apps.academics.serializers import (
    CertificateTemplateSerializer,
    GenerateReportCardsSerializer,
    GeneratedReportCardSerializer,
    IssueCertificateSerializer,
    IssuedCertificateSerializer,
    ReportCardTemplateSerializer,
    ReportCardTermSerializer,
)
from apps.shared.services.pdf_generator import (
    PDFGenerationError,
    render_certificate_pdf,
    render_report_card_pdf,
)


# ---------------------------------------------------------------------------
# Report Card Template  (CRUD)
# ---------------------------------------------------------------------------

class ReportCardTemplateViewSet(viewsets.ModelViewSet):
    """Full CRUD for report card templates. Admin only."""
    serializer_class = ReportCardTemplateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['grade', 'academic_year', 'board_type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            ReportCardTemplate.objects
            .select_related('grade', 'academic_year')
            .prefetch_related('terms', 'terms__assessments')
            .all()
        )


# ---------------------------------------------------------------------------
# Report Card Term  (CRUD)
# ---------------------------------------------------------------------------

class ReportCardTermViewSet(viewsets.ModelViewSet):
    """CRUD for report card terms. Admin only. Filter by template."""
    serializer_class = ReportCardTermSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['template', 'term']
    ordering = ['term']

    def get_queryset(self):
        return (
            ReportCardTerm.objects
            .select_related('template')
            .prefetch_related('assessments')
            .all()
        )


# ---------------------------------------------------------------------------
# Bulk Generate Report Cards
# ---------------------------------------------------------------------------

class GenerateReportCardsView(GenericAPIView):
    """POST: Bulk-generate report cards for all students in a section + term."""
    serializer_class = GenerateReportCardsSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cards = serializer.save()
        output = GeneratedReportCardSerializer(cards, many=True).data
        return Response(
            {
                'success': True,
                'message': f'{len(cards)} report card(s) generated successfully.',
                'data': output,
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Generated Report Cards  (read-only for staff)
# ---------------------------------------------------------------------------

class GeneratedReportCardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List / retrieve generated report cards.
    Staff can view all; students see only their own.
    """
    serializer_class = GeneratedReportCardSerializer
    filterset_fields = ['student', 'template', 'term', 'academic_year', 'status']
    search_fields = ['student__user__full_name', 'student__student_id']
    ordering_fields = ['generated_at', 'status']
    ordering = ['-generated_at']

    def get_permissions(self):
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.role == 'student':
                return [IsAuthenticated(), IsStudent()]
            return [IsAuthenticated(), IsStaff()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = (
            GeneratedReportCard.objects
            .select_related(
                'student', 'student__user',
                'template', 'term', 'academic_year',
            )
        )
        if self.request.user.role == 'student':
            qs = qs.filter(student__user=self.request.user)
        return qs

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        """GET /academics/report-cards/{id}/pdf/ — download as PDF."""
        report_card = self.get_object()
        try:
            pdf_bytes = render_report_card_pdf(report_card, request=request)
        except PDFGenerationError as exc:
            return Response(
                {'success': False, 'error': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        filename = f'report-card-{report_card.student.student_id}-{report_card.term.term}.pdf'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = str(len(pdf_bytes))
        return response


# ---------------------------------------------------------------------------
# Student's Own Report Cards
# ---------------------------------------------------------------------------

class StudentReportCardsView(GenericAPIView):
    """GET: Return the authenticated student's own report cards."""
    serializer_class = GeneratedReportCardSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, *args, **kwargs):
        cards = (
            GeneratedReportCard.objects
            .filter(student__user=request.user)
            .select_related('student', 'student__user', 'template', 'term', 'academic_year')
            .order_by('-generated_at')
        )
        serializer = self.get_serializer(cards, many=True)
        return Response({'success': True, 'data': serializer.data})


# ---------------------------------------------------------------------------
# Certificate Template  (CRUD)
# ---------------------------------------------------------------------------

class CertificateTemplateViewSet(viewsets.ModelViewSet):
    """Full CRUD for certificate templates. Admin only."""
    serializer_class = CertificateTemplateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['cert_type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        return CertificateTemplate.objects.all()


# ---------------------------------------------------------------------------
# Issue Certificate
# ---------------------------------------------------------------------------

class IssueCertificateView(GenericAPIView):
    """POST: Issue a certificate to a student."""
    serializer_class = IssueCertificateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        certificate = serializer.save()
        output = IssuedCertificateSerializer(certificate).data
        return Response(
            {
                'success': True,
                'message': f'Certificate {certificate.serial_number} issued successfully.',
                'data': output,
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Issued Certificates  (read-only, staff sees all, student sees own)
# ---------------------------------------------------------------------------

class IssuedCertificateViewSet(viewsets.ReadOnlyModelViewSet):
    """List / retrieve issued certificates."""
    serializer_class = IssuedCertificateSerializer
    filterset_fields = ['student', 'template', 'template__cert_type']
    search_fields = ['serial_number', 'student__user__full_name', 'student__student_id']
    ordering_fields = ['created_at', 'issued_date']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.role == 'student':
                return [IsAuthenticated(), IsStudent()]
            return [IsAuthenticated(), IsStaff()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = (
            IssuedCertificate.objects
            .select_related('student', 'student__user', 'template', 'issued_by')
        )
        if self.request.user.role == 'student':
            qs = qs.filter(student__user=self.request.user)
        return qs

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        """GET /academics/certificates/{id}/pdf/ — download as PDF."""
        certificate = self.get_object()
        try:
            pdf_bytes = render_certificate_pdf(certificate, request=request)
        except PDFGenerationError as exc:
            return Response(
                {'success': False, 'error': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        filename = f'{certificate.template.cert_type}-{certificate.serial_number}.pdf'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = str(len(pdf_bytes))
        return response


# ---------------------------------------------------------------------------
# Student's Own Certificates
# ---------------------------------------------------------------------------

class StudentCertificatesView(GenericAPIView):
    """GET: Return the authenticated student's own certificates."""
    serializer_class = IssuedCertificateSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, *args, **kwargs):
        certs = (
            IssuedCertificate.objects
            .filter(student__user=request.user)
            .select_related('student', 'student__user', 'template', 'issued_by')
            .order_by('-created_at')
        )
        serializer = self.get_serializer(certs, many=True)
        return Response({'success': True, 'data': serializer.data})
