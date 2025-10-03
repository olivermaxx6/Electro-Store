# Electro-Store GoDaddy VPS Deployment Guide

This comprehensive guide will walk you through deploying the Electro-Store e-commerce platform on a GoDaddy VPS (Virtual Private Server). This guide covers everything from initial server setup to production deployment with SSL certificates.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GoDaddy VPS Setup](#godaddy-vps-setup)
3. [Initial Server Configuration](#initial-server-configuration)
4. [Database Setup (MySQL)](#database-setup-mysql)
5. [Python Environment Setup](#python-environment-setup)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Web Server Configuration (Nginx)](#web-server-configuration-nginx)
9. [SSL Certificate Setup](#ssl-certificate-setup)
10. [Production Configuration](#production-configuration)
11. [Security Hardening](#security-hardening)
12. [Monitoring and Maintenance](#monitoring-and-maintenance)
13. [Troubleshooting](#troubleshooting)
14. [Performance Optimization](#performance-optimization)

## Prerequisites

### GoDaddy VPS Requirements

- **VPS Plan**: At least 2GB RAM, 2 CPU cores, 40GB storage
- **Operating System**: Ubuntu 20.04 LTS or Ubuntu 22.04 LTS (recommended)
- **Domain Name**: Registered with GoDaddy (optional but recommended)
- **SSH Access**: Enabled on your VPS

### Software Requirements

- **Python**: 3.9+ (will be installed)
- **Node.js**: 18+ (will be installed)
- **MySQL**: 8.0+ (will be installed)
- **Nginx**: Latest stable version (will be installed)
- **Git**: For cloning the repository

### Domain Configuration (Optional)

If you have a domain name:
1. Point your domain's A record to your VPS IP address
2. Ensure DNS propagation is complete (can take 24-48 hours)

## GoDaddy VPS Setup

### 1. Access Your VPS

1. **Log into GoDaddy Account**:
   - Go to [GoDaddy.com](https://godaddy.com)
   - Sign in to your account
   - Navigate to "My Products" → "VPS"

2. **Get VPS Details**:
   - Note your VPS IP address
   - Note your root password (or SSH key details)
   - Ensure your VPS is running

3. **Connect via SSH**:
   ```bash
   # Using password authentication
   ssh root@YOUR_VPS_IP
   
   # Using SSH key (if configured)
   ssh -i your-key.pem root@YOUR_VPS_IP
   ```

### 2. Initial VPS Configuration

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git vim unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release htop

# Set timezone (optional)
timedatectl set-timezone America/New_York  # Replace with your timezone

# Configure hostname (optional)
hostnamectl set-hostname electro-store-server
```

## Initial Server Configuration

### 1. Create Application User

```bash
# Create a dedicated user for the application
adduser --system --group --shell /bin/bash electrostore
usermod -aG sudo electrostore

# Switch to the application user
su - electrostore
```

### 2. Set Up SSH Key Authentication (Recommended)

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy your public key to the server
ssh-copy-id electrostore@YOUR_VPS_IP

# Test SSH connection
ssh electrostore@YOUR_VPS_IP
```

### 3. Configure Firewall

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

### 4. Set Up Project Directory

```bash
# Create project directory
sudo mkdir -p /opt/electro-store
sudo chown electrostore:electrostore /opt/electro-store
cd /opt/electro-store

# Clone the repository (replace with your actual repository URL)
git clone https://github.com/your-username/electro-store.git .

# Verify the clone
ls -la
```

## Database Setup (MySQL)

### 1. Install MySQL Server

```bash
# Install MySQL server
sudo apt install -y mysql-server mysql-client

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

**During MySQL secure installation, choose:**
- Set root password: **Yes** (choose a strong password)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### 2. Configure MySQL Database

```bash
# Login to MySQL as root
sudo mysql -u root -p

# Create database and user
CREATE DATABASE electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!';
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Optimize MySQL for Production

```bash
# Edit MySQL configuration
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add/modify these settings:

```ini
[mysqld]
# Basic settings
bind-address = 127.0.0.1
port = 3306

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance settings (adjust based on your VPS specs)
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Connection settings
max_connections = 200
max_connect_errors = 1000

# Query cache
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Security
local_infile = 0
```

```bash
# Restart MySQL
sudo systemctl restart mysql

# Test MySQL connection
mysql -u electro_user -p'ElectroStore2024!' -h localhost electro_store
```

## Python Environment Setup

### 1. Install Python and Dependencies

```bash
# Install Python 3.9+ and pip
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Install additional system dependencies
sudo apt install -y build-essential libssl-dev libffi-dev libmysqlclient-dev pkg-config

# Verify Python installation
python3 --version
pip3 --version
```

### 2. Create Virtual Environment

```bash
# Navigate to backend directory
cd /opt/electro-store/Backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel
```

### 3. Install Python Dependencies

```bash
# Install requirements
pip install -r requirements.txt

# Install additional production dependencies
pip install gunicorn supervisor
```

## Backend Deployment

### 1. Environment Configuration

```bash
# Create production environment file
cp env.example .env
vim .env
```

Configure the `.env` file:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here-generate-a-new-one
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,YOUR_VPS_IP

# Database Configuration
DATABASE_URL=mysql://electro_user:ElectroStore2024!@localhost:3306/electro_store

# Admin User Configuration
ADMIN_USER=admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASS=your-secure-admin-password

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Stripe Configuration - LIVE KEYS
STRIPE_PUBLISHABLE_KEY=pk_live_51S9uLKEWDiIf4tSOX9zbIjLue5hh3oqUUkt6yTekNDg6wJ7bF4BlfUSREciifffNH4lfbuXPuIyRBCZs2pazIPxj00ZTkmPTT8
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# Media Files
MEDIA_URL=/media/
MEDIA_ROOT=/opt/electro-store/Backend/media/

# Static Files
STATIC_URL=/static/
STATIC_ROOT=/opt/electro-store/Backend/staticfiles/
```

### 2. Django Production Settings

```bash
# Create production settings file
cp core/settings.py core/settings_production.py
vim core/settings_production.py
```

Key production settings to modify:

```python
# Security settings
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com', 'YOUR_VPS_IP']

# Database settings (already configured in .env)
# Static files
STATIC_ROOT = '/opt/electro-store/Backend/staticfiles'
MEDIA_ROOT = '/opt/electro-store/Backend/media'

# Security headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS settings
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/opt/electro-store/logs/django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}
```

### 3. Database Migration and Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create logs directory
mkdir -p /opt/electro-store/logs
sudo chown electrostore:electrostore /opt/electro-store/logs
```

### 4. Gunicorn Configuration

```bash
# Create Gunicorn configuration file
vim gunicorn.conf.py
```

```python
# Gunicorn configuration
bind = "127.0.0.1:8001"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
user = "electrostore"
group = "electrostore"
tmp_upload_dir = None
errorlog = "/opt/electro-store/logs/gunicorn_error.log"
accesslog = "/opt/electro-store/logs/gunicorn_access.log"
loglevel = "info"
```

### 5. Systemd Service Configuration

```bash
# Create systemd service file
sudo vim /etc/systemd/system/electro-store.service
```

```ini
[Unit]
Description=Electro Store Django Application
After=network.target mysql.service

[Service]
Type=notify
User=electrostore
Group=electrostore
WorkingDirectory=/opt/electro-store/Backend
Environment=PATH=/opt/electro-store/Backend/venv/bin
ExecStart=/opt/electro-store/Backend/venv/bin/gunicorn --config gunicorn.conf.py core.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable electro-store
sudo systemctl start electro-store
sudo systemctl status electro-store
```

## Frontend Deployment

### 1. Install Node.js

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Build Frontend Applications

```bash
# Navigate to frontend directory
cd /opt/electro-store/Frontend

# Install dependencies
npm install

# Create production environment file
cp env.example .env.production
vim .env.production
```

Configure the `.env.production` file:

```bash
# API Configuration
VITE_API_BASE_URL=https://yourdomain.com
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Electro Store
VITE_APP_VERSION=1.0.0

# Development Settings
VITE_DEV_MODE=false
VITE_DEBUG=false

# Stripe Configuration - LIVE KEYS
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51S9uLKEWDiIf4tSOX9zbIjLue5hh3oqUUkt6yTekNDg6wJ7bF4BlfUSREciifffNH4lfbuXPuIyRBCZs2pazIPxj00ZTkmPTT8

# Google Analytics (Optional)
VITE_GA_TRACKING_ID=your-ga-tracking-id

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_WISHLIST=true

# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

```bash
# Build storefront
npm run build:storefront

# Build admin panel
npm run build:admin

# Verify builds
ls -la dist-storefront/
ls -la dist-admin/
```

## Web Server Configuration (Nginx)

### 1. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configure Nginx

```bash
# Create Nginx configuration
sudo vim /etc/nginx/sites-available/electro-store
```

```nginx
# Upstream configuration
upstream django_backend {
    server 127.0.0.1:8001;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be configured later)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client max body size
    client_max_body_size 20M;

    # Static files
    location /static/ {
        alias /opt/electro-store/Backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /opt/electro-store/Backend/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Storefront (main application)
    location / {
        root /opt/electro-store/Frontend/dist-storefront;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # Admin panel
    location /admin/ {
        root /opt/electro-store/Frontend/dist-admin;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # API endpoints
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://django_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin
    location /django-admin/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/electro-store /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Obtain certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 3. Set Up Automatic Renewal

```bash
# Add to crontab
sudo crontab -e
```

Add this line:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Verify SSL Configuration

```bash
# Test SSL configuration
sudo nginx -t

# Check certificate status
sudo certbot certificates

# Restart services
sudo systemctl restart nginx
sudo systemctl restart electro-store
```

## Production Configuration

### 1. Redis Setup (Optional but Recommended)

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo vim /etc/redis/redis.conf
```

Key settings:
```conf
# Bind to localhost only
bind 127.0.0.1

# Set password
requirepass your-redis-password

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru
```

```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2. Log Rotation

```bash
# Configure log rotation
sudo vim /etc/logrotate.d/electro-store
```

```bash
/opt/electro-store/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 electrostore electrostore
    postrotate
        systemctl reload electro-store
    endscript
}
```

### 3. Backup Script

```bash
# Create backup script
sudo vim /opt/electro-store/backup.sh
```

```bash
#!/bin/bash

# Backup script for Electro Store
BACKUP_DIR="/opt/backups/electro-store"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/opt/electro-store"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u electro_user -p'ElectroStore2024!' electro_store > $BACKUP_DIR/database_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C $PROJECT_DIR/Backend media/

# Code backup (excluding venv and node_modules)
tar -czf $BACKUP_DIR/code_$DATE.tar.gz \
    --exclude='Backend/venv' \
    --exclude='Frontend/node_modules' \
    --exclude='Backend/media' \
    --exclude='Backend/staticfiles' \
    -C $PROJECT_DIR .

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /opt/electro-store/backup.sh

# Add to crontab
sudo crontab -e
```

Add this line:
```bash
0 2 * * * /opt/electro-store/backup.sh
```

## Security Hardening

### 1. SSH Security

```bash
# Edit SSH configuration
sudo vim /etc/ssh/sshd_config
```

Key settings:
```conf
# Disable root login
PermitRootLogin no

# Disable password authentication (use SSH keys)
PasswordAuthentication no

# Change SSH port (optional)
Port 2222

# Allow only specific users
AllowUsers electrostore

# Disable X11 forwarding
X11Forwarding no
```

```bash
# Restart SSH service
sudo systemctl restart ssh
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo vim /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
```

```bash
# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Additional Security Measures

```bash
# Install security updates
sudo apt update && sudo apt upgrade -y

# Configure automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Set up intrusion detection (optional)
sudo apt install -y aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
```

## Monitoring and Maintenance

### 1. System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop
```

### 2. Application Monitoring

```bash
# Check service status
sudo systemctl status electro-store
sudo systemctl status nginx
sudo systemctl status mysql

# Check logs
sudo journalctl -u electro-store -f
tail -f /opt/electro-store/logs/django.log
tail -f /opt/electro-store/logs/gunicorn_error.log
```

### 3. Performance Monitoring

```bash
# Monitor MySQL performance
sudo mysql -u root -p
```

```sql
-- Check slow queries
SHOW STATUS LIKE 'Slow_queries';

-- Check process list
SHOW PROCESSLIST;

-- Optimize tables
OPTIMIZE TABLE electro_store.*;
```

### 4. Regular Maintenance Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up old packages
sudo apt autoremove -y
sudo apt autoclean

# Check disk usage
df -h
du -sh /opt/electro-store/*

# Monitor log sizes
du -sh /opt/electro-store/logs/*
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Service Won't Start

```bash
# Check service status
sudo systemctl status electro-store

# Check logs
sudo journalctl -u electro-store -n 50

# Check configuration
sudo nginx -t
```

#### 2. Database Connection Issues

```bash
# Test MySQL connection
mysql -u electro_user -p'ElectroStore2024!' -h localhost electro_store

# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### 3. Static Files Not Loading

```bash
# Check file permissions
ls -la /opt/electro-store/Backend/staticfiles/

# Recollect static files
cd /opt/electro-store/Backend
source venv/bin/activate
python manage.py collectstatic --noinput
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

#### 5. Performance Issues

```bash
# Check system resources
htop
free -h
df -h

# Check MySQL performance
sudo mysql -u root -p
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Slow_queries';
```

### Log Locations

- **Django logs**: `/opt/electro-store/logs/django.log`
- **Gunicorn logs**: `/opt/electro-store/logs/gunicorn_*.log`
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **MySQL logs**: `/var/log/mysql/error.log`
- **System logs**: `/var/log/syslog`

### Useful Commands

```bash
# Restart services
sudo systemctl restart electro-store
sudo systemctl restart nginx
sudo systemctl restart mysql

# Check service status
sudo systemctl status electro-store nginx mysql

# View real-time logs
sudo journalctl -u electro-store -f
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
python manage.py check --deploy

# Database operations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## Performance Optimization

### 1. Database Optimization

```bash
# Optimize MySQL configuration
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add these performance settings:
```ini
# Performance tuning
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M
```

### 2. Nginx Optimization

```bash
# Edit Nginx configuration
sudo vim /etc/nginx/nginx.conf
```

Add these settings:
```nginx
# Worker processes
worker_processes auto;

# Worker connections
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# HTTP optimization
http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Client settings
    client_max_body_size 20M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Keepalive settings
    keepalive_timeout 65;
    keepalive_requests 100;
}
```

### 3. Application Optimization

```bash
# Install Redis for caching
sudo apt install -y redis-server

# Configure Django to use Redis
vim /opt/electro-store/Backend/core/settings.py
```

Add Redis configuration:
```python
# Redis configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall
- [ ] Configure SSL certificates
- [ ] Set up regular backups
- [ ] Enable log monitoring
- [ ] Update system packages regularly
- [ ] Configure fail2ban
- [ ] Set up intrusion detection
- [ ] Disable unnecessary services
- [ ] Configure SSH key authentication
- [ ] Set up monitoring alerts

## Conclusion

This guide provides a comprehensive deployment setup for the Electro-Store application on a GoDaddy VPS. The application should now be running securely in production with:

- Django backend served by Gunicorn
- React frontend applications (storefront and admin)
- MySQL database with optimized configuration
- Nginx reverse proxy with SSL
- Proper logging and monitoring
- Automated backups
- Security hardening

### Next Steps

1. **Test the deployment**: Visit your domain to ensure everything is working
2. **Set up monitoring**: Consider implementing more advanced monitoring solutions
3. **Configure CDN**: For better performance, consider using a CDN for static assets
4. **Set up staging environment**: Create a staging environment for testing updates
5. **Implement CI/CD**: Set up automated deployment pipelines

### Additional Considerations

- **Scaling**: Consider load balancing for high traffic
- **Database replication**: For high availability
- **Container orchestration**: Docker/Kubernetes for easier management
- **Advanced monitoring**: Prometheus/Grafana for detailed metrics

Remember to regularly update dependencies and monitor system performance to ensure optimal operation.

---

**Need Help?** If you encounter any issues during deployment, check the troubleshooting section or refer to the project's documentation. For GoDaddy-specific issues, consult GoDaddy's VPS documentation or support.
