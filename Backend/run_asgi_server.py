#!/usr/bin/env python3
"""
ASGI server runner for Django with WebSocket support
This script runs Django with ASGI support for WebSocket connections
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def main():
    # Setup Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    print("=" * 60)
    print("🚀 DJANGO ASGI SERVER WITH WEBSOCKET SUPPORT")
    print("=" * 60)
    print("📡 Real-time Chat Server for Admin-User Communication")
    print("🌐 HTTP Server: http://127.0.0.1:8001")
    print("🔌 WebSocket Endpoints:")
    print("   • Customer Chat: ws://127.0.0.1:8001/ws/chat/{room_id}/")
    print("   • Admin Chat: ws://127.0.0.1:8001/ws/admin/chat/")
    print("=" * 60)
    
    # Run with uvicorn for ASGI support
    try:
        import uvicorn
        
        print("✅ Starting ASGI server with uvicorn...")
        print("🔄 Auto-reload enabled for development")
        print("📝 Press Ctrl+C to stop the server")
        print("")
        
        uvicorn.run(
            "core.asgi:application",
            host="127.0.0.1",
            port=8001,
            log_level="info",
            access_log=True,
            reload=True,  # Auto-reload on code changes
            reload_dirs=["."],  # Watch current directory for changes
            # Optimize for WebSocket connections
            ws_ping_interval=20,
            ws_ping_timeout=10,
            timeout_keep_alive=30,
        )
        
    except ImportError:
        print("❌ ERROR: uvicorn is not installed!")
        print("📦 Installing uvicorn...")
        os.system('pip install uvicorn')
        print("✅ Please run this script again.")
        return
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped.")
        print("👋 Goodbye!")

if __name__ == '__main__':
    main()
