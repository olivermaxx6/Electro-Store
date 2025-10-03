#!/bin/bash

# Quick Fix for Django Settings Syntax Error
# This script directly fixes the unterminated string literal issue

echo "🔧 Quick Fix for Django Settings Syntax Error"
echo "============================================="

# Navigate to the backend directory
cd /opt/sppix-store/Backend

# Backup the current settings file
echo "📁 Backing up current settings.py..."
sudo cp core/settings.py core/settings.py.backup.$(date +%Y%m%d_%H%M%S)

# Fix the problematic line using sed
echo "🔧 Fixing line 23 in settings.py..."
sudo sed -i '23s/.*/STRIPE_SECRET_KEY = "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"/' core/settings.py

# Verify the fix
echo "✅ Verifying Python syntax..."
if sudo -u sppix venv/bin/python -m py_compile core/settings.py; then
    echo "✅ Python syntax is now valid!"
else
    echo "❌ Syntax error still exists"
    exit 1
fi

# Test Django configuration
echo "🔍 Testing Django configuration..."
if sudo -u sppix venv/bin/python manage.py check; then
    echo "✅ Django configuration is valid!"
else
    echo "❌ Django configuration error"
    exit 1
fi

# Run migrations
echo "🔄 Running migrations..."
sudo -u sppix venv/bin/python manage.py migrate

# Collect static files
echo "📦 Collecting static files..."
sudo -u sppix venv/bin/python manage.py collectstatic --noinput

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart sppix-django sppix-asgi

# Check service status
echo "📊 Checking service status..."
if sudo systemctl is-active --quiet sppix-django; then
    echo "✅ sppix-django is running"
else
    echo "❌ sppix-django failed to start"
fi

if sudo systemctl is-active --quiet sppix-asgi; then
    echo "✅ sppix-asgi is running"
else
    echo "❌ sppix-asgi failed to start"
fi

echo ""
echo "🎉 Fix Complete!"
echo "================"
echo "✅ Django settings syntax error has been fixed"
echo "✅ Services have been restarted"
echo "🌐 Your application should now be working at: https://sppix.com"
echo ""
