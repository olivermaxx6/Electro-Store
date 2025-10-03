#!/bin/bash

# Fix Django Settings Syntax Error
# This script fixes the unterminated string literal in settings.py

set -e  # Exit on any error

echo "🔧 Fixing Django Settings Syntax Error"
echo "====================================="
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

# Step 1: Backup current settings.py
print_info "Step 1: Backing up current settings.py..."
cd /opt/sppix-store/Backend
sudo cp core/settings.py core/settings.py.backup.$(date +%Y%m%d_%H%M%S)
print_status "Settings backed up"

# Step 2: Fix the Stripe secret key line
print_info "Step 2: Fixing Stripe secret key syntax..."
sudo sed -i '23s/.*/STRIPE_SECRET_KEY = "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"/' core/settings.py
print_status "Stripe secret key fixed"

# Step 3: Verify syntax
print_info "Step 3: Verifying Python syntax..."
if sudo -u sppix venv/bin/python -m py_compile core/settings.py; then
    print_status "Python syntax is valid"
else
    print_error "Python syntax error still exists"
    exit 1
fi

# Step 4: Test Django configuration
print_info "Step 4: Testing Django configuration..."
if sudo -u sppix venv/bin/python manage.py check; then
    print_status "Django configuration is valid"
else
    print_error "Django configuration error"
    exit 1
fi

# Step 5: Run migrations
print_info "Step 5: Running Django migrations..."
sudo -u sppix venv/bin/python manage.py migrate
print_status "Migrations completed"

# Step 6: Collect static files
print_info "Step 6: Collecting static files..."
sudo -u sppix venv/bin/python manage.py collectstatic --noinput
print_status "Static files collected"

# Step 7: Restart services
print_info "Step 7: Restarting Django services..."
sudo systemctl restart sppix-django sppix-asgi
print_status "Services restarted"

# Step 8: Check service status
print_info "Step 8: Checking service status..."
services=("sppix-django" "sppix-asgi")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        sudo systemctl status $service --no-pager
    fi
done

echo ""
echo "🎉 Django Settings Fix Complete!"
echo "================================"
echo ""
echo "✅ The syntax error in settings.py has been fixed"
echo "✅ Django services have been restarted"
echo "✅ Your application should now be working properly"
echo ""
echo "🌐 Test your application at: https://sppix.com"
echo "🔧 Admin panel: https://sppix.com/admin/"
echo ""
echo "📊 Management Commands:"
echo "   Status: sudo systemctl status sppix-django sppix-asgi"
echo "   Logs: sudo journalctl -u sppix-django -f"
echo ""
