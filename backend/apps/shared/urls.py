from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'shared'

router = DefaultRouter()
router.register('academic-years', views.AcademicYearViewSet, basename='academic-year')
router.register('departments', views.DepartmentViewSet, basename='department')
router.register('subjects', views.SubjectViewSet, basename='subject')
router.register('grades', views.GradeViewSet, basename='grade')
router.register('sections', views.SectionViewSet, basename='section')
router.register('courses', views.CourseViewSet, basename='course')
router.register('schedule-slots', views.ScheduleSlotViewSet, basename='schedule-slot')
router.register('conversations', views.ConversationViewSet, basename='conversation')
router.register('messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('faculty/', views.FacultyDirectoryView.as_view(), name='faculty-directory'),
    path('faculty/<int:user_id>/', views.FacultyProfileView.as_view(), name='faculty-profile'),
    path('users/search/', views.UserSearchView.as_view(), name='user-search'),
    path('', include(router.urls)),
]
