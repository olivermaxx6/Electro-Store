#!/bin/bash

echo "🚨 CRITICAL FIXES - PERMISSION & PRODUCTS PAGE"
echo "==============================================="

# 1. Fix permission issues
echo "1. 🔐 Fixing permission issues..."
sudo chown -R hassan:hassan /var/www/html/admin/
sudo chmod -R 755 /var/www/html/admin/
sudo rm -rf /var/www/html/admin/*
echo "   ✅ Permissions fixed"

# 2. Rebuild admin panel
echo "2. 🔄 Rebuilding admin panel..."
cd /opt/sppix-store/Frontend
npm run build:admin

# 3. Copy with proper permissions
echo "3. 📦 Copying files with proper permissions..."
sudo cp -r dist/* /var/www/html/admin/
sudo chown -R www-data:www-data /var/www/html/admin/
sudo chmod -R 755 /var/www/html/admin/

# 4. Restart services
echo "4. 🔄 Restarting services..."
sudo systemctl reload nginx

echo ""
echo "✅ PERMISSIONS FIXED!"
echo "⚠️  CRITICAL: ProductsPage.jsx still needs to be replaced"
echo "📊 Current size: $(wc -l /opt/sppix-store/Frontend/src/admin/pages/admin/ProductsPage.jsx | awk '{print $1}') lines"
echo "🎯 Target size: 1300+ lines"
echo ""
echo "📋 TO COMPLETE THE FIX:"
echo "1. Open your local file: d:\Electro-Store\Frontend\src\admin\pages\admin\ProductsPage.jsx"
echo "2. Copy all content (Ctrl+A, Ctrl+C)"
echo "3. On server run: nano /opt/sppix-store/Frontend/src/admin/pages/admin/ProductsPage.jsx"
echo "4. Replace all content (Ctrl+A, then paste)"
echo "5. Save (Ctrl+X, Y, Enter)"
echo "6. Run: cd /opt/sppix-store/Frontend && npm run build:admin"
echo "7. Run: sudo cp -r dist/* /var/www/html/admin/"
echo ""
echo "🌐 Then test: https://sppix.com/admin/products"
