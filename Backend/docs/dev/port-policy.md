# Django Development Port Policy

## Policy Statement

**Django must never run on port 8000 in development. The development port is 127.0.0.1:8001.**

This policy ensures consistency across the development environment and prevents conflicts with other services that may use port 8000.

## How It's Enforced

### 1. Hard Guard in manage.py
The `manage.py` file automatically redirects any attempt to use port 8000 to port 8001:

```python
# Dev-only guard: rewrite or block port 8000 for runserver
if "runserver" in sys.argv:
    # If no addr:port was given, append the correct one
    if sys.argv[-1] == "runserver":
        sys.argv.append("127.0.0.1:8001")
    else:
        # Normalize last/next arg if it's :8000 or 8000
        for i, a in enumerate(sys.argv):
            if a.endswith(":8000") or a == "8000":
                sys.argv[i] = a.replace(":8000", ":8001") if ":" in a else "8001"
```

### 2. Custom Runserver Command
The `adminpanel` app provides a custom `runserver` command that:
- Defaults to `127.0.0.1:8001`
- Explicitly rejects port 8000 with a clear error message
- Overrides Django's default behavior

### 3. Custom Devserver Command
An alternative `devserver` command is available that also defaults to `127.0.0.1:8001`.

## How to Run Django

### Recommended Methods

1. **Using the standardized script:**
   ```bash
   python scripts/run_django_dev.py
   ```

2. **Using PowerShell script:**
   ```powershell
   scripts\run_django_dev.ps1
   ```

3. **Using custom runserver command:**
   ```bash
   python manage.py runserver
   # or explicitly
   python manage.py runserver 127.0.0.1:8001
   ```

4. **Using custom devserver command:**
   ```bash
   python manage.py devserver
   # or explicitly
   python manage.py devserver 127.0.0.1:8001
   ```

### Environment Variables

You can override the default host and port using environment variables:

```bash
export DJANGO_DEV_HOST="127.0.0.1"
export DJANGO_DEV_PORT="8001"
python scripts/run_django_dev.py
```

## Frontend Configuration

All Vite configurations are set up to proxy API requests to `http://127.0.0.1:8001`:

- **Admin Panel (Port 5174):** `vite.admin.config.js`
- **Storefront (Port 5173):** `vite.storefront.config.js`
- **Main Config:** `vite.config.js`

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:

1. **Check what's using port 8000:**
   ```bash
   netstat -ano | findstr :8000
   ```

2. **Check what's using port 8001:**
   ```bash
   netstat -ano | findstr :8001
   ```

3. **Kill processes if needed:**
   ```bash
   # Find the PID from netstat output, then:
   taskkill /PID <PID> /F
   ```

### Common Issues

1. **Splunk using port 8000:** Splunk often uses port 8000 by default. Our policy prevents Django from conflicting with it.

2. **Other development servers:** If you have other Django projects or web servers using port 8000, they won't conflict with this project.

3. **Docker/WSL considerations:** The scripts support binding to `0.0.0.0:8001` for Docker/WSL environments while maintaining the port policy.

### Health Checks

Verify the setup is working:

```bash
# Direct Django health check
curl -i http://127.0.0.1:8001/api/public/health/

# Admin panel proxy health check
curl -i http://localhost:5174/api/public/health/

# Storefront proxy health check
curl -i http://localhost:5173/api/public/health/
```

All should return `{"status":"ok"}`.

## Production Notes

This policy applies only to development environments. Production deployments use their own port configuration and are not affected by these restrictions.

## Enforcement History

This policy was implemented to:
- Prevent conflicts with Splunk and other services using port 8000
- Ensure consistent development environment setup
- Provide clear error messages when incorrect ports are used
- Maintain compatibility with existing tooling while enforcing the policy
