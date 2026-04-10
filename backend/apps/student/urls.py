from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'student'

router = DefaultRouter()
router.register('profiles', views.StudentProfileViewSet, basename='profile')
router.register('documents', views.DocumentViewSet, basename='document')
router.register('attendance', views.AttendanceViewSet, basename='attendance')
router.register('health-records', views.HealthRecordViewSet, basename='health-record')
router.register('activities', views.ExtracurricularActivityViewSet, basename='activity')
router.register('payments', views.PaymentHistoryViewSet, basename='payment')
router.register('payment-methods', views.PaymentMethodViewSet, basename='payment-method')

urlpatterns = [
    path('dashboard/', views.StudentDashboardView.as_view(), name='dashboard'),
    path('tuition/', views.TuitionAccountView.as_view(), name='tuition'),
    path('grades/', views.StudentGradesView.as_view(), name='student-grades'),
    path('parent-dashboard/', views.ParentDashboardView.as_view(), name='parent-dashboard'),
    path('', include(router.urls)),
]
