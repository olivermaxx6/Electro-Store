#!/bin/bash

# SPPIX Complete Deployment Automation Script
# This script automates the entire deployment process for GoDaddy VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="sppix.com"
WWW_DOMAIN="www.sppix.com"
SERVER_IP="90.249.95.206"
PROJECT_NAME="sppix-store"
PROJECT_PATH="/opt/sppix-store"
SERVICE_USER="sppix"
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

echo -e "${BLUE}🚀 SPPIX Complete Deployment Automation${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo -e "${BLUE}Server IP: $SERVER_IP${NC}"
echo -e "${BLUE}Project Path: $PROJECT_PATH${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Function to run a script with error handling
run_script() {
    local script_name="$1"
    local script_path="$2"
    
    print_step "Running $script_name..."
    
    if [ -f "$script_path" ]; then
        chmod +x "$script_path"
        if bash "$script_path"; then
            print_status "$script_name completed successfully"
        else
            print_error "$script_name failed"
            exit 1
        fi
    else
        print_error "$script_name not found at $script_path"
        exit 1
    fi
}

# Pre-deployment checks
print_step "Performing pre-deployment checks..."

# Check if domain resolves to this server
print_info "Checking domain resolution..."
if nslookup $DOMAIN | grep -q $SERVER_IP; then
    print_status "Domain $DOMAIN resolves to $SERVER_IP"
else
    print_warning "Domain $DOMAIN does not resolve to $SERVER_IP. Please check DNS settings."
fi

