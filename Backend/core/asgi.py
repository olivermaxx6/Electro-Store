"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack
from django.urls import re_path

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Initialize Django
django.setup()

# Import consumers after Django is set up
from adminpanel.consumers import ChatConsumer, AdminChatConsumer
from adminpanel.jwt_ws_auth import JWTAuthMiddleware

django_asgi_app = get_asgi_application()

websocket_urlpatterns = [
    re_path(r"^ws/chat/(?P<room_id>[\w-]+)/$", ChatConsumer.as_asgi()),
    re_path(r"^ws/admin/chat/$", AdminChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": SessionMiddlewareStack(
        JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
