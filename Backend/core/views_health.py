from django.http import JsonResponse
from django.conf import settings
import os

def ws_health(request):
    return JsonResponse({
        "asgi_app": str(getattr(settings, "ASGI_APPLICATION", "")),
        "allowed_hosts": settings.ALLOWED_HOSTS,
        "secure_ssl_redirect": getattr(settings, "SECURE_SSL_REDIRECT", False),
        "channel_layer": getattr(settings, "CHANNEL_LAYERS", {}),
        "env_host": os.environ.get("HOST", ""),
        "env_port": os.environ.get("PORT", ""),
    })
