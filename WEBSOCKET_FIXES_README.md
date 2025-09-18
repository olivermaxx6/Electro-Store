# WebSocket Connection Fixes

This document outlines the fixes implemented to resolve WebSocket connection issues (code 1006) and improve diagnostics.

## Problem Summary

**Symptoms:**
- Admin: "Disconnected + Connection failed (code 1006)"
- Customer: "Connecting..." forever
- Silent connection failures without clear error messages

**Root Causes:**
1. Hard-coded port 8001 in frontend WebSocket URLs
2. Protocol mismatch (ws:// vs wss://) on HTTPS pages
3. Missing server-side diagnostics for connection failures
4. No Redis/channel layer health checks
5. Insufficient error logging in WebSocket consumers

## Implemented Fixes

### 1. Server-Side Diagnostics

#### Health Endpoint (`/health/ws/`)
- **File:** `Backend/core/views_health.py`
- **Purpose:** Verify ASGI configuration and settings
- **Usage:** Visit `http://localhost:8001/health/ws/` in browser

#### Enhanced Consumer Logging
- **File:** `Backend/adminpanel/consumers.py`
- **Changes:**
  - Added comprehensive logging for connect/disconnect events
  - Clear error codes (4401/4403/1011) instead of silent 1006
  - Redis/channel layer error handling with specific error codes
  - Exception handling with proper close codes

#### Channel Layer Health Check
- **File:** `Backend/core/management/commands/ws_health.py`
- **Usage:** `python manage.py ws_health`
- **Purpose:** Verify Redis connectivity before WebSocket connections

### 2. Frontend WebSocket URL Fixes

#### WS URL Builder Utility
- **File:** `Frontend/src/lib/wsUrl.ts`
- **Features:**
  - Auto-detects protocol (ws:// vs wss://) based on page protocol
  - Uses page host instead of hardcoded port
  - Supports environment variable override (`VITE_WS_BASE`)

#### Updated Connection Logic
- **File:** `Frontend/src/store/chatApiStore.js`
- **Changes:**
  - Removed hardcoded port 8001
  - Uses `makeWsUrl()` utility for proper URL construction
  - Supports environment-based WebSocket base URL

### 3. Development Configuration

#### Permissive Development Settings
- **File:** `Backend/core/settings.py`
- **Changes:**
  - `ALLOWED_HOSTS = ["*"]` for development
  - `SECURE_SSL_REDIRECT = False` for HTTP development
  - Enhanced logging configuration

#### ASGI Development Server
- **File:** `Backend/run_asgi_dev.py`
- **Purpose:** Run proper ASGI server with WebSocket support
- **Usage:** `python Backend/run_asgi_dev.py`

## Testing & Verification

### Automated Tests
Run the test script to verify all fixes:
```bash
python test_ws_fixes.py
```

### Manual Testing Steps

1. **Start ASGI Server:**
   ```bash
   cd Backend
   python run_asgi_dev.py
   ```

2. **Verify Health Endpoint:**
   - Visit: `http://localhost:8001/health/ws/`
   - Should show ASGI configuration details

3. **Test Channel Layer:**
   ```bash
   cd Backend
   python manage.py ws_health
   ```
   - Should output: "Channel layer OK"

4. **Test Admin WebSocket:**
   - Open admin panel
   - Check browser console for "Admin WS OPEN"
   - Should see connection status in UI

5. **Test Customer WebSocket:**
   - Open storefront chat modal
   - Check browser console for "Customer WS OPEN"
   - Should see "Real-time Connected" status

### Environment Variables

For production or custom deployments, set:
```bash
VITE_WS_BASE=wss://your-domain.com
```

## Error Code Reference

| Code | Meaning | Action |
|------|---------|--------|
| 4401 | Unauthorized (invalid/missing JWT) | Re-authenticate |
| 4403 | Forbidden (non-admin user) | Check user permissions |
| 1011 | Server error (Redis/routing failure) | Check server logs |
| 1006 | Generic connection failure | Check network/proxy |

## Production Considerations

### Nginx Configuration
Ensure WebSocket upgrade headers:
```nginx
location /ws/ {
    proxy_pass         http://your_asgi_upstream;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host $host;
    proxy_read_timeout 300s;
}
```

### Redis Configuration
For production, replace InMemoryChannelLayer with Redis:
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
```

### Security Settings
Before production, update:
```python
ALLOWED_HOSTS = ["your-domain.com"]  # Remove wildcard
SECURE_SSL_REDIRECT = True  # Enable HTTPS redirect
```

## Troubleshooting

### Common Issues

1. **Still getting 1006 errors:**
   - Check if ASGI server is running (not WSGI)
   - Verify WebSocket URL in browser dev tools
   - Check for mixed content errors (HTTPS page → ws://)

2. **Admin authentication fails:**
   - Verify JWT token in localStorage
   - Check token format (no "Bearer " prefix)
   - Ensure token is access token, not refresh token

3. **Customer connections fail:**
   - Check Redis/channel layer health
   - Verify room ID format
   - Check server logs for specific error codes

### Debug Commands

```bash
# Check ASGI application
python Backend/manage.py shell
>>> from core.asgi import application
>>> print(application)

# Test channel layer
python Backend/manage.py ws_health

# Check WebSocket routes
python Backend/manage.py shell
>>> from core.asgi import websocket_urlpatterns
>>> print(websocket_urlpatterns)
```

## Files Modified

### Backend
- `Backend/core/views_health.py` (new)
- `Backend/core/urls.py`
- `Backend/adminpanel/consumers.py`
- `Backend/core/settings.py`
- `Backend/core/management/commands/ws_health.py` (new)
- `Backend/run_asgi_dev.py` (new)

### Frontend
- `Frontend/src/lib/wsUrl.ts` (new)
- `Frontend/src/store/chatApiStore.js`

### Testing
- `test_ws_fixes.py` (new)
- `WEBSOCKET_FIXES_README.md` (this file)

## Commit Message

```
fix(ws): resolve 1006 by normalizing WS URL/protocol, adding diagnostics, and ensuring ASGI+proxy+Redis health

- Add ws health endpoint and channel layer ping command
- Instrument consumers with OPEN/close logging and 1011 on server errors
- Build WS URLs from page origin (auto wss on HTTPS) with optional VITE_WS_BASE
- Remove hardcoded :8001 unless explicitly configured
- Ensure ASGI (uvicorn) serves WS; ALLOWED_HOSTS/SSL redirects sane for dev
- Confirm Nginx/Cloudflare WS upgrade headers
```

This comprehensive fix addresses the root causes of WebSocket connection failures and provides clear diagnostics for future troubleshooting.
