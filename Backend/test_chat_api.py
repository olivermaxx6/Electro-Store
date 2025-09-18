#!/usr/bin/env python3
"""
Test the chat API endpoints and WebSocket connections.
"""

import requests
import json
import asyncio
import websockets

API_BASE = "http://127.0.0.1:8001/api"

async def test_chat_system():
    print("Testing Chat System...")
    print("=" * 50)
    
    # Test 1: Create a chat room via public API
    print("1. Creating a chat room...")
    try:
        response = requests.post(f"{API_BASE}/public/chat-rooms/", json={
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+1234567890"
        })
        
        if response.status_code == 201:
            room = response.json()
            room_id = room['id']
            print(f"   ✓ Chat room created successfully: {room_id}")
            print(f"   Customer: {room['customer_name']} ({room['customer_email']})")
        else:
            print(f"   ✗ Failed to create chat room: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"   ✗ Error creating chat room: {e}")
        return
    
    # Test 2: Test customer WebSocket connection
    print(f"\n2. Testing customer WebSocket connection to room {room_id}...")
    try:
        customer_uri = f"ws://127.0.0.1:8001/ws/chat/{room_id}/"
        async with websockets.connect(customer_uri) as websocket:
            print("   ✓ Customer WebSocket connected successfully!")
            
            # Send a test message
            test_message = {
                "type": "chat_message",
                "content": "Hello from customer!"
            }
            await websocket.send(json.dumps(test_message))
            print("   ✓ Customer message sent")
            
            # Wait for response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                data = json.loads(response)
                print(f"   ✓ Received response: {data.get('type', 'unknown')}")
            except asyncio.TimeoutError:
                print("   ⚠ No response received (timeout)")
            
    except Exception as e:
        print(f"   ✗ Customer WebSocket failed: {e}")
    
    # Test 3: Get admin token (if possible)
    print(f"\n3. Testing admin authentication...")
    try:
        # Try to get admin token
        auth_response = requests.post(f"{API_BASE}/auth/login/", json={
            "username": "admin",
            "password": "admin"
        })
        
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            access_token = auth_data.get('access')
            print("   ✓ Admin authentication successful")
            
            # Test 4: Test admin WebSocket connection with token
            print(f"\n4. Testing admin WebSocket connection...")
            try:
                admin_uri = f"ws://127.0.0.1:8001/ws/admin/chat?token={access_token}"
                async with websockets.connect(admin_uri) as websocket:
                    print("   ✓ Admin WebSocket connected successfully!")
                    
                    # Wait for room list
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                        data = json.loads(response)
                        print(f"   ✓ Received room list: {len(data.get('rooms', []))} rooms")
                    except asyncio.TimeoutError:
                        print("   ⚠ No room list received (timeout)")
                    
                    # Send admin message to the room
                    admin_message = {
                        "type": "admin_message",
                        "room_id": room_id,
                        "content": "Hello from admin!"
                    }
                    await websocket.send(json.dumps(admin_message))
                    print("   ✓ Admin message sent")
                    
            except Exception as e:
                print(f"   ✗ Admin WebSocket failed: {e}")
                
        else:
            print(f"   ✗ Admin authentication failed: {auth_response.status_code}")
            print(f"   Response: {auth_response.text}")
            
    except Exception as e:
        print(f"   ✗ Admin authentication error: {e}")
    
    print("\n" + "=" * 50)
    print("Chat system test completed!")

if __name__ == "__main__":
    asyncio.run(test_chat_system())
