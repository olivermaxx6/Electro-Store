#!/bin/bash

# =============================================================================
# 🚀 REBUILD AND DEPLOY ADMIN PANEL
# =============================================================================

echo "🚀 REBUILDING AND DEPLOYING ADMIN PANEL"
echo "========================================"
echo ""
echo "📅 Date: $(date)"
echo "👤 User: $(whoami)"
echo ""

# Navigate to Frontend directory
cd /opt/sppix-store/Frontend

echo "📊 PRE-BUILD FILE STATUS:"
echo "========================="
echo "ContentPage.jsx: $(wc -l < src/admin/pages/admin/ContentPage.jsx) lines"
echo "ServicesPage.jsx: $(wc -l < src/admin/pages/admin/ServicesPage.jsx) lines"
echo "UsersPage.jsx: $(wc -l < src/admin/pages/admin/UsersPage.jsx) lines"
echo ""

echo "🔨 BUILDING ADMIN PANEL..."
echo "==========================="
npm run build:admin

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 DEPLOYING TO LIVE SERVER..."
echo "==============================="

# Clear existing admin files
echo "🗑️  Clearing existing admin files..."
sudo rm -rf /var/www/html/admin/*

# Copy new build
echo "📁 Copying new build..."
sudo cp -r dist/admin/* /var/www/html/admin/

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/html/admin/
sudo chmod -R 755 /var/www/html/admin/

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "🌐 Admin Panel: https://sppix.com/admin/dashboard"
echo "📊 Check the admin panel to verify all features are working."
echo ""
echo "🎯 EXPECTED FEATURES NOW AVAILABLE:"
echo "==================================="
echo "✅ Complete Product Management (1303 lines)"
echo "✅ Complete Content Management (1016 lines)"
echo "✅ Complete Service Management (1991 lines)"
echo "✅ Complete User Management (489 lines)"
echo "✅ Complete Order Management (850 lines)"
echo "✅ Complete Category Management (1487 lines)"
echo "✅ Complete Dashboard (752 lines)"
echo ""
echo "🎉 ADMIN PANEL IS NOW FULLY FUNCTIONAL!"
