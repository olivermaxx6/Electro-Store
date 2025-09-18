# WebSocket Authentication Fixes

This document describes the fixes applied to resolve WebSocket authentication issues in the ecommerce application.

## Issues Fixed

### 1. Admin UI Issues
- **Problem**: Admin UI showed "Given token not valid for any token type" and remained "Disconnected"
- **Root Cause**: JWT middleware wasn't properly handling token validation and type checking

### 2. Customer UI Issues  
- **Problem**: Customer UI stayed on "Connecting..." (socket never reached OPEN)
- **Root Cause**: WebSocket connection issues and improper error handling

## Changes Made

### Backend Changes

#### 1. JWT WebSocket Middleware (`Backend/adminpanel/jwt_ws_auth.py`)
- **Added Bearer prefix stripping**: Automatically removes "Bearer " prefix from tokens
- **Enforced access token requirement**: Only accepts tokens with `token_type == "access"`
- **Enhanced error logging**: Provides detailed error information in `scope["jwt_error"]`
- **Improved token validation**: Better handling of invalid/expired tokens

#### 2. WebSocket Consumers (`Backend/adminpanel/consumers.py`)
- **Enhanced AdminChatConsumer**: Added detailed logging for authentication failures
- **Improved error codes**: Uses proper WebSocket close codes (4401 for unauthorized, 4403 for forbidden)
- **Fixed ChatConsumer**: Ensured it accepts anonymous connections without JWT requirements

#### 3. SIMPLE_JWT Configuration (`Backend/core/settings.py`)
- **Simplified configuration**: Removed unnecessary settings that could cause token validation issues
- **Stable token lifetime**: Set to 6 hours for development
- **Clear documentation**: Added comments about SECRET_KEY stability

### Frontend Changes

#### 1. WebSocket Connection (`Frontend/src/store/chatApiStore.js`)
- **Improved URL construction**: Better handling of WebSocket URLs
- **Enhanced error handling**: Specific handling for different WebSocket close codes
- **User-friendly error messages**: Clear error messages for different failure scenarios

#### 2. Admin Chat UI (`Frontend/src/admin/pages/admin/ChatPage.jsx`)
- **Error display**: Shows authentication errors in the UI
- **Connection status**: Better visual feedback for connection state

## WebSocket Close Codes

The implementation now uses proper WebSocket close codes:

- **4401**: Unauthorized (missing, expired, or invalid token)
- **4403**: Forbidden (valid token but user lacks admin permissions)
- **1000**: Normal closure (successful connection)

## Error Messages

### Admin UI Error Messages
- **4401**: "Session expired or invalid. Please sign in again."
- **4403**: "Your account lacks admin permissions."
- **Other**: "Connection failed (code XXXX). Check network/server."

## Testing

### Test Scripts
Two test scripts are provided:

1. **`test_websocket_auth_fix.py`**: Comprehensive WebSocket authentication tests
2. **`debug_jwt_tokens.py`**: JWT token debugging utility

### Manual Testing Steps

#### Admin WebSocket Testing
1. **Valid Access Token**: Should connect successfully
2. **Invalid Token**: Should close with code 4401
3. **Refresh Token**: Should close with code 4401 (access tokens only)
4. **Bearer Prefix**: Should work (prefix is automatically stripped)
5. **No Token**: Should close with code 4401
6. **Non-staff User**: Should close with code 4403

#### Customer WebSocket Testing
1. **Anonymous Connection**: Should connect successfully without token
2. **Message Sending**: Should work for both customer and admin

## Configuration Requirements

### Backend Requirements
- Django Channels with WebSocket support
- REST Framework SimpleJWT
- Proper ASGI configuration with middleware order

### Frontend Requirements
- Access token stored in `localStorage.access_token` (without Bearer prefix)
- Proper WebSocket URL construction
- Error handling for connection failures

## Troubleshooting

### Common Issues

1. **"Given token not valid for any token type"**
   - Ensure you're using an ACCESS token (not refresh token)
   - Check that the token is not expired
   - Verify SECRET_KEY is stable across restarts

2. **Customer WebSocket stuck on "Connecting..."**
   - Check that the WebSocket server is running on port 8001
   - Verify the customer WebSocket URL is correct
   - Check browser console for WebSocket errors

3. **Admin WebSocket closes immediately**
   - Verify the access token is valid and not expired
   - Check that the user has admin permissions (is_staff or is_superuser)
   - Ensure the token is being passed correctly in the query parameter

### Debugging Tools

1. **JWT Token Debugger**: Use `debug_jwt_tokens.py` to analyze token structure
2. **Browser Console**: Check for WebSocket connection logs
3. **Server Logs**: Look for authentication error messages in Django logs

## Security Considerations

- Only ACCESS tokens are accepted for WebSocket connections
- Refresh tokens are explicitly rejected
- Bearer prefix is automatically stripped to prevent confusion
- Proper error codes help distinguish between different failure types
- Anonymous connections are allowed for customer chat (no authentication required)

## Future Improvements

- Add token refresh mechanism for long-lived WebSocket connections
- Implement connection retry logic with exponential backoff
- Add more detailed logging for debugging
- Consider implementing WebSocket heartbeat/ping-pong for connection health monitoring
