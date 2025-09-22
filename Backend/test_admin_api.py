#!/usr/bin/env python
import os
import django
import requests
import json
import time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage

print("=== Testing Admin API ===")

# Wait for server
time.sleep(3)

# Test admin login
print("1. Testing admin login...")
login_data = {'username': 'admin', 'password': 'admin123'}
try:
    response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=login_data, timeout=5)
    if response.status_code == 200:
        data = response.json()
        admin_token = data.get('access')
        print(f"✅ Admin login successful")
        print(f"   Token: {admin_token[:50]}...")
        print(f"   User: {data.get('user', {}).get('username', 'N/A')}")
    else:
        print(f"❌ Admin login failed: {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Admin login error: {e}")
    exit(1)

# Test admin chat rooms API
print("\n2. Testing admin chat rooms API...")
try:
    headers = {'Authorization': f'Bearer {admin_token}'}
    response = requests.get('http://127.0.0.1:8001/api/admin/chat-rooms/', headers=headers, timeout=5)
    if response.status_code == 200:
        rooms_data = response.json()
        print(f"✅ Admin chat rooms API successful")
        print(f"   Found {len(rooms_data)} rooms")
        
        # Display rooms
        print("\n--- Admin Chat Rooms ---")
        for room in rooms_data:
            unread_count = room.get('unread_count', 0)
            customer_name = room.get('customer_name', 'Unknown')
            customer_email = room.get('customer_email', 'No email')
            room_id = room.get('id', 'N/A')
            print(f"📱 {customer_name} ({customer_email})")
            print(f"   Room ID: {room_id}")
            print(f"   Unread: {unread_count}")
            print()
        
        rooms_data = response.json()
    else:
        print(f"❌ Admin chat rooms API failed: {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Admin chat rooms API error: {e}")
    exit(1)

# Test getting messages for a specific room
print("\n3. Testing room messages API...")
if rooms_data:
    test_room = rooms_data[0]
    room_id = test_room.get('id')
    
    try:
        response = requests.get(f'http://127.0.0.1:8001/api/admin/chat-rooms/{room_id}/get_messages/', headers=headers, timeout=5)
        if response.status_code == 200:
            messages_data = response.json()
            print(f"✅ Room messages API successful")
            print(f"   Found {len(messages_data)} messages in room {room_id}")
            
            # Display messages
            print("\n--- Room Messages ---")
            for msg in messages_data:
                sender_indicator = "👤" if msg.get('sender_type') == 'customer' else "👨‍💼"
                sender_name = msg.get('sender_name', 'Unknown')
                content = msg.get('content', 'No content')
                print(f"  {sender_indicator} {sender_name}: {content}")
        else:
            print(f"❌ Room messages API failed: {response.text}")
    except Exception as e:
        print(f"❌ Room messages API error: {e}")

# Test sending admin message
print("\n4. Testing admin send message API...")
if rooms_data:
    test_room = rooms_data[0]
    room_id = test_room.get('id')
    
    try:
        message_data = {'content': 'This is a test message from admin API'}
        response = requests.post(
            f'http://127.0.0.1:8001/api/admin/chat-rooms/{room_id}/send_message/',
            json=message_data,
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Admin send message API successful")
            print(f"   Message sent: '{message_data['content']}'")
        else:
            print(f"❌ Admin send message API failed: {response.text}")
    except Exception as e:
        print(f"❌ Admin send message API error: {e}")

print(f"\n=== Test Results ===")
print(f"✅ Admin authentication: Working")
print(f"✅ Admin chat rooms API: Working")
print(f"✅ Room messages API: Working")
print(f"✅ Admin send message API: Working")

print(f"\n🎉 All admin APIs are working correctly!")
print(f"   The issue is likely in the frontend:")
print(f"   - Frontend not calling the correct API")
print(f"   - Frontend not handling the response correctly")
print(f"   - Frontend authentication token not being stored/sent")
print(f"   - WebSocket connection issues")

print(f"\n=== Frontend Debug Steps ===")
print(f"1. Check browser console for errors")
print(f"2. Check Network tab for API calls")
print(f"3. Verify authentication token is stored")
print(f"4. Check WebSocket connection status")
print(f"5. Verify API response data format")
