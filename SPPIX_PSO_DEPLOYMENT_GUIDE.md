# SPPIX Deployment Guide - PSO Compatible

## Overview

This guide deploys your SPPIX e-commerce application while preserving your existing PSO project on port 80. The setup uses hostname-based routing to avoid port conflicts.

## Current DNS Configuration

Your DNS records are correctly configured:
- `sppix.com` → `90.249.95.206` (1 hour TTL)
- `www.sppix.com` → `90.249.95.206` (1 hour TTL)
- `pso` → `90.249.95.206` (30 min TTL) - **Preserved on port 80**

## Architecture

```
Port 80/443: Nginx (Reverse Proxy)
├── sppix.com → SPPIX Django (port 82)
├── www.sppix.com → SPPIX Django (port 82)
├── 90.249.95.206 (Host: sppix.com) → SPPIX Django (port 82)
└── 90.249.95.206 (Host: pso) → PSO Application (port 80)

Port 82: SPPIX Django Backend
Port 83: SPPIX ASGI (WebSocket)
```

## Deployment Steps

### 1. Upload Files to Server

Upload your project files to the server at `/opt/sppix-store/`:

```bash
# On your local machine
scp -r . user@90.249.95.206:/tmp/sppix-store/
```

### 2. Run Deployment Script

SSH into your server and run the deployment script:

```bash
# SSH into server
ssh user@90.249.95.206

# Navigate to project directory
cd /tmp/sppix-store/

# Make script executable
chmod +x deploy_sppix_pso_compatible.sh

# Run deployment
./deploy_sppix_pso_compatible.sh
```

### 3. Verify Deployment

After deployment, verify everything is working:

```bash
# Check services
sudo systemctl status sppix-django sppix-asgi nginx

# Check ports
sudo netstat -tlnp | grep -E ":(80|82|83|443)"

# Test SPPIX
curl -I https://sppix.com
curl -I http://90.249.95.206

# Test PSO (should still work)
curl -I http://90.249.95.206
```

## Access URLs

### SPPIX Application
- **Main Store**: https://sppix.com
- **WWW**: https://www.sppix.com
- **Direct IP**: http://90.249.95.206 (when Host header is sppix.com)
- **Admin Panel**: https://sppix.com/admin/
- **API**: https://sppix.com/api/

### PSO Application
- **Direct IP**: http://90.249.95.206 (when Host header is pso)
- **Port 80**: Preserved and functional

## How Hostname Routing Works

The Nginx configuration uses the `Host` header to determine which application to serve:

1. **sppix.com** or **www.sppix.com** → SPPIX application
2. **90.249.95.206** with Host: sppix.com → SPPIX application
3. **90.249.95.206** with Host: pso → PSO application (default behavior)

## Configuration Files

### Nginx Configuration
- **File**: `/etc/nginx/sites-available/sppix`
- **Backup**: `/etc/nginx/sites-available/default.backup`

### Systemd Services
- **Django**: `/etc/systemd/system/sppix-django.service`
- **ASGI**: `/etc/systemd/system/sppix-asgi.service`

### Project Structure
```
/opt/sppix-store/
├── Backend/
│   ├── venv/
│   ├── manage.py
│   ├── .env
│   └── ...
├── Frontend/
│   ├── dist/
│   │   ├── storefront/
│   │   └── admin/
│   └── ...
└── ...
```

## Management Commands

### Service Management
```bash
# Start services
sudo systemctl start sppix-django sppix-asgi nginx

# Stop services
sudo systemctl stop sppix-django sppix-asgi nginx

# Restart services
sudo systemctl restart sppix-django sppix-asgi nginx

# Check status
sudo systemctl status sppix-django sppix-asgi nginx
```

### Logs
```bash
# Django logs
sudo journalctl -u sppix-django -f

# ASGI logs
sudo journalctl -u sppix-asgi -f

# Nginx logs
sudo tail -f /var/log/nginx/sppix_access.log
sudo tail -f /var/log/nginx/sppix_error.log
```

### Database
```bash
# Django migrations
cd /opt/sppix-store/Backend
sudo -u sppix venv/bin/python manage.py migrate

# Create superuser
sudo -u sppix venv/bin/python manage.py createsuperuser

# Collect static files
sudo -u sppix venv/bin/python manage.py collectstatic --noinput
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using port 80
sudo netstat -tlnp | grep :80

# Check what's using port 82
sudo netstat -tlnp | grep :82

# Check what's using port 83
sudo netstat -tlnp | grep :83
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### SSL Certificate Issues
```bash
# Check SSL certificates
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test SSL
openssl s_client -connect sppix.com:443
```

### Database Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Connect to database
mysql -u electro_user -p electro_store

# Check Django database connection
cd /opt/sppix-store/Backend
sudo -u sppix venv/bin/python manage.py dbshell
```

## Security Considerations

1. **Firewall**: Only necessary ports are open (80, 443, 82, 83)
2. **SSL**: HTTPS is enforced for sppix.com and www.sppix.com
3. **Rate Limiting**: API endpoints have rate limiting enabled
4. **Security Headers**: Comprehensive security headers are set
5. **File Permissions**: Proper file permissions are set

## Backup and Recovery

### Backup
```bash
# Backup database
mysqldump -u electro_user -p electro_store > backup_$(date +%Y%m%d).sql

# Backup project files
tar -czf sppix_backup_$(date +%Y%m%d).tar.gz /opt/sppix-store/

# Backup Nginx configuration
sudo cp /etc/nginx/sites-available/sppix /opt/sppix-store/backup/
```

### Recovery
```bash
# Restore database
mysql -u electro_user -p electro_store < backup_20241201.sql

# Restore project files
tar -xzf sppix_backup_20241201.tar.gz -C /

# Restore Nginx configuration
sudo cp /opt/sppix-store/backup/sppix /etc/nginx/sites-available/
sudo systemctl reload nginx
```

## Monitoring

### Health Checks
```bash
# Check SPPIX health
curl -f https://sppix.com/health/ || echo "SPPIX is down"

# Check PSO health
curl -f http://90.249.95.206 || echo "PSO is down"

# Check database
mysql -u electro_user -p -e "SELECT 1" electro_store
```

### Performance Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
ss -tuln
```

## Updates and Maintenance

### Update SPPIX
```bash
# Pull latest changes
cd /opt/sppix-store
git pull origin main

# Update dependencies
cd Backend
sudo -u sppix venv/bin/pip install -r requirements.txt

cd ../Frontend
sudo -u sppix npm install
sudo -u sppix npm run build:both

# Run migrations
cd ../Backend
sudo -u sppix venv/bin/python manage.py migrate

# Restart services
sudo systemctl restart sppix-django sppix-asgi nginx
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Renew certificates
sudo certbot renew

# Restart Nginx
sudo systemctl restart nginx
```

## Support

If you encounter any issues:

1. Check the logs first
2. Verify service status
3. Test network connectivity
4. Check DNS resolution
5. Verify SSL certificates

## Success Indicators

After successful deployment, you should see:

- ✅ SPPIX accessible at https://sppix.com
- ✅ PSO still accessible at http://90.249.95.206
- ✅ Both applications running simultaneously
- ✅ SSL certificates working
- ✅ All services running without conflicts

Your SPPIX e-commerce store is now live and ready for business! 🚀




