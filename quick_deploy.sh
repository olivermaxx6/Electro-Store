# Quick Deploy Script for GoDaddy VPS
# Run this script on your GoDaddy VPS after uploading files

#!/bin/bash

echo "🚀 Starting SPPIX Deployment on GoDaddy VPS (Port 82)"
echo "=================================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Make all scripts executable
echo "📝 Making scripts executable..."
chmod +x deploy_complete.sh
chmod +x deploy_to_godaddy.sh
chmod +x setup_database.sh
chmod +x setup_ssl.sh

# Run the complete deployment
echo "🚀 Running complete deployment..."
./deploy_complete.sh

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your SPPIX store is now live at: https://sppix.com"
echo "🔧 Admin panel: https://sppix.com/admin/"
echo "📊 Check status: sudo /opt/sppix_status.sh"
