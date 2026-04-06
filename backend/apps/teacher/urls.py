from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.teacher.enrollment_views import TeacherEnrollStudentView
from apps.teacher.views import (
    AssessmentViewSet,
    AssignmentViewSet,
    GradeEntryViewSet,
    HealthObservationViewSet,
    TeacherDashboardView,
    TeacherProfileViewSet,
)

app_name = 'teacher'

router = DefaultRouter()
router.register(r'profile', TeacherProfileViewSet, basename='profile')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'grades', GradeEntryViewSet, basename='grade-entry')
router.register(
    r'health-observations',
    HealthObservationViewSet,
    basename='health-observation',
)

urlpatterns = [
    path('dashboard/', TeacherDashboardView.as_view(), name='dashboard'),
    path('enroll/student/', TeacherEnrollStudentView.as_view(), name='enroll-student'),
    path('', include(router.urls)),
]
