# SPPIX Debian Deployment Guide
# Complete step-by-step guide to deploy SPPIX on Debian VPS

## 🐧 Debian System Requirements

### **Minimum Requirements:**
- **OS**: Debian 11 (Bullseye) or Debian 12 (Bookworm)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum, 50GB recommended
- **CPU**: 2 cores minimum
- **Network**: Public IP with domain pointing to it

### **Your Configuration:**
- **Domain**: sppix.com
- **WWW**: www.sppix.com
- **IP**: 90.249.95.206
- **Django Port**: 82
- **ASGI Port**: 83

## 📋 Pre-Deployment Checklist

### **1. Domain DNS Configuration**
Ensure your domain DNS records point to your Debian VPS:
```bash
# Check DNS resolution
nslookup sppix.com
nslookup www.sppix.com

# Should return: 90.249.95.206
```

### **2. VPS Access**
Make sure you have SSH access to your Debian VPS:
```bash
ssh root@90.249.95.206
# or
ssh your-username@90.249.95.206
```

## 🚀 Step-by-Step Deployment

### **Step 1: Initial System Update**

```bash
# Update package lists
sudo apt update

# Upgrade system packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### **Step 2: Install Required Software**

#### **Install Python 3.11**
```bash
# Add deadsnakes PPA for Python 3.11
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update

# Install Python 3.11 and development tools
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip python3.11-distutils

# Make Python 3.11 the default python3
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
```

#### **Install Node.js 18.x**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### **Install MySQL Server**
```bash
# Install MySQL
sudo apt install -y mysql-server mysql-client

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

#### **Install Redis**
```bash
# Install Redis
sudo apt install -y redis-server

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### **Install Nginx**
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### **Install SSL Tools**
```bash
# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

#### **Install Additional Tools**
```bash
# Install additional useful packages
sudo apt install -y htop nano ufw supervisor
```

### **Step 3: Upload Your Project**

#### **Option A: Using SCP (from your local machine)**
```bash
# From your local machine (Windows)
scp -r D:\Electro-Store root@90.249.95.206:/opt/sppix-store
```

#### **Option B: Using Git (if your project is in a repository)**
```bash
# On your Debian VPS
cd /opt
sudo git clone your-repository-url sppix-store
sudo chown -R $USER:$USER sppix-store
```

#### **Option C: Using WinSCP or FileZilla**
- Connect to your VPS using SFTP
- Upload the entire Electro-Store folder to `/opt/sppix-store`

### **Step 4: Set Up Project Structure**

```bash
# Navigate to project directory
cd /opt/sppix-store

# Create project user
sudo useradd -m -s /bin/bash sppix
sudo usermod -aG sudo sppix

# Set proper ownership
sudo chown -R sppix:sppix /opt/sppix-store

# Switch to project user
sudo su - sppix
cd /opt/sppix-store
```

### **Step 5: Set Up Python Environment**

```bash
# Create virtual environment
python3.11 -m venv Backend/venv

# Activate virtual environment
source Backend/venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r Backend/requirements.txt
```

### **Step 6: Set Up Database**

```bash
# Create database and user
sudo mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS sppix_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'sppix_user'@'localhost' IDENTIFIED BY 'SppixStore2024!';
GRANT ALL PRIVILEGES ON sppix_store.* TO 'sppix_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Test database connection
mysql -u sppix_user -p'SppixStore2024!' sppix_store -e "SHOW TABLES;"
```

### **Step 7: Configure Django**

```bash
# Copy production environment file
cp Backend/env.production Backend/.env

# Generate Django secret key
SECRET_KEY=$(python Backend/manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
sed -i "s/your-super-secret-key-here-generate-a-new-one/$SECRET_KEY/" Backend/.env

# Run Django migrations
python Backend/manage.py migrate

# Create Django superuser
python Backend/manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sppix.com', 'SppixAdmin2024!')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Collect static files
python Backend/manage.py collectstatic --noinput
```

### **Step 8: Set Up Frontend**

```bash
# Install Node.js dependencies
cd Frontend
npm install

# Copy production environment
cp env.production .env

# Build frontend for production
npm run build:both

# Return to project root
cd ..
```

