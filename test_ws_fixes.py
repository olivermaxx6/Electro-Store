#!/usr/bin/env python3
"""
Test script to verify WebSocket fixes.
Run this after implementing the fixes to verify everything works.
"""

import requests
import json
import time
import subprocess
import sys
import os

def test_health_endpoint():
    """Test the WS health endpoint"""
    print("🔍 Testing WS health endpoint...")
    try:
        response = requests.get("http://127.0.0.1:8001/health/ws/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working:")
            print(f"   ASGI App: {data.get('asgi_app')}")
            print(f"   Allowed Hosts: {data.get('allowed_hosts')}")
            print(f"   Channel Layer: {data.get('channel_layer')}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_channel_layer():
    """Test Redis/channel layer connectivity"""
    print("🔍 Testing channel layer...")
    try:
        result = subprocess.run([
            sys.executable, "Backend/manage.py", "ws_health"
        ], capture_output=True, text=True, cwd=".")
        
        if "Channel layer OK" in result.stdout:
            print("✅ Channel layer working")
            return True
        else:
            print(f"❌ Channel layer failed: {result.stdout}")
            return False
    except Exception as e:
        print(f"❌ Channel layer test error: {e}")
        return False

def test_websocket_connection():
    """Test WebSocket connection (requires running server)"""
    print("🔍 Testing WebSocket connection...")
    try:
        import websocket
        import threading
        
        def on_message(ws, message):
            print(f"📨 Received: {message}")
        
        def on_error(ws, error):
            print(f"❌ WS Error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            print(f"🔌 WS Closed: {close_status_code} - {close_msg}")
        
        def on_open(ws):
            print("✅ WebSocket connection opened!")
            ws.close()
        
        # Test customer WebSocket (no auth required)
        ws_url = "ws://127.0.0.1:8001/ws/chat/test-room/"
        ws = websocket.WebSocketApp(
            ws_url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close
        )
        
        # Run in thread with timeout
        ws_thread = threading.Thread(target=ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection
        time.sleep(2)
        
        if ws_thread.is_alive():
            print("✅ WebSocket connection test passed")
            return True
        else:
            print("❌ WebSocket connection test failed")
            return False
            
    except ImportError:
        print("⚠️  websocket-client not installed. Install with: pip install websocket-client")
        return False
    except Exception as e:
        print(f"❌ WebSocket test error: {e}")
        return False

def main():
    print("🚀 Testing WebSocket fixes...")
    print("=" * 50)
    
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("Channel Layer", test_channel_layer),
        ("WebSocket Connection", test_websocket_connection),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Summary: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! WebSocket fixes are working.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    print("\n📝 Next steps:")
    print("1. Start ASGI server: python Backend/run_asgi_dev.py")
    print("2. Test admin WebSocket with valid JWT token")
    print("3. Test customer WebSocket in browser")
    print("4. Check browser console for connection status")

if __name__ == "__main__":
    main()