# Check if required files exist
required_files=(
    "deploy_to_godaddy.sh"
    "nginx_sppix.conf"
    "sppix-django.service"
    "sppix-asgi.service"
    "setup_ssl.sh"
    "setup_database.sh"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found"
        exit 1
    fi
done

print_status "All required files found"

# Step 1: Run main deployment script
print_step "Step 1: Running main deployment script..."
run_script "Main Deployment" "./deploy_to_godaddy.sh"

# Step 2: Set up database
print_step "Step 2: Setting up database..."
run_script "Database Setup" "./setup_database.sh"

# Step 3: Set up SSL certificate
print_step "Step 3: Setting up SSL certificate..."
run_script "SSL Setup" "./setup_ssl.sh"

# Step 4: Configure Nginx
print_step "Step 4: Configuring Nginx..."
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_info "Testing Nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 5: Set up systemd services
print_step "Step 5: Setting up systemd services..."
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/
sudo systemctl daemon-reload

# Step 6: Start all services
print_step "Step 6: Starting all services..."
services=("mysql" "redis-server" "nginx" "sppix-django" "sppix-asgi")

for service in "${services[@]}"; do
    print_info "Starting $service..."
    sudo systemctl enable $service
    sudo systemctl start $service
    
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is running"
    else
        print_error "$service failed to start"
        exit 1
    fi
done

# Step 7: Final configuration
print_step "Step 7: Final configuration..."

# Set proper permissions
print_info "Setting proper permissions..."
sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_PATH
sudo chmod -R 755 $PROJECT_PATH
sudo chmod -R 644 $PROJECT_PATH/Backend/media
sudo chmod -R 644 $PROJECT_PATH/Backend/staticfiles

# Create log directories
sudo mkdir -p $PROJECT_PATH/Backend/logs
sudo chown $SERVICE_USER:$SERVICE_USER $PROJECT_PATH/Backend/logs

# Step 8: Health checks
print_step "Step 8: Performing health checks..."

# Check if services are running
print_info "Checking service status..."
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_status "$service is active"
    else
        print_error "$service is not active"
    fi
done

# Check if ports are listening
print_info "Checking port status..."
ports=("80" "443" "82" "83")

for port in "${ports[@]}"; do
    if netstat -tlnp | grep -q ":$port "; then
        print_status "Port $port is listening"
    else
        print_warning "Port $port is not listening"
    fi
done

# Test HTTP/HTTPS connectivity
print_info "Testing HTTP connectivity..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "301\|302"; then
    print_status "HTTP redirect is working"
else
    print_warning "HTTP redirect might not be working"
fi

print_info "Testing HTTPS connectivity..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    print_status "HTTPS is working"
else
    print_warning "HTTPS might not be working"
fi

# Step 9: Create management scripts
print_step "Step 9: Creating management scripts..."

# Create status check script
print_info "Creating status check script..."
sudo tee /opt/sppix_status.sh > /dev/null << EOF
#!/bin/bash
echo "=== SPPIX System Status ==="
echo ""

echo "Service Status:"
systemctl status sppix-django sppix-asgi nginx mysql redis-server --no-pager -l
echo ""

echo "Port Status:"
netstat -tlnp | grep -E ":(80|443|82|83) "
echo ""

echo "Disk Usage:"
df -h /opt/sppix-store
echo ""

echo "Memory Usage:"
free -h
echo ""

echo "SSL Certificate Status:"
/opt/check_ssl.sh
echo ""

echo "Database Status:"
/opt/monitor_database.sh
EOF

sudo chmod +x /opt/sppix_status.sh

# Create restart script
print_info "Creating restart script..."
sudo tee /opt/sppix_restart.sh > /dev/null << EOF
#!/bin/bash
echo "Restarting SPPIX services..."
systemctl restart sppix-django sppix-asgi
systemctl reload nginx
echo "SPPIX services restarted!"
EOF

sudo chmod +x /opt/sppix_restart.sh

# Create log viewer script
print_info "Creating log viewer script..."
sudo tee /opt/sppix_logs.sh > /dev/null << EOF
#!/bin/bash
echo "=== SPPIX Logs ==="
echo ""
echo "Django Logs:"
journalctl -u sppix-django --no-pager -l -n 50
echo ""
echo "ASGI Logs:"
journalctl -u sppix-asgi --no-pager -l -n 50
echo ""
echo "Nginx Access Logs:"
tail -n 20 /var/log/nginx/sppix_access.log
echo ""
echo "Nginx Error Logs:"
tail -n 20 /var/log/nginx/sppix_error.log
echo ""
echo "Application Logs:"
tail -n 20 /opt/sppix-store/Backend/logs/django.log
EOF

sudo chmod +x /opt/sppix_logs.sh

# Step 10: Final verification
print_step "Step 10: Final verification..."

# Wait for services to fully start
print_info "Waiting for services to fully start..."
sleep 10

# Final status check
print_info "Performing final status check..."
/opt/sppix_status.sh

# Success message
echo ""
echo -e "${GREEN}🎉 SPPIX Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   🌐 Website: https://$DOMAIN"
echo -e "   🌐 WWW: https://$WWW_DOMAIN"
echo -e "   🌐 IP: https://$SERVER_IP"
echo -e "   🔧 Admin: https://$DOMAIN/admin/"
echo -e "   📡 API: https://$DOMAIN/api/"
echo ""
echo -e "${BLUE}🔑 Admin Credentials:${NC}"
echo -e "   👤 Username: admin"
echo -e "   📧 Email: admin@sppix.com"
echo -e "   🔒 Password: SppixAdmin2024!"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   📊 Status: sudo /opt/sppix_status.sh"
echo -e "   🔄 Restart: sudo /opt/sppix_restart.sh"
echo -e "   📝 Logs: sudo /opt/sppix_logs.sh"
echo -e "   🔄 Update: sudo /opt/update_sppix.sh"
echo -e "   💾 Backup: sudo /opt/backup_sppix.sh"
echo -e "   🗄️  DB Backup: sudo /opt/backup_database.sh"
echo -e "   🔒 SSL Check: sudo /opt/check_ssl.sh"
echo ""
echo -e "${BLUE}📁 Important Paths:${NC}"
echo -e "   📂 Project: $PROJECT_PATH"
echo -e "   📂 Logs: $PROJECT_PATH/Backend/logs/"
echo -e "   📂 Media: $PROJECT_PATH/Backend/media/"
echo -e "   📂 Static: $PROJECT_PATH/Backend/staticfiles/"
echo ""
echo -e "${GREEN}✅ Your SPPIX store is now live and ready for business!${NC}"
echo -e "${GREEN}🚀 Visit https://$DOMAIN to see your store in action!${NC}"
