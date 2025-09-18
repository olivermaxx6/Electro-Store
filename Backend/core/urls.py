from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .admin_config import admin_site
from core.views_health import ws_health

urlpatterns = [
    path("admin/", admin_site.urls),
    path("api/", include("adminpanel.urls")),   # Admin API endpoints
    path("api/", include("accounts.urls")),     # User authentication endpoints
    path("api/public/", include("adminpanel.urls_public")),  # Public API endpoints for storefront
    path("health/ws/", ws_health),  # WebSocket health check endpoint
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
