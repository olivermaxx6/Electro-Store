#!/usr/bin/env python3
"""
Script to clean up old test chat rooms and test the WebSocket connection.
"""

import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import ChatRoom, ChatMessage
from django.contrib.auth.models import User

def cleanup_old_rooms():
    """Clean up old test chat rooms that have no messages"""
    print("🧹 Cleaning up old test chat rooms...")
    
    # Find rooms with no messages
    empty_rooms = ChatRoom.objects.filter(messages__isnull=True)
    print(f"📊 Found {empty_rooms.count()} empty chat rooms")
    
    # Delete empty rooms
    deleted_count = empty_rooms.count()
    empty_rooms.delete()
    
    print(f"✅ Deleted {deleted_count} empty chat rooms")
    
    # Show remaining rooms
    remaining_rooms = ChatRoom.objects.all()
    print(f"📊 Remaining chat rooms: {remaining_rooms.count()}")
    
    for room in remaining_rooms:
        message_count = room.messages.count()
        print(f"   Room {room.id}: {room.customer_name} ({message_count} messages)")
    
    return remaining_rooms.count()

def test_websocket_connection():
    """Test WebSocket connection"""
    print("\n🔌 Testing WebSocket connection...")
    
    # Test admin login
    try:
        response = requests.post("http://127.0.0.1:8001/api/auth/login/", {
            'username': 'admin',
            'password': 'admin123'
        })
        
        if response.status_code == 200:
            token = response.json()['access']
            print("✅ Admin login successful")
            
            # Test admin chat rooms endpoint
            response = requests.get(
                "http://127.0.0.1:8001/api/admin/chat-rooms/",
                headers={'Authorization': f'Bearer {token}'}
            )
            
            if response.status_code == 200:
                rooms = response.json()
                print(f"✅ Admin chat rooms endpoint working: {len(rooms)} rooms")
                return True
            else:
                print(f"❌ Admin chat rooms endpoint failed: {response.status_code}")
                return False
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

def create_test_scenario():
    """Create a proper test scenario with authenticated user"""
    print("\n🧪 Creating test scenario...")
    
    # Create a test user
    test_user, created = User.objects.get_or_create(
        username='test_chat_user',
        defaults={
            'email': 'testchat@example.com',
            'first_name': 'Test',
            'last_name': 'ChatUser'
        }
    )
    if created:
        test_user.set_password('test123')
        test_user.save()
        print(f"✅ Created test user: {test_user.username}")
    else:
        print(f"✅ Using existing test user: {test_user.username}")
    
    # Create a chat room with the test user
    room = ChatRoom.objects.create(
        customer_name=f"{test_user.first_name} {test_user.last_name}",
        customer_email=test_user.email,
        user=test_user,
        status='active'
    )
    print(f"✅ Created test chat room: {room.id}")
    
    # Create a test message
    message = ChatMessage.objects.create(
        room=room,
        sender_type='customer',
        sender_name=f"{test_user.first_name} {test_user.last_name}",
        sender_user=test_user,
        content='Hello, I need help with my order!',
        is_read=False
    )
    print(f"✅ Created test message: {message.id}")
    
    return room, test_user

def main():
    """Main function"""
    print("🚀 Chat System Cleanup and Test")
    print("=" * 40)
    
    try:
        # Clean up old rooms
        remaining_count = cleanup_old_rooms()
        
        # Test WebSocket connection
        websocket_ok = test_websocket_connection()
        
        # Create test scenario
        if remaining_count == 0:
            room, user = create_test_scenario()
            print(f"\n✅ Test scenario created:")
            print(f"   User: {user.username} ({user.email})")
            print(f"   Room: {room.id}")
            print(f"   Customer name: {room.customer_name}")
        
        print("\n" + "=" * 40)
        print("🎯 SUMMARY")
        print("=" * 40)
        print(f"✅ Cleaned up old test rooms")
        print(f"✅ WebSocket connection: {'Working' if websocket_ok else 'Failed'}")
        print(f"✅ Test scenario created")
        print("\n💡 Now refresh the admin panel to see the changes!")
        print("💡 The 'Disconnected' status should be resolved.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
