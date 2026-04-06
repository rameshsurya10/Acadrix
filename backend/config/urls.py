from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('django-admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/',      include('apps.accounts.urls')),
    path('api/v1/admin/',     include('apps.admin_panel.urls')),
    path('api/v1/principal/', include('apps.principal.urls')),
    path('api/v1/teacher/',   include('apps.teacher.urls')),
    path('api/v1/student/',   include('apps.student.urls')),
    # parent endpoints merged into apps.student
    path('api/v1/shared/',    include('apps.shared.urls')),

    # OpenAPI docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