### **Step 9: Configure Nginx**

```bash
# Copy Nginx configuration
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix

# Enable the site
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### **Step 10: Set Up Systemd Services**

```bash
# Copy systemd service files
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable sppix-django sppix-asgi

# Start services
sudo systemctl start sppix-django sppix-asgi
```

### **Step 11: Configure Firewall**

```bash
# Enable UFW firewall
sudo ufw --force enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Django ports
sudo ufw allow 82
sudo ufw allow 83

# Check firewall status
sudo ufw status
```

### **Step 12: Set Up SSL Certificate**

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Create temporary Nginx config for certificate validation
sudo tee /etc/nginx/sites-available/sppix-temp << EOF
server {
    listen 80;
    server_name sppix.com www.sppix.com;
    
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
sudo certbot certonly --webroot --webroot-path=/var/www/html --email admin@sppix.com --agree-tos --no-eff-email --domains sppix.com,www.sppix.com --non-interactive

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
```

### **Step 13: Final Configuration**

```bash
# Set proper permissions
sudo chown -R sppix:sppix /opt/sppix-store
sudo chmod -R 755 /opt/sppix-store
sudo chmod -R 644 /opt/sppix-store/Backend/media
sudo chmod -R 644 /opt/sppix-store/Backend/staticfiles

# Create log directories
sudo mkdir -p /opt/sppix-store/Backend/logs
sudo chown sppix:sppix /opt/sppix-store/Backend/logs

# Restart all services
sudo systemctl restart sppix-django sppix-asgi nginx
```

## 🔍 Verification Steps

### **Check Service Status**
```bash
# Check all services
sudo systemctl status sppix-django sppix-asgi nginx mysql redis-server

# Check ports
netstat -tlnp | grep -E ":(80|443|82|83) "

# Check logs
sudo journalctl -u sppix-django -f
sudo journalctl -u sppix-asgi -f
```

### **Test Website**
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://sppix.com

# Test HTTPS
curl -I https://sppix.com

# Test API
curl -I https://sppix.com/api/

# Test admin
curl -I https://sppix.com/admin/
```

## 🛠️ Management Commands

### **Service Management**
```bash
# Check status
sudo systemctl status sppix-django sppix-asgi

# Restart services
sudo systemctl restart sppix-django sppix-asgi

# View logs
sudo journalctl -u sppix-django -f
sudo journalctl -u sppix-asgi -f

# Reload Nginx
sudo systemctl reload nginx
```

### **Application Management**
```bash
# Update application
cd /opt/sppix-store
git pull origin main
source Backend/venv/bin/activate
pip install -r Backend/requirements.txt
python Backend/manage.py migrate
python Backend/manage.py collectstatic --noinput
cd Frontend
npm install
npm run build:both
sudo systemctl restart sppix-django sppix-asgi
```

### **Database Management**
```bash
# Backup database
mysqldump -u sppix_user -p'SppixStore2024!' sppix_store > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
mysql -u sppix_user -p'SppixStore2024!' sppix_store < backup_file.sql
```

## 🎉 Success!

After completing these steps, your SPPIX store will be live at:

- **Main Store**: https://sppix.com
- **WWW**: https://www.sppix.com
- **Admin Panel**: https://sppix.com/admin/
- **API**: https://sppix.com/api/

### **Admin Credentials:**
- **Username**: admin
- **Email**: admin@sppix.com
- **Password**: SppixAdmin2024!

## 🚨 Troubleshooting

### **Common Issues:**

1. **Services not starting:**
   ```bash
   sudo systemctl status sppix-django
   sudo journalctl -u sppix-django -f
   ```

2. **SSL certificate issues:**
   ```bash
   sudo certbot renew --dry-run
   ```

3. **Database connection issues:**
   ```bash
   mysql -u sppix_user -p'SppixStore2024!' sppix_store
   ```

4. **Nginx configuration issues:**
   ```bash
   sudo nginx -t
   ```

5. **Permission issues:**
   ```bash
   sudo chown -R sppix:sppix /opt/sppix-store
   ```

Your SPPIX store is now ready for production on Debian! 🚀
