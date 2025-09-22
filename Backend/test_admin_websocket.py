#!/usr/bin/env python3
"""
Test admin WebSocket connection to debug the disconnection issue.
"""

import os
import sys
import django
import requests
import json
import websocket
import threading
import time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_admin_websocket():
    """Test admin WebSocket connection"""
    print("🔌 Testing Admin WebSocket Connection")
    print("=" * 40)
    
    # Get admin token
    try:
        response = requests.post("http://127.0.0.1:8001/api/auth/login/", {
            'username': 'admin',
            'password': 'admin123'
        })
        
        if response.status_code != 200:
            print(f"❌ Admin login failed: {response.status_code}")
            return False
        
        token = response.json()['access']
        print("✅ Admin login successful")
        print(f"📝 Token: {token[:50]}...")
        
    except Exception as e:
        print(f"❌ Error getting admin token: {e}")
        return False
    
    # Test WebSocket connection
    ws_url = f"ws://127.0.0.1:8001/ws/admin/chat/?token={token}"
    print(f"🔗 Connecting to: {ws_url}")
    
    messages_received = []
    connection_status = None
    
    def on_message(ws, message):
        data = json.loads(message)
        messages_received.append(data)
        print(f"📨 Received: {data.get('type', 'unknown')}")
        if data.get('type') == 'room_list':
            rooms = data.get('rooms', [])
            print(f"   📊 Room count: {len(rooms)}")
            for room in rooms[:3]:  # Show first 3 rooms
                print(f"   🏠 Room: {room.get('customer_name', 'Unknown')} ({room.get('id', 'no-id')[:8]}...)")
    
    def on_error(ws, error):
        print(f"❌ WebSocket error: {error}")
        global connection_status
        connection_status = 'error'
    
    def on_close(ws, close_status_code, close_msg):
        print(f"🔌 WebSocket closed: {close_status_code} - {close_msg}")
        global connection_status
        connection_status = 'closed'
    
    def on_open(ws):
        print("✅ Admin WebSocket connected successfully!")
        global connection_status
        connection_status = 'connected'
    
    try:
        ws = websocket.WebSocketApp(
            ws_url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        
        # Run WebSocket in a separate thread
        ws_thread = threading.Thread(target=ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection and messages
        print("⏳ Waiting for connection...")
        time.sleep(3)
        
        # Check connection status
        if connection_status == 'connected':
            print("✅ WebSocket connection successful!")
            
            # Check if we received room list
            room_list_received = any(msg.get('type') == 'room_list' for msg in messages_received)
            if room_list_received:
                print("✅ Room list received successfully!")
                return True
            else:
                print("⚠️  Connected but no room list received")
                return False
        else:
            print(f"❌ WebSocket connection failed: {connection_status}")
            return False
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False
    finally:
        try:
            ws.close()
        except:
            pass

def test_chat_rooms_api():
    """Test chat rooms API endpoint"""
    print("\n🧪 Testing Chat Rooms API")
    print("=" * 40)
    
    try:
        # Get admin token
        response = requests.post("http://127.0.0.1:8001/api/auth/login/", {
            'username': 'admin',
            'password': 'admin123'
        })
        
        if response.status_code != 200:
            print(f"❌ Admin login failed: {response.status_code}")
            return False
        
        token = response.json()['access']
        
        # Get chat rooms
        response = requests.get(
            "http://127.0.0.1:8001/api/admin/chat-rooms/",
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if response.status_code == 200:
            data = response.json()
            rooms = data.get('results', [])
            print(f"✅ API working: {len(rooms)} rooms found")
            
            # Show first few rooms
            for i, room in enumerate(rooms[:3]):
                print(f"   {i+1}. {room.get('customer_name', 'Unknown')} - {room.get('status', 'unknown')}")
            
            return True
        else:
            print(f"❌ API failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Admin WebSocket Debug Test")
    print("=" * 50)
    
    # Test API first
    api_ok = test_chat_rooms_api()
    
    # Test WebSocket
    websocket_ok = test_admin_websocket()
    
    print("\n" + "=" * 50)
    print("🎯 RESULTS")
    print("=" * 50)
    print(f"📡 API Endpoint: {'✅ Working' if api_ok else '❌ Failed'}")
    print(f"🔌 WebSocket: {'✅ Working' if websocket_ok else '❌ Failed'}")
    
    if api_ok and websocket_ok:
        print("\n🎉 Both API and WebSocket are working!")
        print("💡 The issue might be in the frontend WebSocket connection.")
    elif api_ok and not websocket_ok:
        print("\n⚠️  API works but WebSocket fails.")
        print("💡 Check WebSocket server configuration.")
    else:
        print("\n❌ Both API and WebSocket are failing.")
        print("💡 Check server status and authentication.")
    
    return api_ok and websocket_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
