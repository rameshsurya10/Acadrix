from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'principal'

router = DefaultRouter()
router.register('documents', views.SourceDocumentViewSet, basename='source-document')
router.register('questions', views.GeneratedQuestionViewSet, basename='generated-question')
router.register('events', views.InstitutionEventViewSet, basename='institution-event')

urlpatterns = [
    path('dashboard/', views.PrincipalDashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
