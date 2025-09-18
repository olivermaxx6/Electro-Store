# Chat System Troubleshooting Guide

## 🚨 Current Issue: Network Errors and Connection Failures

The admin chat is showing "Network Error", "Connection Failed", and "Failed to fetch chat rooms" because the ASGI server is not running properly.

## 🔧 Solution Steps

### Step 1: Start the ASGI Server

**Option A: Use the Updated Development Script (Recommended)**
```powershell
# Navigate to Backend directory
cd Backend

# Run the updated development script
.\dev.ps1
```

**Option B: Use the Dedicated Chat Server**
```powershell
# Navigate to Backend directory
cd Backend

# Run the dedicated chat server
.\start_chat_server.ps1
```

**Option C: Manual ASGI Server Start**
```powershell
# Navigate to Backend directory
cd Backend

# Start ASGI server directly
python run_asgi_server.py
```

### Step 2: Verify Server is Running

After starting the server, you should see output like:
```
🚀 DJANGO ASGI SERVER WITH WEBSOCKET SUPPORT
📡 Real-time Chat Server for Admin-User Communication
🌐 HTTP Server: http://127.0.0.1:8001
🔌 WebSocket Endpoints:
   • Customer Chat: ws://127.0.0.1:8001/ws/chat/{room_id}/
   • Admin Chat: ws://127.0.0.1:8001/ws/admin/chat/
✅ Starting ASGI server with uvicorn...
INFO:     Uvicorn running on http://127.0.0.1:8001
```

### Step 3: Test API Endpoints

Open a new terminal and test the endpoints:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/admin/health/ping/" -Method GET

# Test chat rooms endpoint (requires authentication)
Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/admin/chat-rooms/" -Method GET -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}
```

### Step 4: Check Frontend Connection

1. **Open the admin panel** in your browser
2. **Navigate to the chat page** (`/admin/chat`)
3. **Check browser console** for any WebSocket connection errors
4. **Verify authentication** - make sure you're logged in as an admin user

## 🔍 Common Issues and Solutions

### Issue 1: "Connection Failed" / "Network Error"
**Cause**: ASGI server is not running
**Solution**: Start the ASGI server using one of the methods above

### Issue 2: "Failed to fetch chat rooms"
**Cause**: Authentication token is missing or invalid
**Solution**: 
1. Log out and log back in to the admin panel
2. Check browser localStorage for valid JWT token
3. Verify the token is not expired

### Issue 3: WebSocket Connection Errors
**Cause**: Server is running Django's `runserver` instead of ASGI server
**Solution**: Always use the ASGI server (`uvicorn`) for WebSocket functionality

### Issue 4: "Authentication required" Error
**Cause**: JWT token is missing or expired
**Solution**:
1. Check if you're logged in as an admin user
2. Refresh the page to get a new token
3. Clear browser cache and localStorage

## 🧪 Testing the Chat System

### Test 1: Create a Test Chat Room
```python
# In Django shell (python manage.py shell)
from adminpanel.models import ChatRoom, ChatMessage

# Create a test chat room
room = ChatRoom.objects.create(
    customer_name="Test Customer",
    customer_email="test@example.com",
    status="active"
)

# Create a test message
message = ChatMessage.objects.create(
    room=room,
    sender_type="customer",
    sender_name="Test Customer",
    content="Hello, I need help!",
    is_read=False
)

print(f"Created room: {room.id}")
print(f"Created message: {message.id}")
```

### Test 2: Verify API Endpoints
```bash
# Test public chat rooms endpoint
curl -X GET http://127.0.0.1:8001/api/public/chat-rooms/

# Test admin chat rooms endpoint (with auth)
curl -X GET http://127.0.0.1:8001/api/admin/chat-rooms/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 API Endpoints Reference

### Public Endpoints (No Authentication Required)
- `GET /api/public/chat-rooms/` - List all chat rooms
- `POST /api/public/chat-rooms/` - Create new chat room
- `GET /api/public/chat-rooms/{id}/` - Get specific chat room
- `POST /api/public/chat-rooms/{id}/send_message/` - Send customer message
- `GET /api/public/chat-rooms/{id}/get_messages/` - Get room messages

### Admin Endpoints (Authentication Required)
- `GET /api/admin/chat-rooms/` - List all chat rooms (admin view)
- `GET /api/admin/chat-rooms/{id}/` - Get specific chat room
- `POST /api/admin/chat-rooms/{id}/send_message/` - Send admin message
- `POST /api/admin/chat-rooms/{id}/mark_as_read/` - Mark messages as read

### WebSocket Endpoints
- `ws://127.0.0.1:8001/ws/admin/chat/?token=JWT_TOKEN` - Admin WebSocket
- `ws://127.0.0.1:8001/ws/chat/{room_id}/` - Customer WebSocket

## 🚀 Quick Fix Commands

If you're still having issues, run these commands in order:

```powershell
# 1. Stop any existing processes
taskkill /f /im python.exe

# 2. Navigate to Backend directory
cd Backend

# 3. Run migrations
python manage.py migrate

# 4. Start ASGI server
python run_asgi_server.py
```

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Server running** on http://127.0.0.1:8001
2. **Admin chat page** loads without errors
3. **WebSocket connection** shows "Real-time Connected"
4. **Chat rooms** load in the conversations list
5. **Messages** can be sent and received in real-time

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check server logs** for any error messages
2. **Verify all dependencies** are installed: `pip install uvicorn channels websockets`
3. **Clear browser cache** and localStorage
4. **Restart the server** and try again
5. **Check firewall settings** - ensure port 8001 is not blocked

The chat system is fully configured and should work once the ASGI server is running properly!
