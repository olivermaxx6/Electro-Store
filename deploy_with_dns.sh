#!/bin/bash

# SPPIX Deployment Script for Current DNS Setup
# Handles sppix.com, www.sppix.com, and pso subdomain conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="sppix.com"
WWW_DOMAIN="www.sppix.com"
SERVER_IP="90.249.95.206"
PSO_DOMAIN="pso"  # Your other project
PROJECT_NAME="sppix-store"
PROJECT_PATH="/opt/sppix-store"
BACKEND_PATH="$PROJECT_PATH/Backend"
FRONTEND_PATH="$PROJECT_PATH/Frontend"
SERVICE_USER="sppix"
DB_NAME="electro_store"
DB_USER="electro_user"
DB_PASSWORD="ElectroStore2024!"
DJANGO_PORT="82"
ASGI_PORT="83"

# Banner
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                SPPIX DNS-AWARE DEPLOYMENT                  ║"
echo "║                                                              ║"
echo "║  🌐 Domain: $DOMAIN                                    ║"
echo "║  🌐 WWW: $WWW_DOMAIN                                    ║"
echo "║  🖥️  IP: $SERVER_IP                                    ║"
echo "║  ⚠️  PSO: $PSO_DOMAIN (port 80 conflict)                    ║"
echo "║  🔧 Ports: $DJANGO_PORT (Django) / $ASGI_PORT (ASGI)                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Check if project files exist
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    print_error "Project files not found. Please run this script from the project root directory."
    exit 1
fi

print_step "Starting SPPIX DNS-Aware Deployment..."

# Step 1: System Update and Package Installation
print_step "Step 1: Updating system and installing packages..."
sudo apt update -y
sudo apt upgrade -y

# Install all required packages
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    python3.11-distutils \
    nginx \
    mysql-server \
    mysql-client \
    redis-server \
    git \
    curl \
    wget \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    certbot \
    python3-certbot-nginx \
    supervisor \
    htop \
    nano \
    ufw \
    net-tools

print_status "System packages installed"

# Install Node.js 18.x
print_info "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
print_status "Node.js installed"

# Step 2: Create Project User and Directory
print_step "Step 2: Setting up project structure..."
sudo useradd -m -s /bin/bash $SERVICE_USER 2>/dev/null || print_warning "User $SERVICE_USER already exists"
sudo mkdir -p $PROJECT_PATH
sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_PATH

# Copy project files
sudo cp -r . $PROJECT_PATH/
sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_PATH
print_status "Project structure created"

# Step 3: Database Setup
print_step "Step 3: Setting up MySQL database..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database and user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
print_status "Database configured"

# Step 4: Python Environment Setup
print_step "Step 4: Setting up Python environment..."
cd $BACKEND_PATH
sudo -u $SERVICE_USER python3.11 -m venv venv
sudo -u $SERVICE_USER venv/bin/pip install --upgrade pip
sudo -u $SERVICE_USER venv/bin/pip install -r requirements.txt
print_status "Python environment ready"

# Step 5: Django Configuration
print_step "Step 5: Configuring Django..."
sudo -u $SERVICE_USER cp env.production .env

