from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('staff-profiles', views.StaffProfileViewSet, basename='staff-profile')
router.register('salary-structures', views.SalaryStructureViewSet, basename='salary-structure')
router.register('payroll-runs', views.PayrollRunViewSet, basename='payroll-run')
router.register('payslips', views.PayslipViewSet, basename='payslip')
router.register('staff-documents', views.StaffDocumentViewSet, basename='staff-document')

urlpatterns = [
    path('', include(router.urls)),
    path('process-payroll/', views.ProcessPayrollView.as_view(), name='process-payroll'),
    path('finalize-payroll/', views.FinalizePayrollView.as_view(), name='finalize-payroll'),
    path('my-payslips/', views.MyPayslipsView.as_view(), name='my-payslips'),
]
