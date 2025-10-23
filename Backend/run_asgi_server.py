#!/usr/bin/env python
"""
ASGI server runner for WebSocket support
"""
import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Initialize Django
django.setup()

# Import the ASGI application
from core.asgi import application

if __name__ == "__main__":
    import uvicorn
    
    print("Starting ASGI server with WebSocket support...")
    print("Server will be available at: http://127.0.0.1:8001")
    print("WebSocket endpoints:")
    print("  - ws://127.0.0.1:8001/ws/chat/{room_id}/")
    print("  - ws://127.0.0.1:8001/ws/admin/chat/")
    print("  - ws://127.0.0.1:8001/ws/admin/realtime/")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(
        application,
        host="127.0.0.1",
        port=8001,
        log_level="info",
        access_log=True
    )
