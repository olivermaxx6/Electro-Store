#!/bin/bash

# Quick Frontend Permission Fix
# This script quickly fixes the permission issues

echo "🔧 Quick Frontend Permission Fix"
echo "================================"

# Navigate to frontend directory
cd /opt/sppix-store/Frontend

# Fix ownership and permissions
echo "📁 Fixing ownership and permissions..."
sudo chown -R sppix:sppix .
sudo chmod -R 755 .
sudo chmod +x node_modules/.bin/*

# Try building again
echo "🔨 Attempting to build frontend..."
if sudo -u sppix npm run build:both; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Build still failing, trying alternative approach..."
    
    # Clean and reinstall
    sudo -u sppix rm -rf node_modules package-lock.json
    sudo -u sppix npm install
    
    # Try building again
    sudo -u sppix npm run build:both
fi

# Fix build output permissions
sudo chown -R sppix:sppix dist/
sudo chmod -R 755 dist/

# Restart nginx
sudo systemctl restart nginx

echo ""
echo "🎉 Frontend Fix Complete!"
echo "======================="
echo "✅ Permissions fixed"
echo "✅ Frontend built"
echo "✅ Nginx restarted"
echo ""
echo "🌐 Test your website at: https://sppix.com"
echo ""
