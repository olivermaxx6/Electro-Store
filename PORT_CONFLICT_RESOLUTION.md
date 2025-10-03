# Port Conflict Resolution Guide

## Current Situation

You have the following DNS records:
- `sppix.com` → `90.249.95.206` (1 hour TTL)
- `www.sppix.com` → `90.249.95.206` (1 hour TTL)  
- `pso` → `90.249.95.206` (30 min TTL) - **CONFLICTING with port 80**

## The Problem

Both your SPPIX application and PSO project are trying to use port 80, which creates a conflict. Only one service can listen on port 80 at a time.

## Solution Options

### Option 1: Move PSO to Different Port (Recommended)

**Steps:**
1. Change PSO to use port 8080 instead of port 80
2. Update PSO's configuration to listen on port 8080
3. Access PSO via `http://90.249.95.206:8080` or `http://pso:8080`

**Benefits:**
- ✅ SPPIX gets full port 80/443 access
- ✅ Both applications can run simultaneously
- ✅ Clean separation of services

### Option 2: Use Different Subdomain for PSO

**Steps:**
1. Create a new DNS record: `pso.yourdomain.com` → `90.249.95.206`
2. Configure Nginx to route based on subdomain
3. Move PSO to port 8080
4. Access PSO via `http://pso.yourdomain.com:8080`

**Benefits:**
- ✅ Professional subdomain structure
- ✅ Better organization
- ✅ No port conflicts

### Option 3: Use Nginx Reverse Proxy for Both

**Steps:**
1. Configure Nginx to handle both domains
2. Route `sppix.com` to SPPIX application
3. Route `pso` to PSO application (on different port)
4. Both applications run on different internal ports

**Nginx Configuration Example:**
```nginx
# SPPIX application
server {
    listen 80;
    server_name sppix.com www.sppix.com;
    
    location / {
        proxy_pass http://127.0.0.1:82;  # SPPIX Django
    }
}

# PSO application
server {
    listen 80;
    server_name pso;
    
    location / {
        proxy_pass http://127.0.0.1:8080;  # PSO application
    }
}
```

## Recommended Implementation

I recommend **Option 1** for simplicity:

### Step 1: Stop PSO Application
```bash
# Find and stop PSO process on port 80
sudo netstat -tlnp | grep :80
sudo kill <process_id>
```

### Step 2: Update PSO Configuration
Change PSO to listen on port 8080 instead of port 80.

### Step 3: Start PSO on New Port
```bash
# Start PSO on port 8080
./start_pso.sh  # or however you start PSO
```

### Step 4: Deploy SPPIX
```bash
# Run the deployment script
./deploy_with_dns.sh
```

### Step 5: Test Both Applications
- SPPIX: `https://sppix.com` or `http://90.249.95.206`
- PSO: `http://90.249.95.206:8080`

## Verification Commands

```bash
# Check what's running on port 80
sudo netstat -tlnp | grep :80

# Check what's running on port 8080
sudo netstat -tlnp | grep :8080

# Test SPPIX
curl -I https://sppix.com
curl -I http://90.249.95.206

# Test PSO
curl -I http://90.249.95.206:8080
```

## DNS Record Updates (if needed)

If you choose Option 2, update your DNS:
```
# Current
pso → 90.249.95.206

# New (if using subdomain)
pso.yourdomain.com → 90.249.95.206
```

## Troubleshooting

### Port 80 Still in Use
```bash
# Find what's using port 80
sudo lsof -i :80
sudo netstat -tlnp | grep :80

# Kill the process
sudo kill <process_id>
```

### Nginx Configuration Issues
```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### SSL Certificate Issues
```bash
# Check SSL certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

## Final Configuration

After resolving the conflict, your setup should be:

```
Port 80/443: Nginx (reverse proxy)
├── sppix.com → SPPIX Django (port 82)
├── www.sppix.com → SPPIX Django (port 82)
└── 90.249.95.206 → SPPIX Django (port 82)

Port 8080: PSO Application
└── 90.249.95.206:8080 → PSO Application
```

This configuration allows both applications to run simultaneously without conflicts.




