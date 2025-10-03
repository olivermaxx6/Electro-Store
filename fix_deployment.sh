#!/bin/bash

# SPPIX Deployment Fix Script
# Run this script to fix common deployment issues

set -e

echo "🔧 SPPIX Deployment Fix Script"
echo "==============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Don't run as root. Use: sudo -u hassan ./fix_deployment.sh"
   exit 1
fi

PROJECT_PATH="/opt/sppix-store"
BACKEND_PATH="$PROJECT_PATH/Backend"
FRONTEND_PATH="$PROJECT_PATH/Frontend"

print_info "Fixing Python virtual environment..."
cd $BACKEND_PATH

# Remove old venv and create new one
sudo rm -rf venv
sudo -u sppix python3 -m venv venv
sudo -u sppix venv/bin/pip install --upgrade pip
sudo -u sppix venv/bin/pip install -r requirements.txt

print_status "Python environment fixed"

print_info "Fixing frontend permissions..."
cd $FRONTEND_PATH

# Fix permissions
sudo chown -R sppix:sppix .
sudo chmod +x node_modules/.bin/*

# Try building again
sudo -u sppix npm run build:both

print_status "Frontend build completed"

print_info "Fixing Django configuration..."
cd $BACKEND_PATH

# Copy production environment
sudo -u sppix cp env.production .env

# Generate secret key
SECRET_KEY=$(sudo -u sppix venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sudo -u sppix sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" .env

# Run migrations
sudo -u sppix venv/bin/python manage.py migrate

# Collect static files
sudo -u sppix venv/bin/python manage.py collectstatic --noinput

print_status "Django configuration fixed"

print_info "Fixing Nginx configuration..."

# Check if nginx config exists
if [ ! -f "/etc/nginx/sites-available/sppix" ]; then
    print_error "Nginx configuration file not found!"
    print_info "Creating basic Nginx configuration..."
    
    sudo tee /etc/nginx/sites-available/sppix > /dev/null << EOF
server {
    listen 80;
    server_name sppix.com www.sppix.com;
    
    location / {
        root $FRONTEND_PATH/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:82;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /admin/ {
        proxy_pass http://127.0.0.1:82;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /static/ {
        alias $BACKEND_PATH/staticfiles/;
    }
    
    location /media/ {
        alias $BACKEND_PATH/media/;
    }
}
EOF
fi

# Enable the site
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    sudo nginx -t
    exit 1
fi

print_info "Fixing systemd services..."

# Update Django service
sudo tee /etc/systemd/system/sppix-django.service > /dev/null << EOF
[Unit]
Description=SPPIX Django Application
After=network.target mysql.service redis.service

[Service]
Type=exec
User=sppix
Group=sppix
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py runserver 127.0.0.1:82
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Update ASGI service
sudo tee /etc/systemd/system/sppix-asgi.service > /dev/null << EOF
[Unit]
Description=SPPIX Django ASGI Application
After=network.target mysql.service redis.service

[Service]
Type=exec
User=sppix
Group=sppix
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/run_asgi_server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

print_status "Systemd services updated"

print_info "Starting services..."

# Start services
sudo systemctl start mysql redis-server
sudo systemctl start sppix-django
sudo systemctl start sppix-asgi
sudo systemctl start nginx

# Enable services
sudo systemctl enable sppix-django sppix-asgi nginx mysql redis-server

print_status "Services started"

print_info "Checking service status..."

# Check if services are running
services=("mysql" "redis-server" "nginx" "sppix-django" "sppix-asgi")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        sudo systemctl status $service --no-pager
    fi
done

print_info "Checking ports..."
ports=("80" "82" "83")
for port in "${ports[@]}"; do
    if netstat -tlnp | grep -q ":$port "; then
        print_status "Port $port is listening"
    else
        print_error "Port $port is not listening"
    fi
done

echo ""
echo -e "${GREEN}🎉 Fix Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Check your services:${NC}"
echo -e "   sudo systemctl status sppix-django sppix-asgi nginx"
echo ""
echo -e "${BLUE}🌐 Test your site:${NC}"
echo -e "   curl -I http://localhost"
echo -e "   curl -I http://localhost/api/"
echo ""
echo -e "${BLUE}📝 View logs if needed:${NC}"
echo -e "   sudo journalctl -u sppix-django -f"
echo -e "   sudo journalctl -u nginx -f"
echo ""
echo -e "${GREEN}✅ Your SPPIX store should now be working!${NC}"

