from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .enrollment_views import EnrollAdminView, EnrollPrincipalView, EnrollStudentView, EnrollTeacherView
from .finance_views import (
    ApplyFeeTemplateView,
    FeeDefaultersView,
    FeeTemplateViewSet,
    PaymentReceiptView,
    RecordPaymentView,
    StudentDiscountViewSet,
)

app_name = 'admin_panel'

router = DefaultRouter()
router.register(r'applications', views.AdmissionApplicationViewSet, basename='application')
router.register(r'notifications', views.AdminNotificationViewSet, basename='notification')
router.register(r'id-config', views.IDConfigurationViewSet, basename='id-config')
router.register(r'fee-templates', FeeTemplateViewSet, basename='fee-template')
router.register(r'discounts', StudentDiscountViewSet, basename='discount')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'applications/<int:application_pk>/documents/',
        views.AdmissionDocumentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='application-documents-list',
    ),
    path(
        'applications/<int:application_pk>/documents/<int:pk>/',
        views.AdmissionDocumentViewSet.as_view({
            'get': 'retrieve',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='application-documents-detail',
    ),
    path('dashboard-stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('enroll/teacher/', EnrollTeacherView.as_view(), name='enroll-teacher'),
    path('enroll/student/', EnrollStudentView.as_view(), name='enroll-student'),
    path('enroll/principal/', EnrollPrincipalView.as_view(), name='enroll-principal'),
    path('enroll/admin/', EnrollAdminView.as_view(), name='enroll-admin'),
    path('assessments/', views.AdminAssessmentListView.as_view(), name='admin-assessments'),
    path('finance-overview/', views.AdminFinanceOverviewView.as_view(), name='finance-overview'),
    path('record-payment/', RecordPaymentView.as_view(), name='record-payment'),
    path('apply-fee-template/', ApplyFeeTemplateView.as_view(), name='apply-fee-template'),
    path('fee-defaulters/', FeeDefaultersView.as_view(), name='fee-defaulters'),
    path('payments/<int:payment_id>/receipt/', PaymentReceiptView.as_view(), name='payment-receipt'),
]
