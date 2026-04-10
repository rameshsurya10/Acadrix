from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'super_admin'

router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='user')
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-log')
router.register(r'announcements', views.AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.SuperAdminDashboardView.as_view(), name='dashboard'),
    path('enroll/admin/', views.EnrollAdminView.as_view(), name='enroll-admin'),
    path('enroll/finance/', views.EnrollFinanceView.as_view(), name='enroll-finance'),
    path('enroll/principal/', views.EnrollPrincipalView.as_view(), name='enroll-principal'),
    path('settings/', views.SchoolSettingsView.as_view(), name='school-settings'),
]
