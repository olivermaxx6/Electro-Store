from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponseRedirect
from .admin_config import admin_site
from core.views_health import ws_health

def redirect_to_frontend(request, path=''):
    """Redirect to frontend React app"""
    frontend_url = f"http://127.0.0.1:5173/{path}"
    return HttpResponseRedirect(frontend_url)

urlpatterns = [
    path("admin/", admin_site.urls),
    path("api/", include("adminpanel.urls")),   # Admin API endpoints
    path("api/", include("accounts.urls")),     # User authentication endpoints
    path("api/public/", include("adminpanel.urls_public")),  # Public API endpoints for storefront
    path("health/ws/", ws_health),  # WebSocket health check endpoint
    
    # Frontend routes that should redirect to React app
    path("order-confirmation/<str:tracking_id>/", lambda request, tracking_id: redirect_to_frontend(request, f"order-confirmation/{tracking_id}")),
    path("checkout/", lambda request: redirect_to_frontend(request, "checkout")),
    path("cart/", lambda request: redirect_to_frontend(request, "cart")),
    path("account/", lambda request: redirect_to_frontend(request, "account")),
    path("services/", lambda request: redirect_to_frontend(request, "services")),
    path("contact/", lambda request: redirect_to_frontend(request, "contact")),
    path("about/", lambda request: redirect_to_frontend(request, "about")),
    path("track-order/", lambda request: redirect_to_frontend(request, "track-order")),
    
    # Catch-all redirect for any other frontend routes
    path("", lambda request: redirect_to_frontend(request, "")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
