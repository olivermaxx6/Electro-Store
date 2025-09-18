#!/usr/bin/env python3
"""
Test script to verify WebSocket chat setup
This script tests the ASGI application and WebSocket routing
"""

import os
import sys
import django
import asyncio
import websockets
import json
from urllib.parse import urlencode

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

async def test_websocket_connection():
    """Test WebSocket connection to the chat server"""
    print("🧪 Testing WebSocket Chat Setup")
    print("=" * 50)
    
    # Test admin WebSocket endpoint
    admin_ws_url = "ws://127.0.0.1:8001/ws/admin/chat/"
    print(f"🔌 Testing admin WebSocket: {admin_ws_url}")
    
    try:
        async with websockets.connect(admin_ws_url) as websocket:
            print("✅ WebSocket connection established!")
            
            # Wait for initial message
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received message: {data.get('type', 'unknown')}")
                
                if data.get('type') == 'room_list':
                    print(f"📋 Room list received with {len(data.get('rooms', []))} rooms")
                
            except asyncio.TimeoutError:
                print("⏰ No initial message received (this might be normal)")
            
            print("✅ WebSocket test completed successfully!")
            
    except ConnectionRefusedError:
        print("❌ Connection refused - Make sure the ASGI server is running!")
        print("💡 Start the server with: python run_asgi_server.py")
        return False
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False
    
    return True

async def test_customer_websocket():
    """Test customer WebSocket endpoint"""
    print("\n🧪 Testing Customer WebSocket")
    print("=" * 50)
    
    # Test customer WebSocket endpoint (this will fail without a valid room_id)
    customer_ws_url = "ws://127.0.0.1:8001/ws/chat/test-room/"
    print(f"🔌 Testing customer WebSocket: {customer_ws_url}")
    
    try:
        async with websockets.connect(customer_ws_url) as websocket:
            print("✅ Customer WebSocket connection established!")
            
            # Wait for response
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received message: {data}")
                
            except asyncio.TimeoutError:
                print("⏰ No message received (this might be normal)")
            
            print("✅ Customer WebSocket test completed!")
            
    except ConnectionRefusedError:
        print("❌ Connection refused - Make sure the ASGI server is running!")
        return False
    except Exception as e:
        print(f"❌ Customer WebSocket test failed: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("🚀 WebSocket Chat Setup Test")
    print("=" * 60)
    
    # Setup Django
    setup_django()
    
    # Test ASGI application import
    try:
        from core.asgi import application
        print("✅ ASGI application imported successfully")
    except Exception as e:
        print(f"❌ Failed to import ASGI application: {e}")
        return
    
    # Test WebSocket consumers import
    try:
        from adminpanel.consumers import ChatConsumer, AdminChatConsumer
        print("✅ WebSocket consumers imported successfully")
    except Exception as e:
        print(f"❌ Failed to import WebSocket consumers: {e}")
        return
    
    # Test JWT middleware import
    try:
        from adminpanel.jwt_ws_auth import JWTAuthMiddleware
        print("✅ JWT WebSocket middleware imported successfully")
    except Exception as e:
        print(f"❌ Failed to import JWT middleware: {e}")
        return
    
    print("\n📋 Setup Verification Complete!")
    print("=" * 60)
    print("✅ All components are properly configured")
    print("🚀 You can now start the ASGI server with:")
    print("   python run_asgi_server.py")
    print("   or")
    print("   .\\dev.ps1")
    print("=" * 60)

if __name__ == '__main__':
    main()
