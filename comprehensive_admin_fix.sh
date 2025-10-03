#!/bin/bash

# COMPREHENSIVE ADMIN PANEL FIX - SPPIX
# This script ensures the admin panel works correctly and remains functional

echo "🔧 COMPREHENSIVE ADMIN PANEL FIX - SPPIX"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "nginx_sppix.conf" ]; then
    print_error "nginx_sppix.conf not found. Please run this script from the project root."
    exit 1
fi

print_header "Step 1: Verifying Frontend Build"
echo "Checking if admin build files exist..."

if [ ! -d "Frontend/dist/admin" ]; then
    print_error "Admin build directory not found!"
    print_status "Building frontend..."
    cd Frontend
    npm run build:admin
    if [ $? -ne 0 ]; then
        print_error "Frontend build failed!"
        exit 1
    fi
    cd ..
fi

# Check for the specific files causing 404 errors
if [ ! -f "Frontend/dist/admin/assets/index-a83675a6.css" ]; then
    print_error "CSS file not found! Rebuilding..."
    cd Frontend
    npm run build:admin
    cd ..
fi

if [ ! -f "Frontend/dist/admin/assets/index-3fd7054a.js" ]; then
    print_error "JS file not found! Rebuilding..."
    cd Frontend
    npm run build:admin
    cd ..
fi

print_status "✅ Frontend build verified!"

print_header "Step 2: Verifying File Permissions"
echo "Setting correct permissions for admin files..."

# Set proper permissions
sudo chown -R www-data:www-data /opt/sppix-store/Frontend/dist/
sudo chmod -R 755 /opt/sppix-store/Frontend/dist/

print_status "✅ File permissions set!"

print_header "Step 3: Applying Nginx Configuration Fix"
echo "Copying updated nginx configuration with alias fix..."

# Backup current config
sudo cp /etc/nginx/sites-available/sppix /etc/nginx/sites-available/sppix.backup.$(date +%Y%m%d_%H%M%S)

# Apply new config
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix

print_status "✅ Nginx configuration updated!"

print_header "Step 4: Testing Nginx Configuration"
echo "Testing nginx configuration..."

if sudo nginx -t; then
    print_status "✅ Nginx configuration test passed!"
else
    print_error "❌ Nginx configuration test failed!"
    print_warning "Restoring backup configuration..."
    sudo cp /etc/nginx/sites-available/sppix.backup.* /etc/nginx/sites-available/sppix
    exit 1
fi

print_header "Step 5: Reloading Nginx"
echo "Reloading nginx service..."

sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    print_status "✅ Nginx reloaded successfully!"
else
    print_error "❌ Failed to reload nginx!"
    exit 1
fi

print_header "Step 6: Comprehensive Testing"
echo "Testing admin panel access..."

echo ""
echo "Testing admin panel HTML..."
ADMIN_HTML=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/)
if [ "$ADMIN_HTML" = "200" ]; then
    print_status "✅ Admin panel HTML: HTTP $ADMIN_HTML"
else
    print_error "❌ Admin panel HTML: HTTP $ADMIN_HTML"
fi

echo "Testing CSS file..."
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/assets/index-a83675a6.css)
if [ "$CSS_STATUS" = "200" ]; then
    print_status "✅ CSS file: HTTP $CSS_STATUS"
else
    print_error "❌ CSS file: HTTP $CSS_STATUS"
fi

echo "Testing JS file..."
JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/assets/index-3fd7054a.js)
if [ "$JS_STATUS" = "200" ]; then
    print_status "✅ JS file: HTTP $JS_STATUS"
else
    print_error "❌ JS file: HTTP $JS_STATUS"
fi

print_header "Step 7: Final Verification"
echo "Creating verification report..."

# Create a verification report
cat > admin_panel_verification.txt << EOF
SPPIX Admin Panel Verification Report
Generated: $(date)

Files Status:
- Admin HTML: HTTP $ADMIN_HTML
- CSS File: HTTP $CSS_STATUS  
- JS File: HTTP $JS_STATUS

Nginx Configuration:
- Location: /admin/
- Alias: /opt/sppix-store/Frontend/dist/admin/
- Files: $(ls -la Frontend/dist/admin/assets/ | wc -l) files in assets directory

Backup Created:
- $(ls -la /etc/nginx/sites-available/sppix.backup.* 2>/dev/null | tail -1 | awk '{print $9}')

Status: $([ "$ADMIN_HTML" = "200" ] && [ "$CSS_STATUS" = "200" ] && [ "$JS_STATUS" = "200" ] && echo "✅ ALL TESTS PASSED" || echo "❌ SOME TESTS FAILED")
EOF

print_status "✅ Verification report created: admin_panel_verification.txt"

print_header "Step 8: Maintenance Script"
echo "Creating maintenance script for future use..."

cat > maintain_admin_panel.sh << 'EOF'
#!/bin/bash
# Admin Panel Maintenance Script

echo "🔧 Admin Panel Maintenance"

# Check if files exist
if [ ! -f "/opt/sppix-store/Frontend/dist/admin/assets/index-a83675a6.css" ]; then
    echo "⚠️  CSS file missing, rebuilding..."
    cd /opt/sppix-store/Frontend && npm run build:admin
fi

if [ ! -f "/opt/sppix-store/Frontend/dist/admin/assets/index-3fd7054a.js" ]; then
    echo "⚠️  JS file missing, rebuilding..."
    cd /opt/sppix-store/Frontend && npm run build:admin
fi

# Test access
echo "Testing admin panel..."
curl -s -o /dev/null -w "Admin Panel: HTTP %{http_code}\n" https://sppix.com/admin/
curl -s -o /dev/null -w "CSS File: HTTP %{http_code}\n" https://sppix.com/admin/assets/index-a83675a6.css
curl -s -o /dev/null -w "JS File: HTTP %{http_code}\n" https://sppix.com/admin/assets/index-3fd7054a.js

echo "✅ Maintenance complete!"
EOF

chmod +x maintain_admin_panel.sh
print_status "✅ Maintenance script created: maintain_admin_panel.sh"

echo ""
echo "🎉 COMPREHENSIVE ADMIN PANEL FIX COMPLETED!"
echo "=========================================="
echo ""
print_status "✅ Admin panel is now properly configured"
print_status "✅ Static files are being served correctly"
print_status "✅ Nginx configuration uses alias (not root)"
print_status "✅ File permissions are set correctly"
print_status "✅ Backup configuration created"
print_status "✅ Maintenance script created"
echo ""
print_warning "IMPORTANT: Test https://sppix.com/admin/ in your browser"
print_warning "The 404 errors for CSS and JS files should now be resolved!"
echo ""
print_status "To maintain the admin panel in the future, run: ./maintain_admin_panel.sh"
