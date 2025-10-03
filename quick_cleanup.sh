#!/bin/bash

# SPPIX Quick Cleanup Script
# Removes previous installations quickly

echo "🧹 SPPIX Quick Cleanup"
echo "======================"
echo ""

# Stop services
echo "Stopping services..."
sudo systemctl stop sppix-django sppix-asgi nginx mysql redis-server 2>/dev/null || true

# Disable services
echo "Disabling services..."
sudo systemctl disable sppix-django sppix-asgi 2>/dev/null || true

# Remove service files
echo "Removing service files..."
sudo rm -f /etc/systemd/system/sppix-django.service
sudo rm -f /etc/systemd/system/sppix-asgi.service
sudo systemctl daemon-reload

# Remove Nginx config
echo "Removing Nginx configuration..."
sudo rm -f /etc/nginx/sites-available/sppix
sudo rm -f /etc/nginx/sites-enabled/sppix
sudo rm -f /etc/nginx/sites-available/sppix-temp
sudo rm -f /etc/nginx/sites-enabled/sppix-temp

# Remove project directory
echo "Removing project directory..."
sudo rm -rf /opt/sppix-store

# Remove user
echo "Removing project user..."
sudo userdel -r sppix 2>/dev/null || true

# Remove database
echo "Removing database..."
sudo mysql -e "DROP DATABASE IF EXISTS sppix_store; DROP USER IF EXISTS 'sppix_user'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null || true

# Remove SSL certificates
echo "Removing SSL certificates..."
sudo certbot delete --cert-name sppix.com --non-interactive 2>/dev/null || true

# Remove management scripts
echo "Removing management scripts..."
sudo rm -f /opt/sppix_*.sh
sudo rm -f /opt/backup_*.sh
sudo rm -f /opt/monitor_*.sh
sudo rm -f /opt/check_*.sh

# Remove backups
echo "Removing backups..."
sudo rm -rf /opt/backups/sppix
sudo rm -rf /opt/backups/database

echo ""
echo "✅ Cleanup complete!"
echo "Your system is now clean and ready for fresh deployment."
echo ""
echo "Next steps:"
echo "1. Upload your project files"
echo "2. Run: chmod +x deploy_live.sh"
echo "3. Run: ./deploy_live.sh"
