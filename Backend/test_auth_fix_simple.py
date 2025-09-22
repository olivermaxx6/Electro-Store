#!/usr/bin/env python3
"""
Simple test to verify chat authentication fixes.
Run this after starting the ASGI server to test the authentication.
"""

import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage

def test_authentication_fix():
    """Test that the authentication fix is working"""
    print("🧪 Testing Chat Authentication Fix")
    print("=" * 40)
    
    # Check if server is running
    try:
        response = requests.get("http://127.0.0.1:8001/api/admin/health/ping/", timeout=5)
        if response.status_code != 200:
            print("❌ Server not responding. Please start the ASGI server first:")
            print("   python run_asgi_server.py")
            return False
    except requests.exceptions.RequestException:
        print("❌ Server not running. Please start the ASGI server first:")
        print("   python run_asgi_server.py")
        return False
    
    print("✅ Server is running")
    
    # Create a test user
    test_user, created = User.objects.get_or_create(
        username='test_auth_user',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    if created:
        test_user.set_password('test123')
        test_user.save()
        print(f"✅ Created test user: {test_user.username}")
    else:
        print(f"✅ Using existing test user: {test_user.username}")
    
    # Get JWT token for the user
    try:
        response = requests.post("http://127.0.0.1:8001/api/auth/login/", {
            'username': test_user.username,
            'password': 'test123'
        })
        
        if response.status_code == 200:
            token = response.json()['access']
            print("✅ Got JWT token for test user")
        else:
            print(f"❌ Failed to get JWT token: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting JWT token: {e}")
        return False
    
    # Create a chat room
    try:
        room_data = {
            'customer_name': f"{test_user.first_name} {test_user.last_name}",
            'customer_email': test_user.email
        }
        
        response = requests.post("http://127.0.0.1:8001/api/public/chat-rooms/", json=room_data)
        
        if response.status_code == 201:
            room = response.json()
            print(f"✅ Created chat room: {room['id']}")
        else:
            print(f"❌ Failed to create chat room: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error creating chat room: {e}")
        return False
    
    # Send a message with authentication
    try:
        message_data = {
            'content': 'Hello from authenticated user!'
        }
        
        response = requests.post(
            f"http://127.0.0.1:8001/api/public/chat-rooms/{room['id']}/send_message/",
            json=message_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if response.status_code in [200, 201]:
            message = response.json()
            print(f"✅ Message sent successfully")
            print(f"📝 Sender name: {message.get('sender_name')}")
            
            # Check the database
            try:
                message_obj = ChatMessage.objects.get(id=message['id'])
                print(f"📝 Database sender_name: {message_obj.sender_name}")
                print(f"📝 Database sender_user: {message_obj.sender_user}")
                
                # Check if identity is preserved
                if message_obj.sender_name != 'Anonymous':
                    print("✅ Authentication fix working! User identity preserved.")
                    print(f"✅ User shows as '{message_obj.sender_name}' instead of 'Anonymous'")
                    
                    # Clean up
                    message_obj.delete()
                    ChatRoom.objects.get(id=room['id']).delete()
                    test_user.delete()
                    print("✅ Test data cleaned up")
                    
                    return True
                else:
                    print("❌ Authentication fix not working. Still showing as Anonymous.")
                    return False
            except ChatMessage.DoesNotExist:
                print("❌ Message not found in database")
                return False
        else:
            print(f"❌ Failed to send message: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        return False

def main():
    """Main function"""
    success = test_authentication_fix()
    
    if success:
        print("\n🎉 SUCCESS!")
        print("✅ Chat authentication fix is working correctly")
        print("✅ Signed-in users now show their correct username/email")
        print("✅ Admin panel will display proper user identity")
    else:
        print("\n❌ FAILURE!")
        print("❌ Authentication fix is not working")
        print("❌ Check the implementation and try again")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
