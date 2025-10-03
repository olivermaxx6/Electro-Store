#!/bin/bash

# SPPIX Production Deployment Script for GoDaddy VPS
# This script deploys the SPPIX project to a GoDaddy VPS server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="sppix.com"
WWW_DOMAIN="www.sppix.com"
SERVER_IP="90.249.95.206"
PROJECT_NAME="sppix-store"
PROJECT_PATH="/opt/sppix-store"
BACKEND_PATH="$PROJECT_PATH/Backend"
FRONTEND_PATH="$PROJECT_PATH/Frontend"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
SERVICE_USER="sppix"
PYTHON_VERSION="3.11"
DJANGO_PORT="82"
ASGI_PORT="83"

echo -e "${BLUE}🚀 Starting SPPIX Production Deployment to GoDaddy VPS${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo -e "${BLUE}Server IP: $SERVER_IP${NC}"
echo -e "${BLUE}Project Path: $PROJECT_PATH${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    nginx \
    mysql-server \
    mysql-client \
    redis-server \
    git \
    curl \
    wget \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    certbot \
    python3-certbot-nginx \
    supervisor \
    htop \
    nano \
    ufw

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create project user
print_status "Creating project user: $SERVICE_USER"
if ! id "$SERVICE_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $SERVICE_USER
    sudo usermod -aG sudo $SERVICE_USER
    print_status "User $SERVICE_USER created"
else
    print_warning "User $SERVICE_USER already exists"
fi

# Create project directory
print_status "Creating project directory: $PROJECT_PATH"
sudo mkdir -p $PROJECT_PATH
sudo chown $SERVICE_USER:$SERVICE_USER $PROJECT_PATH

# Clone or copy project files
print_status "Setting up project files..."
if [ -d ".git" ]; then
    # If this is a git repository, clone it
    sudo -u $SERVICE_USER git clone . $PROJECT_PATH
else
    # Copy current directory to project path
    sudo cp -r . $PROJECT_PATH/
    sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_PATH
fi

# Set up Python virtual environment
print_status "Setting up Python virtual environment..."
cd $BACKEND_PATH
sudo -u $SERVICE_USER python3.11 -m venv venv
sudo -u $SERVICE_USER $BACKEND_PATH/venv/bin/pip install --upgrade pip
sudo -u $SERVICE_USER $BACKEND_PATH/venv/bin/pip install -r requirements.txt

# Set up MySQL database
print_status "Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS sppix_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'sppix_user'@'localhost' IDENTIFIED BY 'SppixStore2024!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON sppix_store.* TO 'sppix_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Set up environment file
print_status "Setting up production environment..."
sudo -u $SERVICE_USER cp $BACKEND_PATH/env.production $BACKEND_PATH/.env

