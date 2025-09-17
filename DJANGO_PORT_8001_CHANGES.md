# Django Port 8001 Configuration Changes

This document summarizes all changes made to ensure Django always runs on port 8001 instead of 8000.

## Files Modified

### 1. Frontend Vite Configuration Files
**Fixed proxy targets from port 8000 to 8001:**

- `Frontend/vite.config.js`
- `Frontend/vite.admin.config.js` 
- `Frontend/vite.storefront.config.js`

**Changes made:**
```javascript
// Before
target: 'http://127.0.0.1:8000'

// After  
target: 'http://127.0.0.1:8001'
```

### 2. Project Launch Scripts
**Fixed port references:**

- `run_project.ps1` - Updated process termination to target port 8001 instead of 8000

**Changes made:**
```powershell
# Before
Get-NetTCPConnection -LocalPort 8000

# After
Get-NetTCPConnection -LocalPort 8001
```

### 3. Django Custom Management Command
**Created new file:**

- `Backend/adminpanel/management/commands/devserver.py`

**Content:**
```python
from django.core.management.commands.runserver import Command as RunserverCommand

class Command(RunserverCommand):
    """
    Custom Django development server command that defaults to 127.0.0.1:8001
    """
    default_addr = "127.0.0.1"
    default_port = "8001"
    
    def add_arguments(self, parser):
        super().add_arguments(parser)
        # Override the default address and port
        parser.set_defaults(addrport=f"{self.default_addr}:{self.default_port}")
```

### 4. Django Development Scripts
**Updated to use custom devserver command:**

- `Backend/scripts/run_django_dev.py`

**Changes made:**
```python
# Before
subprocess.check_call([sys.executable, "manage.py", "runserver", addr])

# After
subprocess.check_call([sys.executable, "manage.py", "devserver"])
```

## Files Already Correctly Configured

These files were already using port 8001 correctly:

- `Backend/dev.ps1` - Uses `0.0.0.0:8001`
- `Backend/dev.sh` - Uses `0.0.0.0:8001` 
- `start_project.ps1` - Uses `127.0.0.1:8001`
- `Backend/core/settings.py` - CORS/CSRF configured for port 8001

## Verification Commands

To verify Django is running on port 8001:

```powershell
# Check if Django is listening on port 8001
netstat -ano | findstr :8001

# Test health endpoint
Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/public/health/" -Method GET

# Start Django with custom devserver command
cd Backend
python manage.py devserver
```

## Launch Options

All these methods now start Django on port 8001:

```powershell
# Option 1: Main project launcher
.\run_project.ps1

# Option 2: Quick start script
.\start_project.ps1

# Option 3: Manual Django start
cd Backend
python manage.py devserver  # Defaults to 127.0.0.1:8001
python manage.py runserver 127.0.0.1:8001  # Explicit port
```

## Frontend Proxy Configuration

All Vite configurations now proxy to port 8001:

- **Storefront (port 5173):** `/api` → `http://127.0.0.1:8001`
- **Admin Panel (port 5174):** `/api` → `http://127.0.0.1:8001`

## Health Endpoint

Django health endpoint available at:
- `http://127.0.0.1:8001/api/public/health/`
- Returns: `{"status": "ok"}`

## Summary

✅ Django now runs exclusively on port 8001 (never 8000)
✅ All Vite proxies point to port 8001
✅ All launch scripts use port 8001
✅ Custom devserver command defaults to port 8001
✅ CORS/CSRF settings configured for port 8001
✅ Health endpoint verified working

The configuration is now consistent across all components and ensures Django always runs on port 8001.
