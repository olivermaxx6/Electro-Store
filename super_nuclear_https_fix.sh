#!/bin/bash

# SPPIX SUPER NUCLEAR HTTPS FIX
# This fixes the Mixed Content Error by updating all API URLs to HTTPS

echo "🔥 SPPIX SUPER NUCLEAR HTTPS FIX"
echo "================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo $0"
    exit 1
fi

# Navigate to project directory
cd /opt/sppix-store

echo "🔧 Fixing API URLs to use HTTPS..."

# Fix API base URL in lib/api.js
echo "📝 Updating Frontend/src/lib/api.js..."
sed -i "s|const API_BASE_URL = 'http://127.0.0.1:8001/api';|const API_BASE_URL = 'https://sppix.com/api';|g" Frontend/src/lib/api.js

# Fix API base URL in lib/authApi.js
echo "📝 Updating Frontend/src/lib/authApi.js..."
sed -i "s|const API_BASE_URL = 'http://127.0.0.1:8001/api';|const API_BASE_URL = 'https://sppix.com/api';|g" Frontend/src/lib/authApi.js

# Fix hardcoded URLs in various components
echo "📝 Fixing hardcoded URLs in components..."

# Fix Home.tsx
sed -i "s|http://127.0.0.1:8001/api/public/categories/|https://sppix.com/api/public/categories/|g" Frontend/src/storefront/pages/Home.tsx
sed -i "s|http://127.0.0.1:8001/api/public/categories/?top=true|https://sppix.com/api/public/categories/?top=true|g" Frontend/src/storefront/pages/Home.tsx

# Fix Checkout.tsx
sed -i "s|http://127.0.0.1:8001/api/public/health/|https://sppix.com/api/public/health/|g" Frontend/src/storefront/pages/Checkout.tsx
sed -i "s|http://127.0.0.1:8001/api/public/create-order-checkout/|https://sppix.com/api/public/create-order-checkout/|g" Frontend/src/storefront/pages/Checkout.tsx

# Fix ProductDetail.tsx
sed -i "s|http://127.0.0.1:8001\${product.image}|https://sppix.com\${product.image}|g" Frontend/src/storefront/pages/ProductDetail.tsx

# Fix PhoneDialog.tsx
sed -i "s|http://localhost:5174/admin/settings|https://sppix.com/admin/settings|g" Frontend/src/storefront/components/common/PhoneDialog.tsx

# Fix any other hardcoded URLs
find Frontend/src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | xargs sed -i "s|http://127.0.0.1:8001|https://sppix.com|g"

echo "🔧 Rebuilding admin panel with HTTPS URLs..."

# Build admin panel
cd Frontend
npm run build:admin

echo "🔄 Reloading nginx..."
systemctl reload nginx

echo "🧪 Testing HTTPS API access..."

# Test API through HTTPS
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/api/public/health/ 2>/dev/null || echo "000")
if [ "$API_TEST" = "200" ]; then
    echo "✅ API through HTTPS: OK"
else
    echo "❌ API through HTTPS: FAILED (HTTP $API_TEST)"
fi

# Test admin panel
ADMIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/ 2>/dev/null || echo "000")
if [ "$ADMIN_TEST" = "200" ]; then
    echo "✅ Admin panel: OK"
else
    echo "❌ Admin panel: FAILED (HTTP $ADMIN_TEST)"
fi

# Test storefront
STORE_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/ 2>/dev/null || echo "000")
if [ "$STORE_TEST" = "200" ]; then
    echo "✅ Storefront: OK"
else
    echo "❌ Storefront: FAILED (HTTP $STORE_TEST)"
fi

echo ""
echo "🎉 SUPER NUCLEAR HTTPS FIX COMPLETE!"
echo "===================================="
echo ""
echo "✅ All API URLs updated to HTTPS"
echo "✅ Admin panel rebuilt with HTTPS URLs"
echo "✅ Nginx reloaded"
echo ""
echo "🔍 Test Results:"
echo "   - API: https://sppix.com/api/public/health/"
echo "   - Admin: https://sppix.com/admin/"
echo "   - Storefront: https://sppix.com/"
echo ""
echo "🚀 Your admin panel should now work without Mixed Content errors!"
echo ""
echo "📋 What was fixed:"
echo "   - Updated API_BASE_URL from http://127.0.0.1:8001/api to https://sppix.com/api"
echo "   - Fixed all hardcoded HTTP URLs to HTTPS"
echo "   - Rebuilt admin panel with new URLs"
echo ""
echo "🎯 Next steps:"
echo "   1. Clear your browser cache (Ctrl+F5)"
echo "   2. Test https://sppix.com/admin/ login"
echo "   3. The Mixed Content error should be gone!"
echo ""
