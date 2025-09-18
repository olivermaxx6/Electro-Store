#!/usr/bin/env python3
"""
Dedicated Chat Server for Real-time WebSocket Communication
This script runs a specialized ASGI server optimized for chat functionality.
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
    print("🚀 DEDICATED CHAT SERVER STARTING")
    print("=" * 60)
    print("📡 WebSocket Chat Server for Admin-User Communication")
    print("🌐 Server URL: http://127.0.0.1:8001")
    print("🔌 WebSocket Endpoints:")
    print("   • Customer Chat: ws://127.0.0.1:8001/ws/chat/{room_id}/")
    print("   • Admin Chat: ws://127.0.0.1:8001/ws/admin/chat/")
    print("=" * 60)
    
    try:
        import uvicorn
        
        # Run with optimized settings for chat
        uvicorn.run(
            "core.asgi:application",
            host="127.0.0.1",
            port=8001,
            log_level="info",
            access_log=True,
            reload=True,
            reload_dirs=["."],
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
        print("\n🛑 Chat server stopped.")
        print("👋 Goodbye!")

if __name__ == '__main__':
    main()
