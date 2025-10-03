#!/bin/bash

# Admin Panel Fix Script for SPPIX Live Server
# This script fixes the admin panel routing issue

set -e

echo "🔧 SPPIX Admin Panel Fix Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed. Please install nginx first."
    exit 1
fi

# Check if the project directory exists
PROJECT_DIR="/opt/sppix-store"
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory $PROJECT_DIR not found!"
    exit 1
fi

print_status "Project directory found: $PROJECT_DIR"

# Check if admin build exists
ADMIN_BUILD_DIR="$PROJECT_DIR/Frontend/dist/admin"
if [ ! -d "$ADMIN_BUILD_DIR" ]; then
    print_error "Admin build directory not found: $ADMIN_BUILD_DIR"
    print_warning "Please build the admin panel first:"
    print_warning "cd $PROJECT_DIR/Frontend && npm run build:admin"
    exit 1
fi

print_status "Admin build directory found: $ADMIN_BUILD_DIR"

# Check if admin index.html exists
if [ ! -f "$ADMIN_BUILD_DIR/index.html" ]; then
    print_error "Admin index.html not found: $ADMIN_BUILD_DIR/index.html"
    print_warning "Please build the admin panel first:"
    print_warning "cd $PROJECT_DIR/Frontend && npm run build:admin"
    exit 1
fi

print_status "Admin index.html found"

# Backup current nginx configuration
NGINX_CONF="/etc/nginx/sites-available/sppix"
if [ -f "$NGINX_CONF" ]; then
    BACKUP_FILE="/etc/nginx/sites-available/sppix.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Backing up current nginx configuration to: $BACKUP_FILE"
    cp "$NGINX_CONF" "$BACKUP_FILE"
else
    print_warning "Current nginx configuration not found at: $NGINX_CONF"
fi

# Copy the fixed nginx configuration
print_status "Applying fixed nginx configuration..."
cp nginx_admin_fix.conf "$NGINX_CONF"

# Test nginx configuration
print_status "Testing nginx configuration..."
if nginx -t; then
    print_status "Nginx configuration test passed!"
else
    print_error "Nginx configuration test failed!"
    print_warning "Restoring backup configuration..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$NGINX_CONF"
    fi
    exit 1
fi

# Reload nginx
print_status "Reloading nginx..."
systemctl reload nginx

# Check nginx status
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running successfully!"
else
    print_error "Nginx failed to start!"
    exit 1
fi

# Test admin panel access
print_status "Testing admin panel access..."
ADMIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/ || echo "000")
if [ "$ADMIN_TEST" = "200" ]; then
    print_status "✅ Admin panel is accessible at https://sppix.com/admin/"
else
    print_warning "⚠️  Admin panel test returned HTTP $ADMIN_TEST"
    print_warning "This might be normal if the admin panel requires authentication"
fi

# Test storefront access
print_status "Testing storefront access..."
STORE_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/ || echo "000")
if [ "$STORE_TEST" = "200" ]; then
    print_status "✅ Storefront is accessible at https://sppix.com/"
else
    print_error "❌ Storefront test returned HTTP $STORE_TEST"
fi

# Test API access
print_status "Testing API access..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/api/public/health/ || echo "000")
if [ "$API_TEST" = "200" ]; then
    print_status "✅ API is accessible at https://sppix.com/api/"
else
    print_warning "⚠️  API test returned HTTP $API_TEST"
fi

echo ""
echo "🎉 Admin Panel Fix Complete!"
echo "=========================="
echo ""
echo "✅ Fixed nginx configuration applied"
echo "✅ Nginx reloaded successfully"
echo "✅ Admin panel should now be accessible at: https://sppix.com/admin/"
echo "✅ Storefront should still work at: https://sppix.com/"
echo ""
echo "📋 What was fixed:"
echo "   - Moved /admin/ location block before root / location block"
echo "   - This ensures /admin/ requests are handled by admin panel, not storefront"
echo "   - Added proper fallback to /admin/index.html for SPA routing"
echo ""
echo "🔍 If you still have issues:"
echo "   1. Check nginx error logs: tail -f /var/log/nginx/sppix_error.log"
echo "   2. Check nginx access logs: tail -f /var/log/nginx/sppix_access.log"
echo "   3. Verify admin build exists: ls -la $ADMIN_BUILD_DIR"
echo "   4. Test with: curl -I https://sppix.com/admin/"
echo ""
echo "📁 Backup created at: $BACKUP_FILE"
echo ""
