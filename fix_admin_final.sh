#!/bin/bash

# Fix Admin Panel Static Files - FINAL FIX
# This script fixes the nginx alias issue causing 404 errors

echo "🔧 Applying FINAL fix for admin panel static files..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "nginx_sppix.conf" ]; then
    print_error "nginx_sppix.conf not found. Please run this script from the project root."
    exit 1
fi

print_status "Step 1: Copying updated nginx configuration..."
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix

print_status "Step 2: Testing nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration test passed!"
else
    print_error "Nginx configuration test failed!"
    exit 1
fi

print_status "Step 3: Reloading nginx..."
sudo systemctl reload nginx

print_status "Step 4: Testing admin panel access..."
echo "Testing admin panel HTML..."
curl -I https://sppix.com/admin/ | head -1

echo "Testing CSS file..."
curl -I https://sppix.com/admin/assets/index-a83675a6.css | head -1

echo "Testing JS file..."
curl -I https://sppix.com/admin/assets/index-3fd7054a.js | head -1

print_status "✅ FINAL fix applied!"
print_warning "The nginx configuration now uses 'alias' instead of 'root'"
print_warning "This should resolve the 404 errors in the browser"
print_status "Please test https://sppix.com/admin/ in your browser now"
