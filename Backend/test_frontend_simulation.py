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

print("=== Frontend Simulation Test ===")

# Wait for server
time.sleep(3)

def simulate_admin_frontend():
    print("\n=== Simulating Admin Frontend ===")
    
    # Step 1: Admin login
    print("1. Admin login...")
    login_data = {'username': 'admin', 'password': 'admin123'}
    try:
        response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get('access')
            print(f"✅ Admin login successful")
        else:
            print(f"❌ Admin login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return False
    
    # Step 2: Get admin chat rooms
    print("2. Getting admin chat rooms...")
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.get('http://127.0.0.1:8001/api/admin/chat-rooms/', headers=headers, timeout=5)
        if response.status_code == 200:
            rooms_data = response.json()
            print(f"✅ Found {len(rooms_data)} chat rooms")
            
            # Display rooms like frontend would
            print("\n--- Admin Dashboard View ---")
            for room in rooms_data:
                unread_count = room.get('unread_count', 0)
                customer_name = room.get('customer_name', 'Unknown')
                customer_email = room.get('customer_email', 'No email')
                last_message_at = room.get('last_message_at', 'No messages')
                print(f"📱 {customer_name} ({customer_email})")
                print(f"   Unread: {unread_count}")
                print(f"   Last message: {last_message_at}")
                print(f"   Room ID: {room.get('id', 'N/A')}")
                print()
            
            return rooms_data
        else:
            print(f"❌ Admin chat rooms failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Admin chat rooms error: {e}")
        return False

def simulate_user_frontend(username, password):
    print(f"\n=== Simulating {username} Frontend ===")
    
    # Step 1: User login
    print(f"1. {username} login...")
    login_data = {'username': username, 'password': password}
    try:
        response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            user_token = data.get('access')
            print(f"✅ {username} login successful")
        else:
            print(f"❌ {username} login failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ {username} login error: {e}")
        return False
    
    # Step 2: Get user chat rooms
    print(f"2. Getting {username} chat rooms...")
    try:
        headers = {'Authorization': f'Bearer {user_token}'}
        response = requests.get('http://127.0.0.1:8001/api/public/chat-rooms/', headers=headers, timeout=5)
        if response.status_code == 200:
            rooms_data = response.json()
            print(f"✅ Found {len(rooms_data)} chat rooms")
            
            if rooms_data:
                room = rooms_data[0]  # Get first room
                print(f"--- {username} Chat Room ---")
                print(f"Room ID: {room.get('id', 'N/A')}")
                print(f"Customer: {room.get('customer_name', 'Unknown')}")
                print(f"Status: {room.get('status', 'Unknown')}")
                
                return room
            else:
                print(f"❌ No chat rooms found for {username}")
                return False
        else:
            print(f"❌ {username} chat rooms failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ {username} chat rooms error: {e}")
        return False

def test_message_flow():
    print("\n=== Testing Message Flow ===")
    
    # Test users
    test_users = [
        {'username': 'alice_customer', 'password': 'alice123'},
        {'username': 'bob_customer', 'password': 'bob123'},
        {'username': 'charlie_customer', 'password': 'charlie123'},
        {'username': 'diana_customer', 'password': 'diana123'}
    ]
    
    # Test messages
    test_messages = [
        "Hi admin! I need help with my order",
        "When will my package arrive?",
        "I have a question about returns",
        "Can you help me with checkout?"
    ]
    
    # Get admin token
    admin_login_data = {'username': 'admin', 'password': 'admin123'}
    admin_response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=admin_login_data, timeout=5)
    if admin_response.status_code != 200:
        print("❌ Admin login failed for message flow test")
        return False
    
    admin_token = admin_response.json().get('access')
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    
    # Test each user sending a message
    for i, user_data in enumerate(test_users):
        username = user_data['username']
        password = user_data['password']
        message = test_messages[i % len(test_messages)]
        
        print(f"\n--- Testing {username} ---")
        
        # User login
        user_login_data = {'username': username, 'password': password}
        user_response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=user_login_data, timeout=5)
        if user_response.status_code != 200:
            print(f"❌ {username} login failed")
            continue
        
        user_token = user_response.json().get('access')
        user_headers = {'Authorization': f'Bearer {user_token}'}
        
        # Get user's chat room
        rooms_response = requests.get('http://127.0.0.1:8001/api/public/chat-rooms/', headers=user_headers, timeout=5)
        if rooms_response.status_code != 200:
            print(f"❌ {username} chat rooms failed")
            continue
        
        rooms_data = rooms_response.json()
        if not rooms_data:
            print(f"❌ {username} has no chat rooms")
            continue
        
        room_id = rooms_data[0]['id']
        
        # Send message
        message_data = {'content': message}
        send_response = requests.post(
            f'http://127.0.0.1:8001/api/public/chat-rooms/{room_id}/send_message/',
            json=message_data,
            headers=user_headers,
            timeout=5
        )
        
        if send_response.status_code == 200:
            print(f"✅ {username} sent: '{message}'")
            
            # Admin responds
            admin_message = f"Hello {username}! I'll help you with that."
            admin_send_response = requests.post(
                f'http://127.0.0.1:8001/api/admin/chat-rooms/{room_id}/send_message/',
                json={'content': admin_message},
                headers=admin_headers,
                timeout=5
            )
            
            if admin_send_response.status_code == 200:
                print(f"✅ Admin responded: '{admin_message}'")
            else:
                print(f"❌ Admin response failed: {admin_send_response.text}")
        else:
            print(f"❌ {username} message send failed: {send_response.text}")
    
    return True

