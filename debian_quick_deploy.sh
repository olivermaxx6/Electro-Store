#!/bin/bash

# SPPIX Debian Quick Deploy Script
# Run this script on your Debian VPS after uploading the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐧 SPPIX Debian Quick Deploy Script${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root. Please run as a regular user with sudo privileges.${NC}"
   exit 1
fi

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Update system
print_info "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated"

# Step 2: Install required packages
print_info "Step 2: Installing required packages..."
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

print_status "Required packages installed"

# Step 3: Install Node.js 18.x
print_info "Step 3: Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_status "Node.js installed"

# Step 4: Create project user
print_info "Step 4: Creating project user..."
if ! id "sppix" &>/dev/null; then
    sudo useradd -m -s /bin/bash sppix
    sudo usermod -aG sudo sppix
    print_status "User sppix created"
else
    print_warning "User sppix already exists"
fi

# Step 5: Set up project permissions
print_info "Step 5: Setting up project permissions..."
sudo chown -R sppix:sppix /opt/sppix-store
print_status "Permissions set"

# Step 6: Set up Python environment
print_info "Step 6: Setting up Python environment..."
cd /opt/sppix-store
sudo -u sppix python3.11 -m venv Backend/venv
sudo -u sppix Backend/venv/bin/pip install --upgrade pip
sudo -u sppix Backend/venv/bin/pip install -r Backend/requirements.txt
print_status "Python environment ready"

# Step 7: Set up database
print_info "Step 7: Setting up database..."
sudo systemctl start mysql
sudo systemctl enable mysql

sudo mysql -e "CREATE DATABASE IF NOT EXISTS sppix_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'sppix_user'@'localhost' IDENTIFIED BY 'SppixStore2024!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON sppix_store.* TO 'sppix_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
print_status "Database configured"

# Step 8: Configure Django
print_info "Step 8: Configuring Django..."
sudo -u sppix cp Backend/env.production Backend/.env

# Generate secret key
SECRET_KEY=$(sudo -u sppix Backend/venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sudo -u sppix sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" Backend/.env

# Run migrations
sudo -u sppix Backend/venv/bin/python Backend/manage.py migrate

# Create superuser
sudo -u sppix Backend/venv/bin/python Backend/manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sppix.com', 'SppixAdmin2024!')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
sudo -u sppix Backend/venv/bin/python Backend/manage.py collectstatic --noinput
print_status "Django configured"

# Step 9: Set up frontend
print_info "Step 9: Setting up frontend..."
cd Frontend
sudo -u sppix npm install
sudo -u sppix cp env.production .env
sudo -u sppix npm run build:both
cd ..
print_status "Frontend built"

# Step 10: Configure Nginx
print_info "Step 10: Configuring Nginx..."
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 11: Set up systemd services
print_info "Step 11: Setting up systemd services..."
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sppix-django sppix-asgi
print_status "Systemd services configured"

# Step 12: Configure firewall
print_info "Step 12: Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 82
sudo ufw allow 83
print_status "Firewall configured"

# Step 13: Start services
print_info "Step 13: Starting services..."
sudo systemctl start mysql redis-server nginx sppix-django sppix-asgi

# Check if services are running
services=("mysql" "redis-server" "nginx" "sppix-django" "sppix-asgi")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        exit 1
    fi
done

# Step 14: Set up SSL certificate
print_info "Step 14: Setting up SSL certificate..."
sudo systemctl stop nginx

# Create temporary config for certificate validation
sudo tee /etc/nginx/sites-available/sppix-temp << EOF
server {
    listen 80;
    server_name sppix.com www.sppix.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/sppix-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/sppix
sudo systemctl start nginx

# Obtain SSL certificate
sudo certbot certonly --webroot --webroot-path=/var/www/html --email admin@sppix.com --agree-tos --no-eff-email --domains sppix.com,www.sppix.com --non-interactive

sudo systemctl stop nginx
sudo rm -f /etc/nginx/sites-enabled/sppix-temp
sudo rm -f /etc/nginx/sites-available/sppix-temp
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo systemctl start nginx

# Set up automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
print_status "SSL certificate configured"

# Step 15: Final verification
print_info "Step 15: Final verification..."
sleep 5

# Check ports
ports=("80" "443" "82" "83")
for port in "${ports[@]}"; do
    if netstat -tlnp | grep -q ":$port "; then
        print_status "Port $port is listening"
    else
        print_warning "Port $port is not listening"
    fi
done

# Test website
if curl -s -o /dev/null -w "%{http_code}" https://sppix.com | grep -q "200\|301\|302"; then
    print_status "Website is accessible"
else
    print_warning "Website might not be accessible yet"
fi

echo ""
echo -e "${GREEN}🎉 SPPIX Deployment Complete!${NC}"
echo -e "${GREEN}==============================${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   🌐 Website: https://sppix.com"
echo -e "   🌐 WWW: https://www.sppix.com"
echo -e "   🌐 IP: https://90.249.95.206"
echo -e "   🔧 Admin: https://sppix.com/admin/"
echo -e "   📡 API: https://sppix.com/api/"
echo ""
echo -e "${BLUE}🔑 Admin Credentials:${NC}"
echo -e "   👤 Username: admin"
echo -e "   📧 Email: admin@sppix.com"
echo -e "   🔒 Password: SppixAdmin2024!"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   📊 Status: sudo systemctl status sppix-django sppix-asgi"
echo -e "   🔄 Restart: sudo systemctl restart sppix-django sppix-asgi"
echo -e "   📝 Logs: sudo journalctl -u sppix-django -f"
echo ""
echo -e "${GREEN}✅ Your SPPIX store is now live on Debian!${NC}"
