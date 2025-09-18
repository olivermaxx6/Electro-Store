#!/usr/bin/env python3
"""
Comprehensive Chat System Test Script
Tests all chat functionality including API endpoints and WebSocket connections.
"""

import os
import sys
import django
import requests
import json
import time
import websocket
import threading
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from adminpanel.models import ChatRoom, ChatMessage
from rest_framework_simplejwt.tokens import AccessToken

class ChatSystemTester:
    def __init__(self):
        self.base_url = "http://127.0.0.1:8001"
        self.api_url = f"{self.base_url}/api"
        self.ws_url = "ws://127.0.0.1:8001"
        self.admin_token = None
        self.test_room_id = None
        
    def print_header(self, title):
        print("\n" + "=" * 60)
        print(f"🧪 {title}")
        print("=" * 60)
        
    def print_success(self, message):
        print(f"✅ {message}")
        
    def print_error(self, message):
        print(f"❌ {message}")
        
    def print_info(self, message):
        print(f"ℹ️ {message}")
        
    def test_server_health(self):
        """Test if the server is running and healthy"""
        self.print_header("Testing Server Health")
        
        try:
            response = requests.get(f"{self.api_url}/admin/health/ping/", timeout=5)
            if response.status_code == 200:
                self.print_success("Server is running and healthy")
                return True
            else:
                self.print_error(f"Server returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.print_error(f"Server is not responding: {e}")
            return False
    
    def create_test_admin(self):
        """Create or get test admin user"""
        self.print_header("Setting up Test Admin User")
        
        try:
            # Create admin user if it doesn't exist
            admin_user, created = User.objects.get_or_create(
                username='admin',
                defaults={
                    'email': 'admin@example.com',
                    'first_name': 'Test',
                    'last_name': 'Admin',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            
            if created:
                admin_user.set_password('admin123')
                admin_user.save()
                self.print_success("Created test admin user")
            else:
                self.print_info("Test admin user already exists")
            
            # Generate JWT token
            self.admin_token = str(AccessToken.for_user(admin_user))
            self.print_success("Generated admin JWT token")
            return True
            
        except Exception as e:
            self.print_error(f"Failed to create admin user: {e}")
            return False
    
    def test_public_chat_endpoints(self):
        """Test public chat API endpoints"""
        self.print_header("Testing Public Chat Endpoints")
        
        try:
            # Test public chat rooms endpoint
            response = requests.get(f"{self.api_url}/public/chat-rooms/")
            if response.status_code == 200:
                self.print_success("Public chat rooms endpoint accessible")
            else:
                self.print_error(f"Public chat rooms failed: {response.status_code}")
                return False
            
            # Create a test chat room
            room_data = {
                'customer_name': 'Test Customer',
                'customer_email': 'test@example.com',
                'customer_phone': '123-456-7890'
            }
            
            response = requests.post(f"{self.api_url}/public/chat-rooms/", json=room_data)
            if response.status_code == 201:
                self.test_room_id = response.json()['id']
                self.print_success(f"Created test chat room: {self.test_room_id}")
            else:
                self.print_error(f"Failed to create chat room: {response.status_code}")
                return False
            
            # Send a test message
            message_data = {'content': 'Hello, I need help!'}
            response = requests.post(
                f"{self.api_url}/public/chat-rooms/{self.test_room_id}/send_message/",
                json=message_data
            )
            
            if response.status_code == 201:
                self.print_success("Sent test customer message")
            else:
                self.print_error(f"Failed to send message: {response.status_code}")
                return False
            
            return True
            
        except Exception as e:
            self.print_error(f"Public endpoints test failed: {e}")
            return False
    
    def test_admin_chat_endpoints(self):
        """Test admin chat API endpoints"""
        self.print_header("Testing Admin Chat Endpoints")
        
        if not self.admin_token:
            self.print_error("No admin token available")
            return False
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        try:
            # Test admin chat rooms endpoint
            response = requests.get(f"{self.api_url}/admin/chat-rooms/", headers=headers)
            if response.status_code == 200:
                self.print_success("Admin chat rooms endpoint accessible")
            else:
                self.print_error(f"Admin chat rooms failed: {response.status_code}")
                return False
            
            # Send admin message
            if self.test_room_id:
                message_data = {'content': 'Hello! How can I help you today?'}
                response = requests.post(
                    f"{self.api_url}/admin/chat-rooms/{self.test_room_id}/send_message/",
                    json=message_data,
                    headers=headers
                )
                
                if response.status_code == 201:
                    self.print_success("Sent test admin message")
                else:
                    self.print_error(f"Failed to send admin message: {response.status_code}")
                    return False
            
            return True
            
        except Exception as e:
            self.print_error(f"Admin endpoints test failed: {e}")
            return False
    
    def test_websocket_connection(self):
        """Test WebSocket connections"""
        self.print_header("Testing WebSocket Connections")
        
        if not self.test_room_id:
            self.print_error("No test room ID available")
            return False
        
        # Test customer WebSocket
        customer_ws_url = f"{self.ws_url}/ws/chat/{self.test_room_id}/"
        self.print_info(f"Testing customer WebSocket: {customer_ws_url}")
        
        try:
            ws = websocket.WebSocket()
            ws.connect(customer_ws_url, timeout=5)
            self.print_success("Customer WebSocket connected")
            
            # Send a test message
            test_message = {
                'type': 'chat_message',
                'content': 'Test WebSocket message'
            }
            ws.send(json.dumps(test_message))
            self.print_success("Sent WebSocket message")
            
            ws.close()
            
        except Exception as e:
            self.print_error(f"Customer WebSocket test failed: {e}")
            return False
        
        # Test admin WebSocket
        if self.admin_token:
            admin_ws_url = f"{self.ws_url}/ws/admin/chat/?token={self.admin_token}"
            self.print_info(f"Testing admin WebSocket: {admin_ws_url}")
            
            try:
                ws = websocket.WebSocket()
                ws.connect(admin_ws_url, timeout=5)
                self.print_success("Admin WebSocket connected")
                
                # Send a test admin message
                test_message = {
                    'type': 'admin_message',
                    'room_id': self.test_room_id,
                    'content': 'Test admin WebSocket message'
                }
                ws.send(json.dumps(test_message))
                self.print_success("Sent admin WebSocket message")
                
                ws.close()
                
            except Exception as e:
                self.print_error(f"Admin WebSocket test failed: {e}")
                return False
        
        return True
    
    def test_database_integrity(self):
        """Test database models and relationships"""
        self.print_header("Testing Database Integrity")
        
        try:
            # Check if test room exists
            if self.test_room_id:
                room = ChatRoom.objects.get(id=self.test_room_id)
                self.print_success(f"Chat room found: {room.customer_name}")
                
                # Check messages
                messages = room.messages.all()
                self.print_success(f"Found {messages.count()} messages in room")
                
                # Check message types
                customer_messages = messages.filter(sender_type='customer')
                admin_messages = messages.filter(sender_type='admin')
                
                self.print_info(f"Customer messages: {customer_messages.count()}")
                self.print_info(f"Admin messages: {admin_messages.count()}")
            
            return True
            
        except Exception as e:
            self.print_error(f"Database integrity test failed: {e}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test data"""
        self.print_header("Cleaning Up Test Data")
        
        try:
            if self.test_room_id:
                ChatRoom.objects.filter(id=self.test_room_id).delete()
                self.print_success("Cleaned up test chat room")
            
            # Clean up any test messages
            ChatMessage.objects.filter(content__contains='Test').delete()
            self.print_success("Cleaned up test messages")
            
        except Exception as e:
            self.print_error(f"Cleanup failed: {e}")
    
    def run_all_tests(self):
        """Run all chat system tests"""
        print("🚀 Starting Comprehensive Chat System Tests")
        print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        tests = [
            ("Server Health", self.test_server_health),
            ("Test Admin Setup", self.create_test_admin),
            ("Public Chat Endpoints", self.test_public_chat_endpoints),
            ("Admin Chat Endpoints", self.test_admin_chat_endpoints),
            ("WebSocket Connections", self.test_websocket_connection),
            ("Database Integrity", self.test_database_integrity),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    self.print_error(f"{test_name} test failed")
            except Exception as e:
                self.print_error(f"{test_name} test crashed: {e}")
        
        # Cleanup
        self.cleanup_test_data()
        
        # Results
        self.print_header("Test Results")
        self.print_info(f"Tests passed: {passed}/{total}")
        
        if passed == total:
            self.print_success("🎉 All tests passed! Chat system is working correctly.")
            return True
        else:
            self.print_error(f"❌ {total - passed} tests failed. Please check the issues above.")
            return False

def main():
    tester = ChatSystemTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎯 Chat system is ready for use!")
        print("📝 Next steps:")
        print("   1. Start the frontend: npm run dev:admin")
        print("   2. Login as admin user")
        print("   3. Navigate to /admin/chat")
        print("   4. Test real-time chat functionality")
    else:
        print("\n🔧 Please fix the issues above before using the chat system.")
    
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())
