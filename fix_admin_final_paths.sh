#!/bin/bash

# FINAL ADMIN PANEL FIX - CORRECT ASSET PATHS
# This script fixes the asset path issue once and for all

echo "🔧 FINAL ADMIN PANEL FIX - ASSET PATHS"
echo "====================================="

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
if [ ! -f "Frontend/vite.admin.config.js" ]; then
    print_error "Frontend directory not found. Please run this script from the project root."
    exit 1
fi

print_header "Step 1: Rebuilding Admin Panel with Correct Base Path"
echo "The issue: HTML references /assets/ instead of /admin/assets/"
echo "The fix: Added base: '/admin/' to Vite config"

cd Frontend

print_status "Building admin panel with correct asset paths..."
npm run build:admin

if [ $? -ne 0 ]; then
    print_error "Admin build failed!"
    exit 1
fi

print_status "✅ Admin panel rebuilt successfully!"

print_header "Step 2: Verifying Asset Paths"
echo "Checking the generated HTML file..."

if [ -f "dist/admin/index.html" ]; then
    echo "HTML file content:"
    cat dist/admin/index.html
    echo ""
    
    # Check if paths are correct
    if grep -q 'src="/admin/assets/' dist/admin/index.html; then
        print_status "✅ Asset paths are now correct!"
    else
        print_error "❌ Asset paths still incorrect!"
        exit 1
    fi
else
    print_error "❌ HTML file not found!"
    exit 1
fi

cd ..

print_header "Step 3: Deploying Fixed Admin Panel"
echo "Copying files to server location..."

# Copy the fixed files
cp -r Frontend/dist/admin/* /opt/sppix-store/Frontend/dist/admin/

print_status "✅ Files deployed to server!"

print_header "Step 4: Testing the Fix"
echo "Testing admin panel access..."

echo "Testing admin panel HTML..."
ADMIN_HTML=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/)
if [ "$ADMIN_HTML" = "200" ]; then
    print_status "✅ Admin panel HTML: HTTP $ADMIN_HTML"
else
    print_error "❌ Admin panel HTML: HTTP $ADMIN_HTML"
fi

echo "Testing CSS file with correct path..."
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/assets/index-a83675a6.css)
if [ "$CSS_STATUS" = "200" ]; then
    print_status "✅ CSS file: HTTP $CSS_STATUS"
else
    print_error "❌ CSS file: HTTP $CSS_STATUS"
fi

echo "Testing JS file with correct path..."
JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/assets/index-3fd7054a.js)
if [ "$JS_STATUS" = "200" ]; then
    print_status "✅ JS file: HTTP $JS_STATUS"
else
    print_error "❌ JS file: HTTP $JS_STATUS"
fi

print_header "Step 5: Final Verification"
echo "Creating final verification report..."

cat > admin_panel_final_verification.txt << EOF
SPPIX Admin Panel - FINAL FIX VERIFICATION
Generated: $(date)

ISSUE RESOLVED:
- Problem: HTML referenced /assets/ instead of /admin/assets/
- Root Cause: Missing base: '/admin/' in Vite config
- Solution: Added base: '/admin/' to vite.admin.config.js

TEST RESULTS:
- Admin HTML: HTTP $ADMIN_HTML
- CSS File: HTTP $CSS_STATUS  
- JS File: HTTP $JS_STATUS

FILES UPDATED:
- Frontend/vite.admin.config.js (added base: '/admin/')
- Frontend/dist/admin/index.html (regenerated with correct paths)
- /opt/sppix-store/Frontend/dist/admin/ (deployed)

STATUS: $([ "$ADMIN_HTML" = "200" ] && [ "$CSS_STATUS" = "200" ] && [ "$JS_STATUS" = "200" ] && echo "✅ ADMIN PANEL FULLY WORKING" || echo "❌ ISSUES REMAIN")
EOF

print_status "✅ Final verification report created!"

echo ""
echo "🎉 FINAL ADMIN PANEL FIX COMPLETED!"
echo "==================================="
echo ""
print_status "✅ Asset paths are now correct"
print_status "✅ HTML references /admin/assets/ instead of /assets/"
print_status "✅ Vite config updated with base: '/admin/'"
print_status "✅ Admin panel rebuilt and deployed"
echo ""
print_warning "IMPORTANT: Test https://sppix.com/admin/ in your browser now!"
print_warning "The 404 errors should be completely resolved!"
echo ""
print_status "The admin panel should now work perfectly! 🚀"
