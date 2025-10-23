# Enhanced Chat WebSocket routes
from django.urls import re_path
from . import enhanced_consumers
from . import realtime_consumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>[\w-]+)/$', enhanced_consumers.EnhancedChatConsumer.as_asgi()),
    re_path(r'ws/admin/chat/$', enhanced_consumers.EnhancedAdminChatConsumer.as_asgi()),
    re_path(r'ws/admin/realtime/$', realtime_consumer.AdminRealtimeConsumer.as_asgi()),
]