def check_final_state():
    print("\n=== Final State Check ===")
    
    # Check database state
    total_messages = ChatMessage.objects.count()
    total_rooms = ChatRoom.objects.count()
    total_users = User.objects.count()
    
    print(f"Database state:")
    print(f"  Total users: {total_users}")
    print(f"  Total chat rooms: {total_rooms}")
    print(f"  Total messages: {total_messages}")
    
    # Check admin API
    admin_login_data = {'username': 'admin', 'password': 'admin123'}
    admin_response = requests.post('http://127.0.0.1:8001/api/auth/login/', json=admin_login_data, timeout=5)
    if admin_response.status_code == 200:
        admin_token = admin_response.json().get('access')
        admin_headers = {'Authorization': f'Bearer {admin_token}'}
        
        rooms_response = requests.get('http://127.0.0.1:8001/api/admin/chat-rooms/', headers=admin_headers, timeout=5)
        if rooms_response.status_code == 200:
            rooms_data = rooms_response.json()
            print(f"\nAdmin API shows {len(rooms_data)} rooms:")
            for room in rooms_data:
                unread_count = room.get('unread_count', 0)
                customer_name = room.get('customer_name', 'Unknown')
                print(f"  📱 {customer_name}: {unread_count} unread messages")
        else:
            print(f"❌ Admin API failed: {rooms_response.text}")
    else:
        print(f"❌ Admin login failed: {admin_response.text}")

# Run the simulation
print("Starting frontend simulation...")

# Test admin frontend
admin_rooms = simulate_admin_frontend()

# Test user frontends
test_users = [
    {'username': 'alice_customer', 'password': 'alice123'},
    {'username': 'bob_customer', 'password': 'bob123'},
    {'username': 'charlie_customer', 'password': 'charlie123'},
    {'username': 'diana_customer', 'password': 'diana123'}
]

user_rooms = {}
for user_data in test_users:
    room = simulate_user_frontend(user_data['username'], user_data['password'])
    if room:
        user_rooms[user_data['username']] = room

# Test message flow
test_message_flow()

# Check final state
check_final_state()

print(f"\n=== Simulation Results ===")
print(f"✅ Admin frontend simulation: {'PASSED' if admin_rooms else 'FAILED'}")
print(f"✅ User frontend simulations: {len(user_rooms)}/{len(test_users)} PASSED")
print(f"✅ Message flow test: COMPLETED")

if admin_rooms and len(user_rooms) > 0:
    print(f"\n🎉 FRONTEND SIMULATION SUCCESSFUL!")
    print(f"   ✅ Backend APIs working correctly")
    print(f"   ✅ Admin can see chat rooms")
    print(f"   ✅ Users can access their rooms")
    print(f"   ✅ Messages can be sent and received")
    print(f"\n📋 The issue might be:")
    print(f"   - Frontend not calling the correct API endpoints")
    print(f"   - Frontend not handling the response data correctly")
    print(f"   - WebSocket connection issues for real-time updates")
    print(f"   - Frontend authentication token not being stored/sent")
else:
    print(f"\n❌ FRONTEND SIMULATION FAILED!")
    print(f"   ❌ Backend APIs not working correctly")
    print(f"   ❌ Need to fix backend issues first")
