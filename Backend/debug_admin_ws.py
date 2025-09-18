#!/usr/bin/env python3
"""
Debug the admin WebSocket connection issue.
"""

import os
import django
import asyncio
import websockets
import json
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import ChatRoom

async def debug_admin_websocket():
    print("Debugging Admin WebSocket Connection...")
    print("=" * 50)
    
    # First, get authentication token
    print("1. Getting admin token...")
    auth_response = requests.post("http://127.0.0.1:8001/api/auth/login/", json={
        "username": "admin",
        "password": "admin"
    })
    
    if auth_response.status_code != 200:
        print(f"   ✗ Authentication failed: {auth_response.status_code}")
        return
    
    access_token = auth_response.json()['access']
    print("   ✓ Got admin token")
    
    # Check chat rooms in database
    print("2. Checking chat rooms in database...")
    from asgiref.sync import sync_to_async
    
    @sync_to_async
    def get_rooms():
        return list(ChatRoom.objects.all())
    
    rooms = await get_rooms()
    print(f"   Found {len(rooms)} chat rooms:")
    for room in rooms:
        print(f"     - {room.id}: {room.customer_name} ({room.status})")
        print(f"       Created: {room.created_at}")
        print(f"       Last message: {room.last_message_at}")
    
    # Test the method that might be causing issues
    print("3. Testing get_active_rooms method...")
    try:
        @sync_to_async
        def test_get_active_rooms():
            rooms_data = []
            for room in ChatRoom.objects.all().order_by('-last_message_at'):
                room_data = {
                    'id': str(room.id),
                    'customer_name': room.customer_name,
                    'customer_email': room.customer_email,
                    'status': room.status,
                    'created_at': room.created_at.isoformat(),
                    'last_message_at': room.last_message_at.isoformat(),
                    'unread_count': room.messages.filter(sender_type='customer', is_read=False).count()
                }
                rooms_data.append(room_data)
            return rooms_data
        
        rooms_data = await test_get_active_rooms()
        print(f"   ✓ get_active_rooms method works correctly - {len(rooms_data)} rooms")
        for room_data in rooms_data:
            print(f"     Room: {room_data['customer_name']}, unread: {room_data['unread_count']}")
        
    except Exception as e:
        print(f"   ✗ Error in get_active_rooms: {e}")
        import traceback
        traceback.print_exc()
    
    # Test WebSocket connection with detailed error handling
    print("4. Testing WebSocket connection...")
    try:
        admin_uri = f"ws://127.0.0.1:8001/ws/admin/chat?token={access_token}"
        print(f"   Connecting to: {admin_uri}")
        
        async with websockets.connect(admin_uri) as websocket:
            print("   ✓ WebSocket connection established!")
            
            # Wait for initial message
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                print(f"   ✓ Received: {data}")
            except asyncio.TimeoutError:
                print("   ⚠ No initial message received")
            except Exception as e:
                print(f"   ✗ Error receiving message: {e}")
                
    except Exception as e:
        print(f"   ✗ WebSocket connection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_admin_websocket())
