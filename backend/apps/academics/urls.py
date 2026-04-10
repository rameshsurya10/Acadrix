from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.academics.views import (
    CertificateTemplateViewSet,
    GenerateReportCardsView,
    GeneratedReportCardViewSet,
    IssueCertificateView,
    IssuedCertificateViewSet,
    ReportCardTemplateViewSet,
    ReportCardTermViewSet,
    StudentCertificatesView,
    StudentReportCardsView,
)

router = DefaultRouter()
router.register(r'report-templates', ReportCardTemplateViewSet, basename='report-template')
router.register(r'report-terms', ReportCardTermViewSet, basename='report-term')
router.register(r'report-cards', GeneratedReportCardViewSet, basename='report-card')
router.register(r'certificate-templates', CertificateTemplateViewSet, basename='certificate-template')
router.register(r'certificates', IssuedCertificateViewSet, basename='certificate')

urlpatterns = [
    path('', include(router.urls)),
    # Bulk generation
    path('generate-report-cards/', GenerateReportCardsView.as_view(), name='generate-report-cards'),
    # Issue certificate
    path('issue-certificate/', IssueCertificateView.as_view(), name='issue-certificate'),
    # Student-facing endpoints (own data only)
    path('my/report-cards/', StudentReportCardsView.as_view(), name='my-report-cards'),
    path('my/certificates/', StudentCertificatesView.as_view(), name='my-certificates'),
]
