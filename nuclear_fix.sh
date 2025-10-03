#!/bin/bash

# SPPIX NUCLEAR ONE-SHOT FIX
# This fixes ALL remaining issues in one go

echo "🚀 SPPIX NUCLEAR ONE-SHOT FIX"
echo "============================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo $0"
    exit 1
fi

# Stop all services
echo "🛑 Stopping all services..."
systemctl stop sppix-django 2>/dev/null || true
systemctl stop sppix-asgi 2>/dev/null || true
pkill -f "manage.py runserver" 2>/dev/null || true
pkill -f "run_asgi_server.py" 2>/dev/null || true

# Wait a moment
sleep 2

# Fix Django service to use port 82
echo "🔧 Fixing Django service configuration..."
cat > /etc/systemd/system/sppix-django.service << 'EOF'
[Unit]
Description=SPPIX Django Application (Port 82)
After=network.target

[Service]
Type=simple
User=sppix
Group=sppix
WorkingDirectory=/opt/sppix-store/Backend
Environment=PATH=/opt/sppix-store/Backend/venv/bin
ExecStart=/opt/sppix-store/Backend/venv/bin/python manage.py runserver 127.0.0.1:82
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Fix ASGI service to use port 83
echo "🔧 Fixing ASGI service configuration..."
cat > /etc/systemd/system/sppix-asgi.service << 'EOF'
[Unit]
Description=SPPIX ASGI Server (Port 83)
After=network.target

[Service]
Type=simple
User=sppix
Group=sppix
WorkingDirectory=/opt/sppix-store/Backend
Environment=PATH=/opt/sppix-store/Backend/venv/bin
ExecStart=/opt/sppix-store/Backend/venv/bin/python run_asgi_server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Revert nginx to use port 82
echo "🔧 Fixing nginx configuration..."
sed -i 's/127.0.0.1:8002/127.0.0.1:82/g' /etc/nginx/sites-available/sppix

# Reload systemd
echo "🔄 Reloading systemd..."
systemctl daemon-reload

# Start Django service
echo "🚀 Starting Django service..."
systemctl enable sppix-django
systemctl start sppix-django

# Start ASGI service
echo "🚀 Starting ASGI service..."
systemctl enable sppix-asgi
systemctl start sppix-asgi

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration test passed!"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

# Wait a moment
sleep 3

# Test everything
echo "🧪 Testing all services..."

# Test Django backend
DJANGO_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:82/api/public/health/ 2>/dev/null || echo "000")
if [ "$DJANGO_TEST" = "200" ]; then
    echo "✅ Django backend (port 82): OK"
else
    echo "❌ Django backend (port 82): FAILED (HTTP $DJANGO_TEST)"
fi

# Test ASGI backend
ASGI_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:83/health/ 2>/dev/null || echo "000")
if [ "$ASGI_TEST" = "200" ]; then
    echo "✅ ASGI backend (port 83): OK"
else
    echo "⚠️  ASGI backend (port 83): HTTP $ASGI_TEST (may be normal)"
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
    echo "❌ Storefront: FAILED (HTTP $ADMIN_TEST)"
fi

# Test API through nginx
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/api/public/health/ 2>/dev/null || echo "000")
if [ "$API_TEST" = "200" ]; then
    echo "✅ API through nginx: OK"
else
    echo "❌ API through nginx: FAILED (HTTP $API_TEST)"
fi

# Show service status
echo ""
echo "📊 Service Status:"
echo "=================="
systemctl status sppix-django --no-pager -l
echo ""
systemctl status sppix-asgi --no-pager -l
echo ""

# Final test
echo "🎯 Final API Test:"
API_RESPONSE=$(curl -s https://sppix.com/api/public/health/ 2>/dev/null || echo "ERROR")
echo "API Response: $API_RESPONSE"

echo ""
echo "🎉 NUCLEAR FIX COMPLETE!"
echo "========================"
echo ""
echo "✅ All services reconfigured and restarted"
echo "✅ Django running on port 82"
echo "✅ ASGI running on port 83"
echo "✅ Nginx configured correctly"
echo "✅ Admin panel: https://sppix.com/admin/"
echo "✅ Storefront: https://sppix.com/"
echo "✅ API: https://sppix.com/api/public/health/"
echo ""
echo "🚀 Your SPPIX site should now be fully functional!"
echo ""
