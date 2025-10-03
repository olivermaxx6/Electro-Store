#!/bin/bash

# SPPIX Quick Fix for Python 3.13.5
# Run this script to fix the deployment issues

set -e  # Exit on any error

echo "🔧 SPPIX Quick Fix for Python 3.13.5"
echo "===================================="
echo ""

# Function to print status
print_status() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ️  $1\033[0m"
}

# Step 1: Install Python 3.13 packages
print_info "Step 1: Installing Python 3.13 packages..."
sudo apt update
sudo apt install -y python3.13 python3.13-venv python3.13-dev python3-pip
print_status "Python packages installed"

# Step 2: Fix database user
print_info "Step 2: Fixing database user..."
sudo mysql -e "DROP USER IF EXISTS 'sppix_user'@'localhost';" 2>/dev/null || print_warning "User sppix_user not found"
sudo mysql -e "CREATE USER 'sppix_user'@'localhost' IDENTIFIED BY 'SppixStore2024!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON sppix_store.* TO 'sppix_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
print_status "Database user fixed"

# Step 3: Fix Python environment
print_info "Step 3: Fixing Python environment..."
cd /opt/sppix-store/Backend
sudo rm -rf venv
sudo -u sppix python3.13 -m venv venv
sudo -u sppix venv/bin/pip install --upgrade pip
sudo -u sppix venv/bin/pip install -r requirements.txt
print_status "Python environment fixed"

# Step 4: Fix Django configuration
print_info "Step 4: Fixing Django configuration..."
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

# Step 5: Fix frontend build
print_info "Step 5: Fixing frontend build..."
cd /opt/sppix-store/Frontend
sudo chown -R sppix:sppix .
sudo -u sppix npm install
sudo -u sppix cp env.production .env
sudo -u sppix npm run build:both
print_status "Frontend build fixed"

# Step 6: Fix systemd services
print_info "Step 6: Fixing systemd services..."
sudo sed -i "s/python3.11/python3.13/g" /etc/systemd/system/sppix-django.service
sudo sed -i "s/python3.11/python3.13/g" /etc/systemd/system/sppix-asgi.service
sudo systemctl daemon-reload
print_status "Systemd services fixed"

# Step 7: Start services
print_info "Step 7: Starting services..."
sudo systemctl start sppix-django sppix-asgi nginx

# Check service status
print_info "Step 8: Checking service status..."
services=("sppix-django" "sppix-asgi" "nginx")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        sudo systemctl status $service --no-pager
    fi
done

# Step 9: Check ports
print_info "Step 9: Checking ports..."
ports=("80" "443" "82" "83")
for port in "${ports[@]}"; do
    if netstat -tlnp | grep -q ":$port "; then
        print_status "Port $port is listening"
    else
        print_warning "Port $port is not listening"
    fi
done

# Step 10: Test website
print_info "Step 10: Testing website..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://sppix.com | grep -q "200\|301\|302"; then
    print_status "Website is accessible"
else
    print_warning "Website might not be accessible yet (SSL may still be propagating)"
fi

echo ""
echo "🎉 Fix Complete!"
echo "================"
echo ""
echo "🌐 Your store should now be live at: https://sppix.com"
echo "🔧 Admin panel: https://sppix.com/admin/"
echo "👤 Username: admin"
echo "🔒 Password: SppixAdmin2024!"
echo ""
echo "📊 Management Commands:"
echo "   Status: sudo systemctl status sppix-django sppix-asgi nginx"
echo "   Restart: sudo systemctl restart sppix-django sppix-asgi nginx"
echo "   Logs: sudo journalctl -u sppix-django -f"
echo ""
echo "✅ SPPIX is now fixed and ready for business!"
