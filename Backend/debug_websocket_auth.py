#!/usr/bin/env python3
"""
Debug WebSocket authentication issue.
"""

import os
import sys
import django
import requests
import json
import asyncio
import websockets

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

async def test_websocket_auth():
    """Test WebSocket authentication"""
    print("🔌 Testing WebSocket Authentication")
    print("=" * 40)
    
    # Get admin token
    response = requests.post("http://127.0.0.1:8001/api/auth/login/", {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if response.status_code != 200:
        print(f"❌ Admin login failed: {response.status_code}")
        return False
    
    token = response.json()['access']
    print("✅ Admin login successful")
    
    # Test WebSocket connection
    ws_url = f"ws://127.0.0.1:8001/ws/admin/chat/?token={token}"
    print(f"🔗 Connecting to: {ws_url}")
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connected!")
            
            # Wait for messages
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received: {data.get('type', 'unknown')}")
                
                if data.get('type') == 'room_list':
                    rooms = data.get('rooms', [])
                    print(f"📊 Room count: {len(rooms)}")
                    return True
                else:
                    print(f"⚠️  Unexpected message type: {data.get('type')}")
                    return False
                    
            except asyncio.TimeoutError:
                print("⏰ Timeout waiting for message")
                return False
                
    except websockets.exceptions.ConnectionClosed as e:
        print(f"❌ WebSocket connection closed: {e.code} - {e.reason}")
        return False
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 WebSocket Authentication Debug")
    print("=" * 50)
    
    try:
        result = asyncio.run(test_websocket_auth())
        
        if result:
            print("\n✅ WebSocket authentication working!")
        else:
            print("\n❌ WebSocket authentication failed!")
            
        return result
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
