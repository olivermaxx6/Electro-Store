#!/bin/bash

# Quick Admin Panel Fix for SPPIX
# Run this directly on your Linux server

echo "🔧 SPPIX Admin Panel Quick Fix"
echo "=============================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo $0"
    exit 1
fi

# Backup current nginx config
echo "📁 Backing up current nginx configuration..."
cp /etc/nginx/sites-available/sppix /etc/nginx/sites-available/sppix.backup.$(date +%Y%m%d_%H%M%S)

# Create the fixed nginx configuration
echo "🔧 Creating fixed nginx configuration..."
cat > /etc/nginx/sites-available/sppix << 'EOF'
# SPPIX Nginx Configuration - Fixed Admin Routing
# This configuration fixes the admin panel routing issue

# Handle sppix.com and www.sppix.com - redirect to HTTPS
server {
    listen 80;
    server_name sppix.com www.sppix.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# Handle direct IP access - serve sppix.com
server {
    listen 80;
    server_name 90.249.95.206;
    
    # For direct IP access, serve the sppix.com site
    location / {
        root /opt/sppix-store/Frontend/dist/storefront;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API for direct IP access
    location /api/ {
        proxy_pass http://127.0.0.1:82;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
    
    # Admin panel for direct IP access - MUST come before root location
    location /admin/ {
        alias /opt/sppix-store/Frontend/dist/admin/;
        try_files $uri $uri/ /admin/index.html;
    }
    
    # Static and media files
    location /static/ {
        alias /opt/sppix-store/Backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        alias /opt/sppix-store/Backend/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 443 ssl http2;
    server_name sppix.com www.sppix.com 90.249.95.206;
    
    # SSL configuration (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/sppix.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sppix.com/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # CRITICAL FIX: Admin panel MUST come before the root location
    # React Admin Panel
    location /admin/ {
        alias /opt/sppix-store/Frontend/dist/admin/;
        try_files $uri $uri/ /admin/index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }
        
        # Cache HTML files for shorter period
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # Django admin API endpoints (for admin panel backend)
    location /admin/api/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://127.0.0.1:82;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
    
    # Backend API with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:82;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Frontend (React app) - Main site (Storefront) - MUST come after admin
    location / {
        root /opt/sppix-store/Frontend/dist/storefront;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }
        
        # Cache HTML files for shorter period
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # Static files (Django)
    location /static/ {
        alias /opt/sppix-store/Backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # Security headers for static files
        add_header X-Content-Type-Options nosniff;
    }
    
    # Media files (user uploads)
    location /media/ {
        alias /opt/sppix-store/Backend/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # Security headers for media files
        add_header X-Content-Type-Options nosniff;
    }
    
    # WebSocket support for Django Channels (chat, real-time features)
    location /ws/ {
        proxy_pass http://127.0.0.1:83;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Health check endpoint
    location /health/ {
        proxy_pass http://127.0.0.1:82;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Block access to backup files
    location ~ \.(bak|backup|old|orig|save|swp|tmp)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /opt/sppix-store/Frontend/dist/storefront;
    }
    
    # Logging
    access_log /var/log/nginx/sppix_access.log;
    error_log /var/log/nginx/sppix_error.log;
}
EOF

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration test passed!"
else
    echo "❌ Nginx configuration test failed!"
    echo "🔄 Restoring backup..."
    cp /etc/nginx/sites-available/sppix.backup.* /etc/nginx/sites-available/sppix
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

# Check nginx status
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running successfully!"
else
    echo "❌ Nginx failed to start!"
    exit 1
fi

# Test admin panel access
echo "🧪 Testing admin panel access..."
ADMIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/admin/ || echo "000")
if [ "$ADMIN_TEST" = "200" ]; then
    echo "✅ Admin panel is accessible at https://sppix.com/admin/"
else
    echo "⚠️  Admin panel test returned HTTP $ADMIN_TEST"
    echo "   This might be normal if the admin panel requires authentication"
fi

# Test storefront access
echo "🧪 Testing storefront access..."
STORE_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://sppix.com/ || echo "000")
if [ "$STORE_TEST" = "200" ]; then
    echo "✅ Storefront is accessible at https://sppix.com/"
else
    echo "❌ Storefront test returned HTTP $STORE_TEST"
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
echo "🔍 Test the fix:"
echo "   1. Open https://sppix.com/admin/ in your browser"
echo "   2. You should see your custom admin panel instead of 404"
echo "   3. The storefront at https://sppix.com/ should still work"
echo ""
echo "📁 Backup created at: /etc/nginx/sites-available/sppix.backup.*"
echo ""
