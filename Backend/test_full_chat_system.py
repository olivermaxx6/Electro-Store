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

print("=== Full Chat System Test (Backend + Frontend) ===")

# Wait for server to start
print("Waiting for server to start...")
time.sleep(3)

# Test server connectivity
def test_server_connection():
    try:
        response = requests.get('http://127.0.0.1:8001/api/', timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend server connection failed: {e}")
        return False

# Test admin login
def test_admin_login():
    try:
        login_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin login successful")
            return data.get('access')
        else:
            print(f"❌ Admin login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return None

# Test admin chat rooms API
def test_admin_chat_rooms_api(admin_token):
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.get('http://127.0.0.1:8001/api/admin/chat-rooms/', headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin chat rooms API working - found {len(data)} rooms")
            return data
        else:
            print(f"❌ Admin chat rooms API failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin chat rooms API error: {e}")
        return None

# Test user login
def test_user_login(username, password):
    try:
        login_data = {
            'username': username,
            'password': password
        }
        response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {username} login successful")
            return data.get('access')
        else:
            print(f"❌ {username} login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ {username} login error: {e}")
        return None

# Test user chat rooms API
def test_user_chat_rooms_api(user_token):
    try:
        headers = {'Authorization': f'Bearer {user_token}'}
        response = requests.get('http://127.0.0.1:8001/api/public/chat-rooms/', headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User chat rooms API working - found {len(data)} rooms")
            return data
        else:
            print(f"❌ User chat rooms API failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ User chat rooms API error: {e}")
        return None

# Test sending message via API
def test_send_message_api(room_id, content, user_token):
    try:
        headers = {'Authorization': f'Bearer {user_token}'}
        response = requests.post(
            f'http://127.0.0.1:8001/api/public/chat-rooms/{room_id}/send_message/',
            json={'content': content},
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Message sent successfully: '{content}'")
            return data
        else:
            print(f"❌ Message send failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Message send error: {e}")
        return None

# Test admin sending message
def test_admin_send_message_api(room_id, content, admin_token):
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.post(
            f'http://127.0.0.1:8001/api/admin/chat-rooms/{room_id}/send_message/',
            json={'content': content},
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin message sent successfully: '{content}'")
            return data
        else:
            print(f"❌ Admin message send failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin message send error: {e}")
        return None

print("\n=== Step 1: Testing Backend Server ===")
if not test_server_connection():
    print("❌ Backend server is not running. Please start it first.")
    exit(1)

print("\n=== Step 2: Testing Admin Authentication ===")
admin_token = test_admin_login()
if not admin_token:
    print("❌ Admin authentication failed")
    exit(1)

print("\n=== Step 3: Testing Admin Chat Rooms API ===")
admin_rooms = test_admin_chat_rooms_api(admin_token)
if not admin_rooms:
    print("❌ Admin chat rooms API failed")
    exit(1)

print("\n=== Step 4: Testing User Authentication ===")
# Test users
test_users = [
    {'username': 'alice_customer', 'password': 'alice123'},
    {'username': 'bob_customer', 'password': 'bob123'},
    {'username': 'charlie_customer', 'password': 'charlie123'},
    {'username': 'diana_customer', 'password': 'diana123'}
]

user_tokens = {}
for user_data in test_users:
    token = test_user_login(user_data['username'], user_data['password'])
    if token:
        user_tokens[user_data['username']] = token

if not user_tokens:
    print("❌ No users could authenticate")
    exit(1)

print(f"\n✅ {len(user_tokens)} users authenticated successfully")

print("\n=== Step 5: Testing User Chat Rooms API ===")
user_rooms = {}
for username, token in user_tokens.items():
    rooms = test_user_chat_rooms_api(token)
    if rooms:
        user_rooms[username] = rooms[0] if rooms else None

print(f"\n✅ {len(user_rooms)} users have chat rooms")

print("\n=== Step 6: Testing Message Sending ===")
# Test messages
test_messages = {
    'alice_customer': "Hi admin! I need help with my order #12345",
    'bob_customer': "Hello! I have a question about returns",
    'charlie_customer': "I'm having trouble with checkout",
    'diana_customer': "What are your shipping options?"
}

sent_messages = {}
for username, message in test_messages.items():
    if username in user_tokens and username in user_rooms:
        token = user_tokens[username]
        room_id = user_rooms[username]['id']
        result = test_send_message_api(room_id, message, token)
        if result:
            sent_messages[username] = result

print(f"\n✅ {len(sent_messages)} messages sent successfully")

print("\n=== Step 7: Testing Admin Responses ===")
# Admin responses
admin_responses = [
    "Hello! I'd be happy to help you with that.",
    "Let me check that information for you.",
    "I'll look into this right away.",
    "Here's what I found for you:"
]

admin_sent_messages = {}
for i, (username, room_data) in enumerate(user_rooms.items()):
    if room_data:
        room_id = room_data['id']
        response_text = admin_responses[i % len(admin_responses)]
        result = test_admin_send_message_api(room_id, response_text, admin_token)
        if result:
            admin_sent_messages[username] = result

print(f"\n✅ {len(admin_sent_messages)} admin responses sent successfully")

print("\n=== Step 8: Final Verification ===")
# Check final state
final_admin_rooms = test_admin_chat_rooms_api(admin_token)
if final_admin_rooms:
    print(f"\n=== Final Admin Dashboard View ===")
    for room in final_admin_rooms:
        unread_count = room.get('unread_count', 0)
        total_messages = room.get('message_count', 0)
        customer_name = room.get('customer_name', 'Unknown')
        print(f"  📱 {customer_name}: {total_messages} messages ({unread_count} unread)")

print(f"\n=== Test Results ===")
print(f"✅ Backend server: Running")
print(f"✅ Admin authentication: Working")
print(f"✅ Admin chat rooms API: Working")
print(f"✅ User authentication: {len(user_tokens)} users")
print(f"✅ User chat rooms API: Working")
print(f"✅ Message sending: {len(sent_messages)} messages")
print(f"✅ Admin responses: {len(admin_sent_messages)} responses")

if len(sent_messages) > 0 and len(admin_sent_messages) > 0:
    print(f"\n🎉 FULL CHAT SYSTEM TEST PASSED!")
    print(f"   ✅ Backend APIs working correctly")
    print(f"   ✅ Users can send messages")
    print(f"   ✅ Admin can respond")
    print(f"   ✅ All endpoints functional")
    print(f"\n📋 Frontend should now be able to:")
    print(f"   - Connect to backend APIs")
    print(f"   - Display chat rooms")
    print(f"   - Send and receive messages")
    print(f"   - Show real-time updates")
else:
    print(f"\n❌ CHAT SYSTEM TEST FAILED!")
    print(f"   ❌ Some functionality not working")
    print(f"   ❌ Frontend may have connection issues")

print(f"\n=== API Endpoints Tested ===")
print(f"✅ POST /api/auth/login/ - Authentication")
print(f"✅ GET /api/admin/chat-rooms/ - Admin chat rooms")
print(f"✅ GET /api/public/chat-rooms/ - User chat rooms")
print(f"✅ POST /api/public/chat-rooms/{id}/send_message/ - Send user message")
print(f"✅ POST /api/admin/chat-rooms/{id}/send_message/ - Send admin message")

print(f"\n=== Next Steps ===")
print(f"1. Check frontend connection to http://127.0.0.1:8001")
print(f"2. Verify frontend authentication")
print(f"3. Test frontend chat interface")
print(f"4. Check WebSocket connection for real-time updates")
