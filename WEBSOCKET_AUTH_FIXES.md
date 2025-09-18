# WebSocket Authentication Fixes

## Summary of Changes

This document outlines the fixes implemented to resolve WebSocket authentication issues:

### Backend Changes

#### 1. Updated ASGI Configuration (`Backend/core/asgi.py`)
- Replaced `AuthMiddlewareStack` with `SessionMiddlewareStack` + `JWTAuthMiddleware`
- Proper middleware composition: Session → JWT → URLRouter
- Direct import of consumers and middleware

#### 2. Created New JWT WebSocket Middleware (`Backend/adminpanel/jwt_ws_auth.py`)
- Accepts `?token=` or `?access=` query parameters
- Gracefully handles invalid tokens (sets AnonymousUser instead of crashing)
- Uses `rest_framework_simplejwt.authentication.JWTAuthentication`

#### 3. Updated WebSocket Consumers (`Backend/adminpanel/consumers.py`)
- **AdminChatConsumer**: Explicit close codes (4401 for unauthorized, 4403 for non-staff)
- **ChatConsumer**: Allows anonymous connections (no changes needed)

#### 4. Updated SIMPLE_JWT Configuration (`Backend/core/settings.py`)
- Added explicit `ALGORITHM: "HS256"`
- Reduced ACCESS token lifetime to 6 hours for dev-friendly testing
- Maintained stable signing key (Django SECRET_KEY)

### Frontend Changes

#### 5. Updated Chat API Store (`Frontend/src/store/chatApiStore.js`)
- Enhanced token retrieval to check `localStorage.access_token` first
- Added proper WebSocket close code logging
- Improved error handling and connection status reporting

#### 6. Updated Admin Auth Store (`Frontend/src/admin/store/authStore.js`)
- Store ACCESS token directly in `localStorage.access_token` on login
- Remove ACCESS token on logout
- Maintains backward compatibility with existing auth object

## Testing Instructions

### 1. Start the Backend Server
```bash
cd Backend
python manage.py runserver 127.0.0.1:8001
```

### 2. Test Token Validity
```bash
python check_token_validity.py "your_access_token_here"
```

### 3. Test WebSocket Connections
```bash
python test_websocket_auth.py
```

### 4. Manual Testing

#### Admin WebSocket Test
1. Login to admin panel
2. Open browser console
3. Check for `localStorage.getItem('access_token')` - should return a valid JWT
4. Navigate to Chat page
5. Look for console logs:
   - `Admin WS OPEN` - successful connection
   - `Admin WS CLOSED 4401` - invalid/expired token
   - `Admin WS CLOSED 4403` - user not staff

#### Customer WebSocket Test
1. Open storefront
2. Open chat modal
3. Look for console logs:
   - `Customer WS OPEN` - successful connection
   - `Customer WS CLOSED` with specific code - connection issue

## Expected Behavior

### Admin WebSocket
- ✅ **Valid ACCESS token + staff user**: Connects successfully
- ❌ **Invalid/expired token**: Closes with code 4401
- ❌ **Valid token + non-staff user**: Closes with code 4403
- ❌ **No token**: Closes with code 4401

### Customer WebSocket
- ✅ **Anonymous connection**: Connects successfully
- ✅ **No authentication required**: Works without tokens

## Troubleshooting

### Common Issues

1. **"Given token not valid for any token type"**
   - Check if token is stored in `localStorage.access_token`
   - Verify token hasn't expired
   - Ensure SIMPLE_JWT settings are consistent

2. **Customer UI stuck on "Connecting..."**
   - Check WebSocket URL format
   - Verify Django server is running on port 8001
   - Check browser console for connection errors

3. **Admin WebSocket closes immediately**
   - Verify user has `is_staff=True` in Django admin
   - Check token validity with diagnostic script
   - Ensure token is ACCESS token, not refresh token

### Debug Commands

```bash
# Check Django user permissions
python manage.py shell
>>> from django.contrib.auth.models import User
>>> user = User.objects.get(username='your_admin_username')
>>> print(f"is_staff: {user.is_staff}, is_superuser: {user.is_superuser}")

# Check token in browser console
localStorage.getItem('access_token')?.split('.').length === 3  // should be true

# Test Redis connection (if using Redis channel layer)
redis-cli PING  # should return PONG
```

## Files Modified

- `Backend/core/asgi.py`
- `Backend/adminpanel/jwt_ws_auth.py` (new)
- `Backend/adminpanel/consumers.py`
- `Backend/core/settings.py`
- `Frontend/src/store/chatApiStore.js`
- `Frontend/src/admin/store/authStore.js`

## Files Created

- `test_websocket_auth.py` - WebSocket connection tests
- `check_token_validity.py` - JWT token validation
- `WEBSOCKET_AUTH_FIXES.md` - This documentation

## Next Steps

1. Test the implementation with real admin login
2. Verify customer chat works without authentication
3. Monitor server logs for any authentication errors
4. Consider adding exponential backoff for WebSocket reconnection
5. Add proper error handling for network issues
