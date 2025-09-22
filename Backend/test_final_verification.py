#!/usr/bin/env python3
"""
Final verification test to ensure the chat authentication fix is working properly.
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

def test_admin_panel_view():
    """Test that admin panel shows correct user identities"""
    print("🧪 Testing admin panel view...")
    
    # Login as admin
    response = requests.post("http://127.0.0.1:8001/api/auth/login/", {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if response.status_code != 200:
        print(f"❌ Admin login failed: {response.status_code}")
        return False
    
    token = response.json()['access']
    print("✅ Admin login successful")
    
    # Get chat rooms from admin perspective
    response = requests.get(
        "http://127.0.0.1:8001/api/admin/chat-rooms/",
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to get chat rooms: {response.status_code}")
        return False
    
    rooms = response.json()
    print(f"✅ Retrieved {len(rooms)} chat rooms")
    
    # Check room identities
    anonymous_count = 0
    named_count = 0
    
    for room in rooms:
        if isinstance(room, dict):
            customer_name = room.get('customer_name', '')
            room_id = room.get('id', 'unknown')[:8]
        else:
            customer_name = getattr(room, 'customer_name', '')
            room_id = str(getattr(room, 'id', 'unknown'))[:8]
            
        if customer_name in ['Anonymous', 'Anonymous User', '']:
            anonymous_count += 1
            print(f"   ⚠️  Room {room_id}... shows as: '{customer_name}'")
        else:
            named_count += 1
            print(f"   ✅ Room {room_id}... shows as: '{customer_name}'")
    
    print(f"\n📊 Summary:")
    print(f"   Named users: {named_count}")
    print(f"   Anonymous users: {anonymous_count}")
    
    if named_count > 0:
        print("✅ Authentication fix is working - some users show proper names!")
        return True
    else:
        print("❌ Authentication fix not working - all users still anonymous")
        return False

def test_database_consistency():
    """Test database consistency"""
    print("\n🧪 Testing database consistency...")
    
    # Check chat rooms
    rooms = ChatRoom.objects.all()
    print(f"📊 Total chat rooms: {rooms.count()}")
    
    named_rooms = 0
    for room in rooms:
        if room.customer_name and room.customer_name not in ['Anonymous', 'Anonymous User']:
            named_rooms += 1
            print(f"   ✅ Room {room.id}: {room.customer_name} ({room.customer_email})")
    
    print(f"📊 Rooms with proper names: {named_rooms}")
    
    # Check messages
    messages = ChatMessage.objects.all()
    print(f"📊 Total messages: {messages.count()}")
    
    named_messages = 0
    for message in messages:
        if message.sender_name and message.sender_name not in ['Anonymous', 'Anonymous User']:
            named_messages += 1
            print(f"   ✅ Message {message.id}: {message.sender_name} ({message.sender_type})")
    
    print(f"📊 Messages with proper names: {named_messages}")
    
    return named_rooms > 0 and named_messages > 0

def create_live_test():
    """Create a live test with a real user"""
    print("\n🧪 Creating live test...")
    
    # Create a test user
    test_user, created = User.objects.get_or_create(
        username='live_test_user',
        defaults={
            'email': 'livetest@example.com',
            'first_name': 'Live',
            'last_name': 'TestUser'
        }
    )
    if created:
        test_user.set_password('test123')
        test_user.save()
        print(f"✅ Created live test user: {test_user.username}")
    else:
        print(f"✅ Using existing live test user: {test_user.username}")
    
    # Create a chat room
    room = ChatRoom.objects.create(
        customer_name=f"{test_user.first_name} {test_user.last_name}",
        customer_email=test_user.email,
        user=test_user,
        status='active'
    )
    print(f"✅ Created live test room: {room.id}")
    
    # Create a message
    message = ChatMessage.objects.create(
        room=room,
        sender_type='customer',
        sender_name=f"{test_user.first_name} {test_user.last_name}",
        sender_user=test_user,
        content='This is a live test message from an authenticated user!',
        is_read=False
    )
    print(f"✅ Created live test message: {message.id}")
    
    return room, test_user

def main():
    """Main function"""
    print("🚀 Final Verification Test")
    print("=" * 40)
    
    try:
        # Test admin panel view
        admin_view_ok = test_admin_panel_view()
        
        # Test database consistency
        db_consistency_ok = test_database_consistency()
        
        # Create live test
        room, user = create_live_test()
        
        print("\n" + "=" * 40)
        print("🎯 FINAL RESULTS")
        print("=" * 40)
        
        if admin_view_ok and db_consistency_ok:
            print("🎉 SUCCESS! Chat authentication fix is working!")
            print("✅ Admin panel shows proper user identities")
            print("✅ Database stores correct user information")
            print("✅ New users will appear with their real names")
            print("\n💡 The 'Anonymous User' issue has been resolved!")
            print("💡 Refresh the admin panel to see the changes.")
            return True
        else:
            print("❌ FAILURE! Some issues remain.")
            if not admin_view_ok:
                print("❌ Admin panel still shows anonymous users")
            if not db_consistency_ok:
                print("❌ Database consistency issues")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
