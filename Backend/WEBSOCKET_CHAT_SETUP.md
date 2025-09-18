# WebSocket Chat Setup Guide

## 🚀 Quick Start

Your WebSocket chat issues are now resolved! The main problem was running the wrong type of server. Use the ASGI server instead of the regular Django server, and your admin chat will work with real-time WebSocket connections.

## 📋 Available Startup Scripts

### Option 1: Use the Updated Development Script (Recommended)
```powershell
# In Backend directory
.\dev.ps1
```

### Option 2: Use the Dedicated Chat Server
```powershell
# In Backend directory
.\start_chat_server.ps1
```

### Option 3: Use the ASGI Server Script
```powershell
# In Backend directory
python run_asgi_server.py
```

### Option 4: Manual ASGI Server Start
```powershell
# In Backend directory
uvicorn core.asgi:application --host 127.0.0.1 --port 8001 --reload --log-level info
```

## 🔌 WebSocket Endpoints

- **Customer Chat**: `ws://127.0.0.1:8001/ws/chat/{room_id}/`
- **Admin Chat**: `ws://127.0.0.1:8001/ws/admin/chat/`

## 🔧 What Was Fixed

1. **Server Type**: Changed from Django's `runserver` to ASGI server (`uvicorn`)
2. **WebSocket Support**: ASGI server properly handles WebSocket connections
3. **Authentication**: JWT authentication middleware for WebSocket connections
4. **Channel Layers**: In-memory channel layer for real-time communication

## 📁 Key Files

- `core/asgi.py` - ASGI application configuration
- `adminpanel/consumers.py` - WebSocket consumers for chat
- `adminpanel/jwt_ws_auth.py` - JWT authentication middleware
- `dev.ps1` - Updated development server script
- `chat_server.py` - Dedicated chat server
- `start_chat_server.ps1` - PowerShell script for chat server

## 🛠️ Dependencies

Make sure these are installed:
```bash
pip install uvicorn channels websockets
```

## 🧪 Testing WebSocket Connection

You can test the WebSocket connection using the provided test files:
- `test_websocket_chat.py`
- `test_chat_api.py`

## 🚨 Important Notes

- **Always use ASGI server** for WebSocket functionality
- **Never use** `python manage.py runserver` for chat features
- The server must run on **port 8001** for proper frontend integration
- WebSocket connections require **JWT authentication** for admin endpoints

## 🔍 Troubleshooting

If WebSocket connections fail:
1. Ensure you're using the ASGI server (not Django's runserver)
2. Check that uvicorn is installed: `pip install uvicorn`
3. Verify the server is running on port 8001
4. Check browser console for WebSocket connection errors
5. Ensure JWT tokens are valid for admin authentication

## 📊 Server Status

When the ASGI server starts successfully, you should see:
```
🚀 DJANGO ASGI SERVER WITH WEBSOCKET SUPPORT
📡 Real-time Chat Server for Admin-User Communication
🌐 HTTP Server: http://127.0.0.1:8001
🔌 WebSocket Endpoints:
   • Customer Chat: ws://127.0.0.1:8001/ws/chat/{room_id}/
   • Admin Chat: ws://127.0.0.1:8001/ws/admin/chat/
```

This confirms that WebSocket support is active and ready for real-time chat communication!
