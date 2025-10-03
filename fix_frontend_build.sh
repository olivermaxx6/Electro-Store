#!/bin/bash

# Fix Frontend Build Issues
# This script fixes permission and build issues for the frontend

set -e  # Exit on any error

echo "🔧 Fixing Frontend Build Issues"
echo "==============================="
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

# Step 1: Navigate to frontend directory
print_info "Step 1: Navigating to frontend directory..."
cd /opt/sppix-store/Frontend
print_status "In frontend directory"

# Step 2: Fix ownership and permissions
print_info "Step 2: Fixing ownership and permissions..."
sudo chown -R sppix:sppix .
sudo chmod -R 755 .
sudo chmod +x node_modules/.bin/*
print_status "Permissions fixed"

# Step 3: Clean npm cache and node_modules
print_info "Step 3: Cleaning npm cache and node_modules..."
sudo -u sppix rm -rf node_modules package-lock.json
sudo -u sppix npm cache clean --force
print_status "Cache cleaned"

# Step 4: Reinstall dependencies
print_info "Step 4: Reinstalling dependencies..."
sudo -u sppix npm install
print_status "Dependencies installed"

# Step 5: Fix npm vulnerabilities (non-breaking)
print_info "Step 5: Fixing npm vulnerabilities..."
sudo -u sppix npm audit fix
print_status "Vulnerabilities fixed"

# Step 6: Copy environment file
print_info "Step 6: Setting up environment file..."
sudo -u sppix cp env.production .env
print_status "Environment file configured"

# Step 7: Build storefront
print_info "Step 7: Building storefront..."
if sudo -u sppix npm run build:storefront; then
    print_status "Storefront build successful"
else
    print_error "Storefront build failed"
    exit 1
fi

# Step 8: Build admin panel
print_info "Step 8: Building admin panel..."
if sudo -u sppix npm run build:admin; then
    print_status "Admin panel build successful"
else
    print_error "Admin panel build failed"
    exit 1
fi

# Step 9: Fix build output permissions
print_info "Step 9: Fixing build output permissions..."
sudo chown -R sppix:sppix dist/
sudo chmod -R 755 dist/
print_status "Build output permissions fixed"

# Step 10: Restart nginx to serve new builds
print_info "Step 10: Restarting nginx..."
sudo systemctl restart nginx
print_status "Nginx restarted"

# Step 11: Check nginx status
print_info "Step 11: Checking nginx status..."
if sudo systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx failed to start"
    sudo systemctl status nginx --no-pager
fi

echo ""
echo "🎉 Frontend Build Fix Complete!"
echo "=============================="
echo ""
echo "✅ Frontend permissions fixed"
echo "✅ Dependencies reinstalled"
echo "✅ Storefront built successfully"
echo "✅ Admin panel built successfully"
echo "✅ Nginx restarted"
echo ""
echo "🌐 Your frontend should now be accessible at:"
echo "   Storefront: https://sppix.com"
echo "   Admin Panel: https://sppix.com/admin/"
echo ""
echo "📊 Management Commands:"
echo "   Nginx Status: sudo systemctl status nginx"
echo "   Nginx Logs: sudo journalctl -u nginx -f"
echo "   Restart Nginx: sudo systemctl restart nginx"
echo ""
