# SPPIX GoDaddy Deployment Instructions for Windows

## 🚀 Deploying SPPIX to GoDaddy VPS (Port 82)

Since you're on Windows, here's how to deploy your SPPIX project to your GoDaddy VPS:

### Step 1: Upload Files to GoDaddy VPS

1. **Connect to your GoDaddy VPS via SSH**:
   ```bash
   ssh root@90.249.95.206
   # or
   ssh your-username@90.249.95.206
   ```

2. **Upload your project files** using one of these methods:

   **Option A: Using SCP (from Windows Command Prompt/PowerShell)**
   ```cmd
   scp -r D:\Electro-Store root@90.249.95.206:/opt/sppix-store
   ```

   **Option B: Using WinSCP (GUI tool)**
   - Download WinSCP
   - Connect to 90.249.95.206
   - Upload the entire Electro-Store folder to /opt/sppix-store

   **Option C: Using Git (if your project is in Git)**
   ```bash
   # On your VPS
   cd /opt
   git clone your-repository-url sppix-store
   ```

### Step 2: Run Deployment Scripts on VPS

Once files are uploaded, SSH into your VPS and run:

```bash
# Navigate to project directory
cd /opt/sppix-store

# Make scripts executable
chmod +x deploy_complete.sh
chmod +x deploy_to_godaddy.sh
chmod +x setup_database.sh
chmod +x setup_ssl.sh

# Run complete deployment (this will take 10-15 minutes)
./deploy_complete.sh
```

### Step 3: Alternative - Manual Step-by-Step Deployment

If you prefer manual control:

```bash
# 1. Main deployment
./deploy_to_godaddy.sh

# 2. Database setup
sudo ./setup_database.sh

# 3. SSL setup
sudo ./setup_ssl.sh

# 4. Final configuration
sudo cp nginx_sppix.conf /etc/nginx/sites-available/sppix
sudo ln -sf /etc/nginx/sites-available/sppix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 5. Copy systemd services
sudo cp sppix-django.service /etc/systemd/system/
sudo cp sppix-asgi.service /etc/systemd/system/
sudo systemctl daemon-reload

# 6. Start services
sudo systemctl enable mysql redis-server nginx sppix-django sppix-asgi
sudo systemctl start mysql redis-server nginx sppix-django sppix-asgi
```

### Step 4: Verify Deployment

After deployment completes, check:

```bash
# Check service status
sudo systemctl status sppix-django sppix-asgi nginx mysql redis-server

# Check ports (should see 80, 443, 82, 83)
netstat -tlnp | grep -E ":(80|443|82|83) "

# Test website
curl -I https://sppix.com
```

## 🌟 What You'll Get

### Live URLs (using port 82):
- **Main Store**: https://sppix.com
- **WWW**: https://www.sppix.com  
- **Direct IP**: https://90.249.95.206
- **Admin Panel**: https://sppix.com/admin/
- **API**: https://sppix.com/api/

### Admin Access:
- **Username**: `admin`
- **Email**: `admin@sppix.com`
- **Password**: `SppixAdmin2024!`

### Management Commands:
```bash
# Check status
sudo /opt/sppix_status.sh

# Restart services
sudo /opt/sppix_restart.sh

# View logs
sudo /opt/sppix_logs.sh

# Update application
sudo /opt/update_sppix.sh
```

## 🔧 Port Configuration Summary

Your SPPIX project is now configured to use:
- **Port 82**: Django application (main API and admin)
- **Port 83**: ASGI server (WebSocket support)
- **Port 80**: HTTP (redirects to HTTPS)
- **Port 443**: HTTPS (main website)

## 🚨 Troubleshooting

If you encounter issues:

1. **Check logs**:
   ```bash
   sudo /opt/sppix_logs.sh
   ```

2. **Check service status**:
   ```bash
   sudo /opt/sppix_status.sh
   ```

3. **Restart services**:
   ```bash
   sudo /opt/sppix_restart.sh
   ```

4. **Check firewall**:
   ```bash
   sudo ufw status
   ```

## 🎉 Success!

Once deployed, your SPPIX store will be live at https://sppix.com using port 82 for the backend services!

The deployment includes:
- ✅ SSL/HTTPS with automatic renewal
- ✅ Firewall configuration
- ✅ Database setup with backups
- ✅ Systemd services for auto-start
- ✅ Log rotation and monitoring
- ✅ Security headers and rate limiting
