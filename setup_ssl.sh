#!/bin/bash

# SPPIX SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt for sppix.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="sppix.com"
WWW_DOMAIN="www.sppix.com"
EMAIL="admin@sppix.com"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${BLUE}🔒 Setting up SSL Certificate for $DOMAIN${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily for initial certificate
print_status "Stopping Nginx temporarily..."
systemctl stop nginx

# Create temporary nginx config for certificate validation
print_status "Creating temporary Nginx configuration..."
cat > /etc/nginx/sites-available/sppix-temp << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable temporary site
ln -sf /etc/nginx/sites-available/sppix-temp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/sppix

# Start nginx
print_status "Starting Nginx with temporary configuration..."
systemctl start nginx

# Obtain SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,$WWW_DOMAIN \
    --non-interactive

# Stop nginx again
print_status "Stopping Nginx..."
systemctl stop nginx

# Remove temporary configuration
print_status "Removing temporary configuration..."
rm -f /etc/nginx/sites-enabled/sppix-temp
rm -f /etc/nginx/sites-available/sppix-temp

# Restore main configuration
print_status "Restoring main Nginx configuration..."
ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/

# Test nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

# Start nginx with SSL
print_status "Starting Nginx with SSL..."
systemctl start nginx

# Set up automatic renewal
print_status "Setting up automatic SSL renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Test renewal
print_status "Testing SSL certificate renewal..."
certbot renew --dry-run

# Create SSL status check script
print_status "Creating SSL status check script..."
cat > /opt/check_ssl.sh << 'EOF'
#!/bin/bash
DOMAIN="sppix.com"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 30 ]; then
        echo "⚠️  SSL certificate expires in $DAYS_LEFT days"
        echo "Running renewal..."
        certbot renew --quiet
        systemctl reload nginx
    else
        echo "✅ SSL certificate is valid for $DAYS_LEFT more days"
    fi
else
    echo "❌ SSL certificate not found"
fi
EOF

chmod +x /opt/check_ssl.sh

# Add SSL check to crontab
print_status "Adding SSL check to crontab..."
(crontab -l 2>/dev/null; echo "0 6 * * * /opt/check_ssl.sh") | crontab -

# Test SSL certificate
print_status "Testing SSL certificate..."
sleep 5  # Wait for nginx to start

# Check if certificate is working
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    print_status "SSL certificate is working correctly!"
else
    print_warning "SSL certificate might not be working. Please check manually."
fi

# Display certificate information
print_status "SSL Certificate Information:"
echo ""
openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | grep -A 2 "Validity"
echo ""

# Final status
print_status "SSL setup complete!"
echo ""
echo -e "${BLUE}📋 SSL Configuration Summary:${NC}"
echo -e "   Domain: https://$DOMAIN"
echo -e "   WWW: https://$WWW_DOMAIN"
echo -e "   Certificate Path: /etc/letsencrypt/live/$DOMAIN/"
echo -e "   Auto-renewal: Enabled"
echo -e "   Status Check: /opt/check_ssl.sh"
echo ""
echo -e "${GREEN}🔒 Your site is now secured with SSL!${NC}"
