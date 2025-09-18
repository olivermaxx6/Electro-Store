# Backend Setup

## Prerequisites
- Python 3.11+
- Virtual environment

## Setup Commands

```bash
# Create and activate virtual environment
python -m venv .venv
. .venv/Scripts/activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed admin user
python manage.py seed_admin

# Start development server
# Windows PowerShell:
scripts/run_django_dev.ps1

# Or directly with Python:
python scripts/run_django_dev.py

# Or with environment variables:
$env:DJANGO_DEV_HOST = "127.0.0.1"
$env:DJANGO_DEV_PORT = "8001"
python scripts/run_django_dev.py
```

## Dev Setup

- **Django**: Run dev server on `127.0.0.1:8001`
- **Frontend Admin (5174)** and **Storefront (5173)** both proxy `/api` → `127.0.0.1:8001`
- **Note**: Splunk may occupy port 8000; Django runs on 8001 in dev to avoid conflicts

### Port Policy

**Django must never run on port 8000 in development.** See [docs/dev/port-policy.md](docs/dev/port-policy.md) for detailed information about how this is enforced and troubleshooting guidance.

The API will be available at http://127.0.0.1:8001

Default admin credentials: `admin` / `admin123`

## Quick Verification

### Backend
```bash
# LISTEN on 127.0.0.1:8001 should be Python
netstat -ano | findstr :8001

# direct API (bypasses Vite)
curl -i http://127.0.0.1:8001/api/public/health/
```

### Admin (5174) via proxy
```bash
curl -i http://localhost:5174/api/public/health/
```

### Storefront (5173) via proxy
```bash
curl -i http://localhost:5173/api/public/health/
```

### Browser console (credentials path)
```javascript
await fetch('/api/public/health/', { credentials: 'include' }).then(r => r.json())
```
