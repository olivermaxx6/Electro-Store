#!/bin/bash

# SPPIX Super Quick Deploy - Ultra Simple Version
# Just run: ./quick_live.sh

echo "🚀 SPPIX Super Quick Deploy"
echo "=========================="
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ Don't run as root. Use: sudo -u yourusername ./quick_live.sh"
   exit 1
fi

echo "📦 Installing packages..."
sudo apt update -y
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip nginx mysql-server redis-server curl wget git certbot python3-certbot-nginx ufw

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "👤 Creating user..."
sudo useradd -m -s /bin/bash sppix 2>/dev/null || echo "User exists"
sudo mkdir -p /opt/sppix-store
sudo chown -R sppix:sppix /opt/sppix-store

echo "📁 Copying project..."
sudo cp -r . /opt/sppix-store/
sudo chown -R sppix:sppix /opt/sppix-store

echo "🗄️ Setting up database..."
sudo systemctl start mysql
sudo mysql -e "CREATE DATABASE sppix_store; CREATE USER 'sppix_user'@'localhost' IDENTIFIED BY 'SppixStore2024!'; GRANT ALL PRIVILEGES ON sppix_store.* TO 'sppix_user'@'localhost';"

echo "🐍 Setting up Python..."
cd /opt/sppix-store/Backend
sudo -u sppix python3.11 -m venv venv
sudo -u sppix venv/bin/pip install -r requirements.txt

echo "⚙️ Configuring Django..."
sudo -u sppix cp env.production .env
sudo -u sppix venv/bin/python manage.py migrate
sudo -u sppix venv/bin/python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@sppix.com', 'SppixAdmin2024!') if not User.objects.filter(username='admin').exists() else None"
sudo -u sppix venv/bin/python manage.py collectstatic --noinput

echo "🎨 Building frontend..."
cd ../Frontend
sudo -u sppix npm install
sudo -u sppix cp env.production .env
sudo -u sppix npm run build:both

echo "🌐 Configuring Nginx..."
cd /opt/sppix-store
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "🔧 Setting up services..."
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sppix-django sppix-asgi

echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 82
sudo ufw allow 83

echo "🚀 Starting services..."
sudo systemctl start mysql redis-server nginx sppix-django sppix-asgi

echo "🔒 Setting up SSL..."
sudo systemctl stop nginx
sudo tee /etc/nginx/sites-available/sppix-temp << EOF
server {
    listen 80;
    server_name sppix.com www.sppix.com;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 200 'SSL setup...'; add_header Content-Type text/plain; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/sppix-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/sppix
sudo systemctl start nginx
sudo certbot certonly --webroot --webroot-path=/var/www/html --email admin@sppix.com --agree-tos --no-eff-email --domains sppix.com,www.sppix.com --non-interactive
sudo systemctl stop nginx
sudo rm -f /etc/nginx/sites-enabled/sppix-temp
sudo rm -f /etc/nginx/sites-available/sppix-temp
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo systemctl start nginx
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "🌐 Your store is live at: https://sppix.com"
echo "🔧 Admin panel: https://sppix.com/admin/"
echo "👤 Username: admin"
echo "🔒 Password: SppixAdmin2024!"
echo ""
echo "✅ SPPIX is now live and ready for business!"
