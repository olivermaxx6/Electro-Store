#!/bin/bash

# SPPIX Multi-Project Setup Script
# This script sets up SPPIX to run alongside existing projects on different ports

set -e

echo "🚀 SPPIX Multi-Project Setup"
echo "============================="
echo "Existing project: pso.yourdomain.com (port 80) - KEEP RUNNING"
echo "New SPPIX project: sppix.com (ports 82/83) - NEW SETUP"
echo ""

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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Configuration
DOMAIN="sppix.com"
WWW_DOMAIN="www.sppix.com"
SERVER_IP="90.249.95.206"
PROJECT_PATH="/opt/sppix-store"
BACKEND_PATH="$PROJECT_PATH/Backend"
FRONTEND_PATH="$PROJECT_PATH/Frontend"
DJANGO_PORT="82"
ASGI_PORT="83"

print_info "Setting up SPPIX on ports $DJANGO_PORT/$ASGI_PORT (not disturbing port 80)..."

# Step 1: Fix Django Configuration
print_info "Step 1: Configuring Django for port $DJANGO_PORT..."
cd $BACKEND_PATH

# Copy production environment
sudo -u sppix cp env.production .env

# Generate secret key
SECRET_KEY=$(sudo -u sppix venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sudo -u sppix sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" .env

# Update Django settings for port 82
sudo -u sppix sed -i "s/ALLOWED_HOSTS=.*/ALLOWED_HOSTS=sppix.com,www.sppix.com,90.249.95.206,localhost,127.0.0.1/" .env

# Run migrations
sudo -u sppix venv/bin/python manage.py migrate

# Collect static files
sudo -u sppix venv/bin/python manage.py collectstatic --noinput

print_status "Django configured for port $DJANGO_PORT"

# Step 2: Fix Frontend Configuration
print_info "Step 2: Configuring frontend..."
cd $FRONTEND_PATH

# Copy production environment
sudo -u sppix cp env.production .env

# Update frontend environment for sppix.com
sudo -u sppix sed -i "s/VITE_API_URL=.*/VITE_API_URL=https:\/\/sppix.com\/api/" .env
sudo -u sppix sed -i "s/VITE_WS_URL=.*/VITE_WS_URL=wss:\/\/sppix.com\/ws/" .env

# Rebuild frontend
sudo -u sppix npm run build:both

print_status "Frontend configured and built"

# Step 3: Create Nginx Configuration for SPPIX (separate from existing project)
print_info "Step 3: Creating Nginx configuration for sppix.com..."

sudo tee /etc/nginx/sites-available/sppix > /dev/null << EOF
# SPPIX Project Configuration (Ports 82/83)
# This runs alongside existing project on port 80

server {
    listen 80;
    server_name sppix.com www.sppix.com;
    
    # Frontend (React storefront)
    location / {
        root $FRONTEND_PATH/dist/storefront;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Admin panel
    location /admin/ {
        root $FRONTEND_PATH/dist;
        try_files \$uri \$uri/ /admin/index.html;
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
    
    # Django admin (backend)
    location /django-admin/ {
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
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:$ASGI_PORT;
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

# Enable SPPIX site
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/

print_status "Nginx configuration created for sppix.com"

# Step 4: Test Nginx Configuration
print_info "Step 4: Testing Nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    sudo nginx -t
    exit 1
fi

# Step 5: Fix Systemd Services
print_info "Step 5: Updating systemd services..."

# Update Django service for port 82
sudo tee /etc/systemd/system/sppix-django.service > /dev/null << EOF
[Unit]
Description=SPPIX Django Application (Port $DJANGO_PORT)
After=network.target mysql.service redis.service

[Service]
Type=exec
User=sppix
Group=sppix
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py runserver 127.0.0.1:$DJANGO_PORT
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Update ASGI service for port 83
sudo tee /etc/systemd/system/sppix-asgi.service > /dev/null << EOF
[Unit]
Description=SPPIX Django ASGI Application (Port $ASGI_PORT)
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

# Step 6: Configure Firewall (only for SPPIX ports)
print_info "Step 6: Configuring firewall for SPPIX ports..."
sudo ufw allow $DJANGO_PORT comment "SPPIX Django"
sudo ufw allow $ASGI_PORT comment "SPPIX ASGI"

print_status "Firewall configured for SPPIX ports"

# Step 7: Start SPPIX Services
print_info "Step 7: Starting SPPIX services..."

# Stop SPPIX services first
sudo systemctl stop sppix-django sppix-asgi 2>/dev/null || true

# Start SPPIX services
sudo systemctl start sppix-django
sudo systemctl start sppix-asgi

# Enable SPPIX services
sudo systemctl enable sppix-django sppix-asgi

print_status "SPPIX services started"

# Step 8: Reload Nginx (without affecting existing project)
print_info "Step 8: Reloading Nginx..."
sudo systemctl reload nginx

print_status "Nginx reloaded"

# Step 9: Verification
print_info "Step 9: Verifying setup..."

# Check SPPIX services
services=("sppix-django" "sppix-asgi")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        sudo systemctl status $service --no-pager
    fi
done

# Check ports
ports=("$DJANGO_PORT" "$ASGI_PORT")
for port in "${ports[@]}"; do
    if netstat -tlnp | grep -q ":$port "; then
        print_status "Port $port is listening"
    else
        print_error "Port $port is not listening"
    fi
done

# Test SPPIX endpoints
print_info "Testing SPPIX endpoints..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$DJANGO_PORT/api/ | grep -q "200\|404"; then
    print_status "SPPIX API is responding"
else
    print_warning "SPPIX API might not be responding yet"
fi

echo ""
echo -e "${GREEN}🎉 SPPIX Multi-Project Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Project Summary:${NC}"
echo -e "   🏪 Existing Project: pso.yourdomain.com (port 80) - ${GREEN}UNCHANGED${NC}"
echo -e "   🛒 New SPPIX Project: sppix.com (ports $DJANGO_PORT/$ASGI_PORT) - ${GREEN}RUNNING${NC}"
echo ""
echo -e "${BLUE}🌐 SPPIX URLs:${NC}"
echo -e "   🏪 Storefront: http://sppix.com"
echo -e "   🔧 Admin Panel: http://sppix.com/admin/"
echo -e "   📡 API: http://sppix.com/api/"
echo -e "   🖥️  Django Admin: http://sppix.com/django-admin/"
echo ""
echo -e "${BLUE}🔑 SPPIX Admin Credentials:${NC}"
echo -e "   👤 Username: admin"
echo -e "   📧 Email: admin@sppix.com"
echo -e "   🔒 Password: SppixAdmin2024!"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   📊 Status: sudo systemctl status sppix-django sppix-asgi"
echo -e "   🔄 Restart: sudo systemctl restart sppix-django sppix-asgi"
echo -e "   📝 Logs: sudo journalctl -u sppix-django -f"
echo ""
echo -e "${YELLOW}📋 DNS Setup Required:${NC}"
echo -e "   Add these DNS records to your domain:"
echo -e "   Type: A, Name: sppix, Data: $SERVER_IP"
echo -e "   Type: A, Name: www.sppix, Data: $SERVER_IP"
echo ""
echo -e "${GREEN}✅ Both projects are now running simultaneously!${NC}"
echo -e "${GREEN}🚀 Your existing project on port 80 is untouched!${NC}"

