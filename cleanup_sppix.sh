#!/bin/bash

# SPPIX Cleanup Script for Debian
# This script removes all previous SPPIX installations and configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🧹 SPPIX Cleanup Script${NC}"
echo -e "${RED}======================${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will remove all SPPIX installations and configurations!${NC}"
echo -e "${YELLOW}⚠️  Make sure you have backups of any important data.${NC}"
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Confirmation prompt
read -p "Are you sure you want to clean up all SPPIX installations? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    print_info "Cleanup cancelled."
    exit 0
fi

print_info "Starting SPPIX cleanup..."

# Step 1: Stop all SPPIX services
print_info "Step 1: Stopping SPPIX services..."
sudo systemctl stop sppix-django 2>/dev/null || print_warning "sppix-django service not found"
sudo systemctl stop sppix-asgi 2>/dev/null || print_warning "sppix-asgi service not found"
sudo systemctl stop nginx 2>/dev/null || print_warning "nginx service not found"
sudo systemctl stop mysql 2>/dev/null || print_warning "mysql service not found"
sudo systemctl stop redis-server 2>/dev/null || print_warning "redis-server service not found"
print_status "Services stopped"

# Step 2: Disable services
print_info "Step 2: Disabling SPPIX services..."
sudo systemctl disable sppix-django 2>/dev/null || print_warning "sppix-django service not found"
sudo systemctl disable sppix-asgi 2>/dev/null || print_warning "sppix-asgi service not found"
print_status "Services disabled"

# Step 3: Remove systemd service files
print_info "Step 3: Removing systemd service files..."
sudo rm -f /etc/systemd/system/sppix-django.service
sudo rm -f /etc/systemd/system/sppix-asgi.service
sudo systemctl daemon-reload
print_status "Systemd service files removed"

# Step 4: Remove Nginx configuration
print_info "Step 4: Removing Nginx configuration..."
sudo rm -f /etc/nginx/sites-available/sppix
sudo rm -f /etc/nginx/sites-enabled/sppix
sudo rm -f /etc/nginx/sites-available/sppix-temp
sudo rm -f /etc/nginx/sites-enabled/sppix-temp
print_status "Nginx configuration removed"

# Step 5: Remove project directory
print_info "Step 5: Removing project directory..."
sudo rm -rf /opt/sppix-store
print_status "Project directory removed"

# Step 6: Remove project user
print_info "Step 6: Removing project user..."
sudo userdel -r sppix 2>/dev/null || print_warning "User sppix not found"
print_status "Project user removed"

# Step 7: Remove database
print_info "Step 7: Removing database..."
sudo mysql -e "DROP DATABASE IF EXISTS sppix_store;" 2>/dev/null || print_warning "Database sppix_store not found"
sudo mysql -e "DROP USER IF EXISTS 'sppix_user'@'localhost';" 2>/dev/null || print_warning "User sppix_user not found"
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || print_warning "MySQL not accessible"
print_status "Database removed"

# Step 8: Remove SSL certificates
print_info "Step 8: Removing SSL certificates..."
sudo certbot delete --cert-name sppix.com --non-interactive 2>/dev/null || print_warning "SSL certificate not found"
print_status "SSL certificates removed"

# Step 9: Remove management scripts
print_info "Step 9: Removing management scripts..."
sudo rm -f /opt/sppix_status.sh
sudo rm -f /opt/sppix_restart.sh
sudo rm -f /opt/sppix_logs.sh
sudo rm -f /opt/update_sppix.sh
sudo rm -f /opt/backup_sppix.sh
sudo rm -f /opt/backup_database.sh
sudo rm -f /opt/restore_database.sh
sudo rm -f /opt/monitor_database.sh
sudo rm -f /opt/check_ssl.sh
print_status "Management scripts removed"

# Step 10: Remove cron jobs
print_info "Step 10: Removing cron jobs..."
sudo crontab -l 2>/dev/null | grep -v "sppix\|backup_sppix\|check_ssl" | sudo crontab - 2>/dev/null || print_warning "No cron jobs found"
print_status "Cron jobs removed"

# Step 11: Remove log files
print_info "Step 11: Removing log files..."
sudo rm -rf /opt/sppix-store/logs 2>/dev/null || print_warning "Log directory not found"
sudo rm -f /var/log/nginx/sppix_*.log 2>/dev/null || print_warning "Nginx log files not found"
print_status "Log files removed"

# Step 12: Remove backup directories
print_info "Step 12: Removing backup directories..."
sudo rm -rf /opt/backups/sppix 2>/dev/null || print_warning "Backup directory not found"
sudo rm -rf /opt/backups/database 2>/dev/null || print_warning "Database backup directory not found"
print_status "Backup directories removed"

# Step 13: Reset firewall rules (optional)
print_info "Step 13: Resetting firewall rules..."
read -p "Do you want to reset firewall rules? (yes/no): " reset_firewall
if [ "$reset_firewall" = "yes" ]; then
    sudo ufw --force reset
    sudo ufw --force enable
    sudo ufw allow ssh
    print_status "Firewall rules reset"
else
    print_info "Firewall rules kept as is"
fi

# Step 14: Clean up package installations (optional)
print_info "Step 14: Package cleanup options..."
echo "The following packages were installed for SPPIX:"
echo "- python3.11, python3.11-venv, python3.11-dev"
echo "- nginx, mysql-server, redis-server"
echo "- nodejs, certbot, python3-certbot-nginx"
echo "- ufw, supervisor, htop, nano"
echo ""
read -p "Do you want to remove these packages? (yes/no): " remove_packages
if [ "$remove_packages" = "yes" ]; then
    sudo apt remove -y python3.11 python3.11-venv python3.11-dev python3-pip
    sudo apt remove -y nginx mysql-server redis-server
    sudo apt remove -y nodejs certbot python3-certbot-nginx
    sudo apt remove -y ufw supervisor htop nano
    sudo apt autoremove -y
    print_status "Packages removed"
else
    print_info "Packages kept installed"
fi

# Step 15: Final cleanup
print_info "Step 15: Final cleanup..."
sudo apt autoremove -y
sudo apt autoclean
print_status "System cleanup completed"

echo ""
echo -e "${GREEN}🎉 SPPIX Cleanup Complete!${NC}"
echo -e "${GREEN}==========================${NC}"
echo ""
echo -e "${BLUE}📋 Cleanup Summary:${NC}"
echo -e "   ✅ All SPPIX services stopped and disabled"
echo -e "   ✅ All configuration files removed"
echo -e "   ✅ Project directory removed"
echo -e "   ✅ Database and user removed"
echo -e "   ✅ SSL certificates removed"
echo -e "   ✅ Management scripts removed"
echo -e "   ✅ Log files removed"
echo -e "   ✅ Backup directories removed"
echo ""
echo -e "${BLUE}🔄 Next Steps:${NC}"
echo -e "   1. Upload your project files to /opt/sppix-store"
echo -e "   2. Run: chmod +x deploy_live.sh"
echo -e "   3. Run: ./deploy_live.sh"
echo ""
echo -e "${GREEN}✅ Your system is now clean and ready for a fresh SPPIX deployment!${NC}"