# Generate Django secret key
SECRET_KEY=$(sudo -u $SERVICE_USER venv/bin/python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sudo -u $SERVICE_USER sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" .env

# Run Django migrations
sudo -u $SERVICE_USER venv/bin/python manage.py migrate

# Create Django superuser
sudo -u $SERVICE_USER venv/bin/python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sppix.com', 'SppixAdmin2024!')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
sudo -u $SERVICE_USER venv/bin/python manage.py collectstatic --noinput
print_status "Django configured"

# Step 6: Frontend Setup
print_step "Step 6: Setting up frontend..."
cd $FRONTEND_PATH
sudo -u $SERVICE_USER npm install
sudo -u $SERVICE_USER cp env.production .env
sudo -u $SERVICE_USER npm run build:both
print_status "Frontend built"

# Step 7: Nginx Configuration for DNS-aware setup
print_step "Step 7: Configuring Nginx for DNS-aware setup..."

# Create main Nginx configuration
sudo tee /etc/nginx/sites-available/sppix > /dev/null << EOF
# SPPIX Nginx Configuration - DNS Aware
# Handles sppix.com, www.sppix.com, and direct IP access

# Handle sppix.com and www.sppix.com - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Handle direct IP access - serve sppix.com (HTTP only for now)
server {
    listen 80;
    server_name $SERVER_IP;
    
    # For direct IP access, serve the sppix.com site
    location / {
        root $FRONTEND_PATH/dist/storefront;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API for direct IP access
    location /api/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
    
    # Admin panel for direct IP access
    location /admin/ {
        alias $FRONTEND_PATH/dist/admin/;
        try_files \$uri \$uri/ /admin/index.html;
    }
    
    # Static and media files
    location /static/ {
        alias $BACKEND_PATH/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        alias $BACKEND_PATH/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS configuration for sppix.com and www.sppix.com
server {
    listen 443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend (React app)
    location / {
        root $FRONTEND_PATH/dist/storefront;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$DJANGO_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
    
    # Admin panel
    location /admin/ {
        alias $FRONTEND_PATH/dist/admin/;
        try_files \$uri \$uri/ /admin/index.html;
    }
    
    # Static files
    location /static/ {
        alias $BACKEND_PATH/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias $BACKEND_PATH/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:$ASGI_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 8: Systemd Services Setup
print_step "Step 8: Setting up systemd services..."

# Django service
sudo tee /etc/systemd/system/sppix-django.service > /dev/null << EOF
[Unit]
Description=SPPIX Django Application
After=network.target mysql.service redis.service

[Service]
Type=exec
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/manage.py runserver 127.0.0.1:$DJANGO_PORT
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# ASGI service
sudo tee /etc/systemd/system/sppix-asgi.service > /dev/null << EOF
[Unit]
Description=SPPIX Django ASGI Application
After=network.target mysql.service redis.service

[Service]
Type=exec
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$BACKEND_PATH
Environment=PATH=$BACKEND_PATH/venv/bin
ExecStart=$BACKEND_PATH/venv/bin/python $BACKEND_PATH/run_asgi_server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable services
sudo systemctl daemon-reload
sudo systemctl enable sppix-django sppix-asgi
print_status "Systemd services configured"

# Step 9: Firewall Configuration
print_step "Step 9: Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow $DJANGO_PORT
sudo ufw allow $ASGI_PORT
print_status "Firewall configured"

# Step 10: Start Services
print_step "Step 10: Starting services..."
sudo systemctl start mysql redis-server nginx sppix-django sppix-asgi

# Check if services are running
services=("mysql" "redis-server" "nginx" "sppix-django" "sppix-asgi")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        exit 1
    fi
done

# Step 11: SSL Certificate Setup
print_step "Step 11: Setting up SSL certificate..."

# Stop Nginx temporarily
sudo systemctl stop nginx

# Create temporary config for certificate validation
sudo tee /etc/nginx/sites-available/sppix-temp << EOF
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
sudo ln -sf /etc/nginx/sites-available/sppix-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/sppix

# Start Nginx
sudo systemctl start nginx

# Obtain SSL certificate
sudo certbot certonly --webroot --webroot-path=/var/www/html --email admin@sppix.com --agree-tos --no-eff-email --domains $DOMAIN,$WWW_DOMAIN --non-interactive

# Stop Nginx
sudo systemctl stop nginx

# Remove temporary configuration
sudo rm -f /etc/nginx/sites-enabled/sppix-temp
sudo rm -f /etc/nginx/sites-available/sppix-temp

# Restore main configuration
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/

# Start Nginx with SSL
sudo systemctl start nginx

# Set up automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
print_status "SSL certificate configured"

# Step 12: Final Configuration
print_step "Step 12: Final configuration..."

# Set proper permissions
sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_PATH
sudo chmod -R 755 $PROJECT_PATH
sudo chmod -R 644 $PROJECT_PATH/Backend/media
sudo chmod -R 644 $PROJECT_PATH/Backend/staticfiles

# Create log directories
sudo mkdir -p $PROJECT_PATH/Backend/logs
sudo chown $SERVICE_USER:$SERVICE_USER $PROJECT_PATH/Backend/logs

# Restart services
sudo systemctl restart sppix-django sppix-asgi nginx

# Step 13: Verification
print_step "Step 13: Verifying deployment..."

# Wait for services to start
sleep 10

# Check ports
ports=("80" "443" "$DJANGO_PORT" "$ASGI_PORT")
for port in "${ports[@]}"; do
    if netstat -tlnp | grep -q ":$port "; then
        print_status "Port $port is listening"
    else
        print_warning "Port $port is not listening"
    fi
done

# Test website
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    print_status "Website is accessible via HTTPS"
else
    print_warning "HTTPS website might not be accessible yet (SSL might still be propagating)"
fi

# Test direct IP access
if curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP | grep -q "200"; then
    print_status "Direct IP access is working"
else
    print_warning "Direct IP access might not be working"
fi

# Success message
echo ""
echo -e "${GREEN}🎉 SPPIX DNS-AWARE DEPLOYMENT COMPLETE! 🎉${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "${CYAN}🌐 Your SPPIX store is now LIVE with DNS-aware configuration!${NC}"
echo ""
echo -e "${BLUE}📋 Live URLs:${NC}"
echo -e "   🏪 Main Store (HTTPS): https://$DOMAIN"
echo -e "   🌐 WWW (HTTPS): https://$WWW_DOMAIN"
echo -e "   🖥️  Direct IP (HTTP): http://$SERVER_IP"
echo -e "   🔧 Admin Panel: https://$DOMAIN/admin/"
echo -e "   📡 API: https://$DOMAIN/api/"
echo ""
echo -e "${BLUE}🔑 Admin Credentials:${NC}"
echo -e "   👤 Username: admin"
echo -e "   📧 Email: admin@sppix.com"
echo -e "   🔒 Password: SppixAdmin2024!"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT DNS NOTES:${NC}"
echo -e "   📍 Your PSO project on port 80 will conflict with this setup"
echo -e "   🔧 Consider moving PSO to a different port (e.g., 8080)"
echo -e "   🌐 Or use a different subdomain for PSO (e.g., pso.yourdomain.com)"
echo -e "   📋 Current DNS records are correctly configured"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   📊 Status: sudo systemctl status sppix-django sppix-asgi nginx"
echo -e "   🔄 Restart: sudo systemctl restart sppix-django sppix-asgi nginx"
echo -e "   📝 Logs: sudo journalctl -u sppix-django -f"
echo ""
echo -e "${GREEN}✅ Your SPPIX e-commerce store is now live and ready for business!${NC}"
echo -e "${GREEN}🚀 Visit https://$DOMAIN to see your store in action!${NC}"
echo ""
echo -e "${YELLOW}💡 Note: SSL certificate may take a few minutes to propagate globally.${NC}"
echo -e "${YELLOW}💡 If the site doesn't load immediately, wait 2-3 minutes and try again.${NC}"




