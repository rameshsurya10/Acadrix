from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('annual-data', views.UDISEAnnualDataViewSet, basename='udise-annual-data')
router.register('export-logs', views.ExportLogViewSet, basename='udise-export-log')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.UDISEProfileView.as_view(), name='udise-profile'),
    path('auto-populate/', views.AutoPopulateView.as_view(), name='udise-auto-populate'),
    path('validate/', views.ValidateDataView.as_view(), name='udise-validate'),
    path('export/', views.ExportView.as_view(), name='udise-export'),
]
