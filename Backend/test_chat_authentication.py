#!/usr/bin/env python3
"""
Test script to verify chat authentication fixes.
This script tests that signed-in users appear with their correct username/email
instead of "Anonymous User" in the admin panel.
"""

import os
import sys
import django
import json
import requests
import websocket
import threading
import time
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage
from rest_framework_simplejwt.tokens import AccessToken

class ChatAuthenticationTester:
    def __init__(self):
        self.base_url = "http://127.0.0.1:8001"
        self.ws_base = "ws://127.0.0.1:8001"
        self.admin_token = None
        self.customer_token = None
        self.admin_user = None
        self.customer_user = None
        self.test_room = None
        
    def setup_test_users(self):
        """Create test users for authentication testing"""
        print("🔧 Setting up test users...")
        
        # Create or get admin user
        self.admin_user, created = User.objects.get_or_create(
            username='test_admin',
            defaults={
                'email': 'admin@test.com',
                'first_name': 'Test',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            self.admin_user.set_password('admin123')
            self.admin_user.save()
            print(f"✅ Created admin user: {self.admin_user.username}")
        else:
            print(f"✅ Using existing admin user: {self.admin_user.username}")
        
        # Create or get customer user
        self.customer_user, created = User.objects.get_or_create(
            username='test_customer',
            defaults={
                'email': 'customer@test.com',
                'first_name': 'Test',
                'last_name': 'Customer'
            }
        )
        if created:
            self.customer_user.set_password('customer123')
            self.customer_user.save()
            print(f"✅ Created customer user: {self.customer_user.username}")
        else:
            print(f"✅ Using existing customer user: {self.customer_user.username}")
    
    def get_tokens(self):
        """Get JWT tokens for both users"""
        print("🔑 Getting JWT tokens...")
        
        # Get admin token
        admin_response = requests.post(f"{self.base_url}/api/admin/auth/login/", {
            'username': self.admin_user.username,
            'password': 'admin123'
        })
        if admin_response.status_code == 200:
            self.admin_token = admin_response.json()['access']
            print(f"✅ Admin token obtained")
        else:
            print(f"❌ Failed to get admin token: {admin_response.status_code}")
            return False
        
        # Get customer token (using auth endpoint)
        customer_response = requests.post(f"{self.base_url}/api/auth/login/", {
            'username': self.customer_user.username,
            'password': 'customer123'
        })
        if customer_response.status_code == 200:
            self.customer_token = customer_response.json()['access']
            print(f"✅ Customer token obtained")
        else:
            print(f"❌ Failed to get customer token: {customer_response.status_code}")
            return False
        
        return True
    
    def create_test_chat_room(self):
        """Create a test chat room"""
        print("💬 Creating test chat room...")
        
        # Create chat room via public API
        room_data = {
            'customer_name': f"{self.customer_user.first_name} {self.customer_user.last_name}",
            'customer_email': self.customer_user.email
        }
        
        response = requests.post(f"{self.base_url}/api/public/chat-rooms/", json=room_data)
        if response.status_code == 201:
            self.test_room = response.json()
            print(f"✅ Test chat room created: {self.test_room['id']}")
            return True
        else:
            print(f"❌ Failed to create chat room: {response.status_code}")
            return False
    
    def test_customer_websocket_with_auth(self):
        """Test customer WebSocket connection with authentication"""
        print("🔌 Testing customer WebSocket with authentication...")
        
        ws_url = f"{self.ws_base}/ws/chat/{self.test_room['id']}/?token={self.customer_token}"
        print(f"Connecting to: {ws_url}")
        
        messages_received = []
        
        def on_message(ws, message):
            data = json.loads(message)
            messages_received.append(data)
            print(f"📨 Received: {data.get('type', 'unknown')}")
        
        def on_error(ws, error):
            print(f"❌ WebSocket error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            print(f"🔌 WebSocket closed: {close_status_code}")
        
        def on_open(ws):
            print("✅ Customer WebSocket connected with authentication")
            # Send a test message
            test_message = {
                'type': 'chat_message',
                'content': 'Hello from authenticated customer!'
            }
            ws.send(json.dumps(test_message))
            print("📤 Sent test message from customer")
        
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
        
        # Wait for messages
        time.sleep(2)
        
        # Check if we received room info
        room_info_received = any(msg.get('type') == 'room_info' for msg in messages_received)
        if room_info_received:
            print("✅ Customer WebSocket authentication working - received room info")
        else:
            print("❌ Customer WebSocket authentication failed - no room info received")
        
        ws.close()
        return room_info_received
    
    def test_admin_websocket(self):
        """Test admin WebSocket connection"""
        print("🔌 Testing admin WebSocket connection...")
        
        ws_url = f"{self.ws_base}/ws/admin/chat/?token={self.admin_token}"
        print(f"Connecting to: {ws_url}")
        
        messages_received = []
        
        def on_message(ws, message):
            data = json.loads(message)
            messages_received.append(data)
            print(f"📨 Admin received: {data.get('type', 'unknown')}")
        
        def on_error(ws, error):
            print(f"❌ Admin WebSocket error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            print(f"🔌 Admin WebSocket closed: {close_status_code}")
        
        def on_open(ws):
            print("✅ Admin WebSocket connected")
        
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
        
        # Wait for messages
        time.sleep(2)
        
        # Check if we received room list
        room_list_received = any(msg.get('type') == 'room_list' for msg in messages_received)
        if room_list_received:
            print("✅ Admin WebSocket working - received room list")
        else:
            print("❌ Admin WebSocket failed - no room list received")
        
        ws.close()
        return room_list_received
    
    def test_message_identity(self):
        """Test that messages show correct user identity"""
        print("👤 Testing message identity...")
        
        # Send a message as authenticated customer
        message_data = {
            'content': 'This is a test message from authenticated customer'
        }
        
        response = requests.post(
            f"{self.base_url}/api/public/chat-rooms/{self.test_room['id']}/send_message/",
            json=message_data,
            headers={'Authorization': f'Bearer {self.customer_token}'}
        )
        
        if response.status_code == 200:
            sent_message = response.json()
            print(f"✅ Message sent successfully")
            print(f"📝 Message sender_name: {sent_message.get('sender_name')}")
            
            # Check if the message was saved with correct identity
            try:
                message_obj = ChatMessage.objects.get(id=sent_message['id'])
                print(f"📝 Database sender_name: {message_obj.sender_name}")
                print(f"📝 Database sender_user: {message_obj.sender_user}")
                
                # Verify the sender_name is not "Anonymous"
                if message_obj.sender_name != 'Anonymous' and self.customer_user.username in message_obj.sender_name:
                    print("✅ Message identity correctly preserved!")
                    return True
                else:
                    print("❌ Message identity not preserved - still showing as Anonymous")
                    return False
            except ChatMessage.DoesNotExist:
                print("❌ Message not found in database")
                return False
        else:
            print(f"❌ Failed to send message: {response.status_code}")
            return False
    
    def test_admin_message_view(self):
        """Test admin can see customer messages with correct identity"""
        print("👨‍💼 Testing admin message view...")
        
        # Get chat room from admin perspective
        response = requests.get(
            f"{self.base_url}/api/admin/chat-rooms/{self.test_room['id']}/",
            headers={'Authorization': f'Bearer {self.admin_token}'}
        )
        
        if response.status_code == 200:
            room_data = response.json()
            messages = room_data.get('messages', [])
            
            print(f"📊 Admin sees {len(messages)} messages")
            
            # Check if any customer message shows correct identity
            customer_messages = [msg for msg in messages if msg['sender_type'] == 'customer']
            if customer_messages:
                latest_customer_msg = customer_messages[-1]
                print(f"📝 Latest customer message sender_name: {latest_customer_msg.get('sender_name')}")
                print(f"📝 Latest customer message sender_email: {latest_customer_msg.get('sender_email')}")
                
                if latest_customer_msg.get('sender_name') != 'Anonymous':
                    print("✅ Admin can see customer identity correctly!")
                    return True
                else:
                    print("❌ Admin still sees customer as Anonymous")
                    return False
            else:
                print("❌ No customer messages found")
                return False
        else:
            print(f"❌ Failed to get admin chat room: {response.status_code}")
            return False
    
    def cleanup(self):
        """Clean up test data"""
        print("🧹 Cleaning up test data...")
        
        if self.test_room:
            try:
                room_obj = ChatRoom.objects.get(id=self.test_room['id'])
                room_obj.delete()
                print("✅ Test chat room deleted")
            except ChatRoom.DoesNotExist:
                pass
        
        # Delete test users
        if self.customer_user:
            self.customer_user.delete()
            print("✅ Test customer user deleted")
        
        if self.admin_user:
            self.admin_user.delete()
            print("✅ Test admin user deleted")
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🚀 Starting Chat Authentication Tests")
        print("=" * 50)
        
        try:
            # Setup
            self.setup_test_users()
            if not self.get_tokens():
                return False
            
            if not self.create_test_chat_room():
                return False
            
            # Run tests
            tests = [
                ("Customer WebSocket Authentication", self.test_customer_websocket_with_auth),
                ("Admin WebSocket Connection", self.test_admin_websocket),
                ("Message Identity Preservation", self.test_message_identity),
                ("Admin Message View", self.test_admin_message_view)
            ]
            
            results = []
            for test_name, test_func in tests:
                print(f"\n🧪 Running: {test_name}")
                print("-" * 30)
                result = test_func()
                results.append((test_name, result))
                print(f"{'✅ PASSED' if result else '❌ FAILED'}: {test_name}")
            
            # Summary
            print("\n" + "=" * 50)
            print("📊 TEST RESULTS SUMMARY")
            print("=" * 50)
            
            passed = sum(1 for _, result in results if result)
            total = len(results)
            
            for test_name, result in results:
                status = "✅ PASSED" if result else "❌ FAILED"
                print(f"{status}: {test_name}")
            
            print(f"\n🎯 Overall: {passed}/{total} tests passed")
            
            if passed == total:
                print("🎉 ALL TESTS PASSED! Authentication fixes are working correctly.")
                print("✅ Signed-in users now appear with their correct username/email")
                print("✅ Admin panel shows proper user identity")
                return True
            else:
                print("❌ Some tests failed. Check the implementation.")
                return False
                
        except Exception as e:
            print(f"❌ Test execution failed: {e}")
            return False
        finally:
            self.cleanup()

def main():
    """Main test function"""
    print("🔧 Chat Authentication Fix Verification")
    print("This script tests that signed-in users appear with correct identity")
    print("instead of 'Anonymous User' in the admin panel.")
    print()
    
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
    
    # Run tests
    tester = ChatAuthenticationTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 SUCCESS: Chat authentication fixes are working!")
        print("✅ Signed-in users now show their correct username/email")
        print("✅ Admin panel displays proper user identity")
        print("✅ WebSocket authentication is working correctly")
    else:
        print("\n❌ FAILURE: Some tests failed. Check the implementation.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