# Generate Django secret key
SECRET_KEY=$(sudo -u $SERVICE_USER $BACKEND_PATH/venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sudo -u $SERVICE_USER sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" $BACKEND_PATH/.env

# Run Django migrations
print_status "Running Django migrations..."
sudo -u $SERVICE_USER $BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py migrate

# Create Django superuser
print_status "Creating Django superuser..."
sudo -u $SERVICE_USER $BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sppix.com', 'SppixAdmin2024!')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
print_status "Collecting static files..."
sudo -u $SERVICE_USER $BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py collectstatic --noinput

# Set up frontend
print_status "Setting up frontend..."
cd $FRONTEND_PATH
sudo -u $SERVICE_USER npm install
sudo -u $SERVICE_USER cp $FRONTEND_PATH/env.production $FRONTEND_PATH/.env

# Build frontend for production
print_status "Building frontend for production..."
sudo -u $SERVICE_USER npm run build

# Set up Nginx configuration
print_status "Setting up Nginx configuration..."
sudo tee $NGINX_SITES_AVAILABLE/sppix > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN $SERVER_IP;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN $SERVER_IP;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend (React app)
    location / {
        root $FRONTEND_PATH/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
    
    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
    
    # Static files
    location /static/ {
        alias $BACKEND_PATH/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias $BACKEND_PATH/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # WebSocket support for Django Channels
    location /ws/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf $NGINX_SITES_AVAILABLE/sppix $NGINX_SITES_ENABLED/
sudo rm -f $NGINX_SITES_ENABLED/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Set up systemd service for Django
print_status "Setting up Django systemd service..."
sudo tee /etc/systemd/system/sppix-django.service > /dev/null << EOF
[Unit]
Description=SPPIX Django Application
After=network.target mysql.service redis.service

[Service]
Type=exec
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py runserver 127.0.0.1:$DJANGO_PORT
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Set up systemd service for ASGI (WebSocket support)
print_status "Setting up Django ASGI systemd service..."
sudo tee /etc/systemd/system/sppix-asgi.service > /dev/null << EOF
[Unit]
Description=SPPIX Django ASGI Application
After=network.target mysql.service redis.service

[Service]
Type=exec
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/run_asgi_server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 82
sudo ufw allow 83

# Start and enable services
print_status "Starting and enabling services..."
sudo systemctl daemon-reload
sudo systemctl enable mysql redis-server nginx sppix-django sppix-asgi
sudo systemctl start mysql redis-server nginx sppix-django sppix-asgi

# Get SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@sppix.com

# Set up SSL renewal
print_status "Setting up SSL certificate auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Restart services
print_status "Restarting services..."
sudo systemctl restart nginx sppix-django sppix-asgi

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/sppix > /dev/null << EOF
$BACKEND_PATH/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
    postrotate
        systemctl reload sppix-django sppix-asgi
    endscript
}
EOF

# Create backup script
print_status "Creating backup script..."
sudo tee /opt/backup_sppix.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/sppix"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup database
mysqldump -u sppix_user -p'SppixStore2024!' sppix_store > \$BACKUP_DIR/database_\$DATE.sql

# Backup media files
tar -czf \$BACKUP_DIR/media_\$DATE.tar.gz $BACKEND_PATH/media/

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /opt/backup_sppix.sh

# Set up daily backup cron job
print_status "Setting up daily backup..."
echo "0 2 * * * /opt/backup_sppix.sh" | sudo crontab -

# Create update script
print_status "Creating update script..."
sudo tee /opt/update_sppix.sh > /dev/null << EOF
#!/bin/bash
cd $PROJECT_PATH

# Pull latest changes
git pull origin main

# Update backend
cd $BACKEND_PATH
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Update frontend
cd $FRONTEND_PATH
npm install
npm run build

# Restart services
systemctl restart sppix-django sppix-asgi
systemctl reload nginx

echo "SPPIX updated successfully!"
EOF

sudo chmod +x /opt/update_sppix.sh

# Final status check
print_status "Performing final status check..."
sudo systemctl status sppix-django sppix-asgi nginx mysql redis-server --no-pager

echo ""
echo -e "${GREEN}🎉 SPPIX Production Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   Domain: https://$DOMAIN"
echo -e "   WWW: https://$WWW_DOMAIN"
echo -e "   IP: https://$SERVER_IP"
echo -e "   Admin Panel: https://$DOMAIN/admin/"
echo -e "   API: https://$DOMAIN/api/"
echo ""
echo -e "${BLUE}🔑 Admin Credentials:${NC}"
echo -e "   Username: admin"
echo -e "   Email: admin@sppix.com"
echo -e "   Password: SppixAdmin2024!"
echo ""
echo -e "${BLUE}📁 Project Path: $PROJECT_PATH${NC}"
echo -e "${BLUE}👤 Service User: $SERVICE_USER${NC}"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   Update: sudo /opt/update_sppix.sh"
echo -e "   Backup: sudo /opt/backup_sppix.sh"
echo -e "   Logs: sudo journalctl -u sppix-django -f"
echo -e "   Status: sudo systemctl status sppix-django sppix-asgi"
echo ""
echo -e "${GREEN}✅ Your SPPIX store is now live!${NC}"
