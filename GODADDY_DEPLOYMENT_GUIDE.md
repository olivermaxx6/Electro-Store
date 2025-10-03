# SPPIX GoDaddy Deployment Guide

## 🚀 Complete Deployment Guide for GoDaddy VPS

This guide will help you deploy your SPPIX project live on your GoDaddy VPS with domain `sppix.com` and IP `90.249.95.206`.

## 📋 Prerequisites

1. **GoDaddy VPS Access**: SSH access to your VPS
2. **Domain Configuration**: DNS records pointing to your VPS IP
3. **Root/Sudo Access**: Administrative privileges on the VPS

## 🔧 Quick Deployment (Automated)

### Option 1: Complete Automated Deployment

```bash
# Make the script executable
chmod +x deploy_complete.sh

# Run the complete deployment
./deploy_complete.sh
```

This will automatically:
- ✅ Install all required packages
- ✅ Set up MySQL database
- ✅ Configure Nginx with SSL
- ✅ Deploy Django application
- ✅ Set up systemd services
- ✅ Configure firewall
- ✅ Set up automated backups

## 🛠️ Manual Step-by-Step Deployment

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip nginx mysql-server mysql-client redis-server git curl wget unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release certbot python3-certbot-nginx supervisor htop nano ufw

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 2: Database Setup

```bash
# Run database setup script
chmod +x setup_database.sh
sudo ./setup_database.sh
```

### Step 3: Deploy Application

```bash
# Run main deployment script
chmod +x deploy_to_godaddy.sh
./deploy_to_godaddy.sh
```

### Step 4: SSL Certificate Setup

```bash
# Run SSL setup script
chmod +x setup_ssl.sh
sudo ./setup_ssl.sh
```

### Step 5: Final Configuration

```bash
# Copy Nginx configuration
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Copy systemd services
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/
sudo systemctl daemon-reload

# Start services
sudo systemctl enable mysql redis-server nginx sppix-django sppix-asgi
sudo systemctl start mysql redis-server nginx sppix-django sppix-asgi
```

## 🔍 Verification

### Check Service Status

```bash
# Check all services
sudo systemctl status sppix-django sppix-asgi nginx mysql redis-server

# Check ports
netstat -tlnp | grep -E ":(80|443|8001|8002) "

# Test website
curl -I https://sppix.com
```

### Access Your Store

- **Main Store**: https://sppix.com
- **Admin Panel**: https://sppix.com/admin/
- **API Endpoint**: https://sppix.com/api/

## 🔑 Admin Credentials

- **Username**: `admin`
- **Email**: `admin@sppix.com`
- **Password**: `SppixAdmin2024!`

## 🛠️ Management Commands

### Service Management

```bash
# Check status
sudo /opt/sppix_status.sh

# Restart services
sudo /opt/sppix_restart.sh

# View logs
sudo /opt/sppix_logs.sh
```

### Updates and Maintenance

```bash
# Update application
sudo /opt/update_sppix.sh

# Backup database
sudo /opt/backup_database.sh

# Backup application
sudo /opt/backup_sppix.sh

# Check SSL certificate
sudo /opt/check_ssl.sh
```

### Database Management

```bash
# Monitor database
sudo /opt/monitor_database.sh

# Connect to database
mysql -u sppix_user -p'SppixStore2024!' sppix_store

# Restore database
sudo /opt/restore_database.sh <backup_file.sql.gz>
```

## 🔒 Security Features

- ✅ **SSL/HTTPS**: Automatic Let's Encrypt certificates
- ✅ **Firewall**: UFW configured with minimal open ports
- ✅ **Rate Limiting**: API and login rate limiting
- ✅ **Security Headers**: XSS, CSRF, and other security headers
- ✅ **User Isolation**: Dedicated service user
- ✅ **File Permissions**: Proper file ownership and permissions

## 📊 Monitoring

### Log Files

- **Django Logs**: `/opt/sppix-store/Backend/logs/django.log`
- **Nginx Logs**: `/var/log/nginx/sppix_access.log`, `/var/log/nginx/sppix_error.log`
- **System Logs**: `journalctl -u sppix-django`, `journalctl -u sppix-asgi`

### Automated Backups

- **Database**: Daily at 3:00 AM
- **Application**: Daily at 2:00 AM
- **Retention**: 7 days

## 🚨 Troubleshooting

### Common Issues

1. **Service Not Starting**
   ```bash
   sudo systemctl status sppix-django
   sudo journalctl -u sppix-django -f
   ```

2. **SSL Certificate Issues**
   ```bash
   sudo certbot renew --dry-run
   sudo /opt/check_ssl.sh
   ```

3. **Database Connection Issues**
   ```bash
   sudo /opt/monitor_database.sh
   mysql -u sppix_user -p'SppixStore2024!' sppix_store
   ```

4. **Nginx Configuration Issues**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Performance Optimization

1. **Enable Redis Caching** (if needed)
2. **Configure CDN** for static files
3. **Database Optimization** based on usage
4. **Load Balancing** for high traffic

## 📞 Support

If you encounter any issues:

1. Check the logs: `sudo /opt/sppix_logs.sh`
2. Check service status: `sudo /opt/sppix_status.sh`
3. Review this guide for troubleshooting steps
4. Check the deployment scripts for detailed error messages

## 🎉 Success!

Once deployed, your SPPIX store will be live at:
- **https://sppix.com** - Main storefront
- **https://www.sppix.com** - WWW subdomain
- **https://90.249.95.206** - Direct IP access

Your e-commerce store is now ready for business! 🚀
