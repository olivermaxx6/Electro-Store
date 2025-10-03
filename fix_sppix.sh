#!/bin/bash

# SPPIX Fix Script for Debian Trixie
# This script fixes the deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 SPPIX Fix Script for Debian Trixie${NC}"
echo -e "${BLUE}====================================${NC}"
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Check Python version
print_info "Step 1: Checking Python version..."
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
print_status "Python version: $PYTHON_VERSION"

# Step 2: Install correct Python packages
print_info "Step 2: Installing Python packages..."
sudo apt update
sudo apt install -y python3.13 python3.13-venv python3.13-dev python3-pip python3-distutils
print_status "Python packages installed"

# Step 3: Fix database user
print_info "Step 3: Fixing database user..."
sudo mysql -e "DROP USER IF EXISTS 'sppix_user'@'localhost';"
sudo mysql -e "CREATE USER 'sppix_user'@'localhost' IDENTIFIED BY 'SppixStore2024!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON sppix_store.* TO 'sppix_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
print_status "Database user fixed"

# Step 4: Fix Python environment
print_info "Step 4: Fixing Python environment..."
cd /opt/sppix-store/Backend
sudo rm -rf venv
sudo -u sppix python3.13 -m venv venv
sudo -u sppix venv/bin/pip install --upgrade pip
sudo -u sppix venv/bin/pip install -r requirements.txt
print_status "Python environment fixed"

# Step 5: Fix Django configuration
print_info "Step 5: Fixing Django configuration..."
sudo -u sppix cp env.production .env

# Generate Django secret key
SECRET_KEY=$(sudo -u sppix venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sudo -u sppix sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" .env

# Run Django migrations
sudo -u sppix venv/bin/python manage.py migrate

# Create Django superuser
sudo -u sppix venv/bin/python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sppix.com', 'SppixAdmin2024!')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
sudo -u sppix venv/bin/python manage.py collectstatic --noinput
print_status "Django configuration fixed"

# Step 6: Fix frontend build
print_info "Step 6: Fixing frontend build..."
cd /opt/sppix-store/Frontend
sudo chown -R sppix:sppix .
sudo -u sppix npm install
sudo -u sppix cp env.production .env
sudo -u sppix npm run build:both
print_status "Frontend build fixed"

# Step 7: Fix Nginx configuration
print_info "Step 7: Fixing Nginx configuration..."
cd /opt/sppix-store
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix

# Update Nginx config for correct Python version
sudo sed -i "s/python3.11/python3/g" /etc/nginx/sites-available/sppix

# Enable the site
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 8: Fix systemd services
print_info "Step 8: Fixing systemd services..."
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/

# Update service files for correct Python version
sudo sed -i "s/python3.11/python3.13/g" /etc/systemd/system/sppix-django.service
sudo sed -i "s/python3.11/python3.13/g" /etc/systemd/system/sppix-asgi.service

# Reload systemd
sudo systemctl daemon-reload
sudo systemctl enable sppix-django sppix-asgi
print_status "Systemd services fixed"

# Step 9: Start services
print_info "Step 9: Starting services..."
sudo systemctl start sppix-django sppix-asgi nginx

# Check if services are running
services=("sppix-django" "sppix-asgi" "nginx")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        sudo systemctl status $service --no-pager
    fi
done

# Step 10: Final verification
print_info "Step 10: Final verification..."
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
echo -e "${GREEN}🎉 SPPIX Fix Complete!${NC}"
echo -e "${GREEN}=====================${NC}"
echo ""
echo -e "${BLUE}📋 Fix Summary:${NC}"
echo -e "   ✅ Python environment fixed"
echo -e "   ✅ Database user fixed"
echo -e "   ✅ Django configuration fixed"
echo -e "   ✅ Frontend build fixed"
echo -e "   ✅ Nginx configuration fixed"
echo -e "   ✅ Systemd services fixed"
echo ""
echo -e "${BLUE}🌐 Your store should now be live at: https://sppix.com${NC}"
echo -e "${BLUE}🔧 Admin panel: https://sppix.com/admin/${NC}"
echo -e "${BLUE}👤 Username: admin${NC}"
echo -e "${BLUE}🔒 Password: SppixAdmin2024!${NC}"
echo ""
echo -e "${GREEN}✅ SPPIX is now fixed and ready for business!${NC}"
