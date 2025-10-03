# SPPIX Debian Deployment Checklist

## 📋 Pre-Deployment Checklist

### **System Requirements:**
- [ ] Debian 11 (Bullseye) or Debian 12 (Bookworm)
- [ ] Minimum 2GB RAM (4GB recommended)
- [ ] Minimum 20GB storage (50GB recommended)
- [ ] Public IP: 90.249.95.206
- [ ] Domain: sppix.com pointing to your VPS
- [ ] WWW: www.sppix.com pointing to your VPS

### **Access Requirements:**
- [ ] SSH access to VPS
- [ ] Sudo privileges
- [ ] Project files uploaded to `/opt/sppix-store`

## 🚀 Deployment Steps

### **Step 1: System Preparation**
- [ ] Update system packages
- [ ] Install Python 3.11
- [ ] Install Node.js 18.x
- [ ] Install MySQL Server
- [ ] Install Redis Server
- [ ] Install Nginx
- [ ] Install Certbot (SSL)
- [ ] Install additional tools (htop, nano, ufw, supervisor)

### **Step 2: Project Setup**
- [ ] Create project user (sppix)
- [ ] Set proper file permissions
- [ ] Set up Python virtual environment
- [ ] Install Python dependencies
- [ ] Set up MySQL database
- [ ] Configure Django settings
- [ ] Run Django migrations
- [ ] Create Django superuser
- [ ] Collect static files

### **Step 3: Frontend Setup**
- [ ] Install Node.js dependencies
- [ ] Copy production environment file
- [ ] Build frontend for production

### **Step 4: Web Server Configuration**
- [ ] Copy Nginx configuration
- [ ] Enable site configuration
- [ ] Remove default site
- [ ] Test Nginx configuration
- [ ] Reload Nginx

### **Step 5: Service Configuration**
- [ ] Copy systemd service files
- [ ] Reload systemd daemon
- [ ] Enable services
- [ ] Start services

### **Step 6: Security Configuration**
- [ ] Configure firewall (UFW)
- [ ] Allow SSH access
- [ ] Allow HTTP/HTTPS ports
- [ ] Allow Django ports (82, 83)
- [ ] Verify firewall status

### **Step 7: SSL Certificate Setup**
- [ ] Stop Nginx temporarily
- [ ] Create temporary Nginx config
- [ ] Obtain SSL certificate from Let's Encrypt
- [ ] Restore main Nginx configuration
- [ ] Set up automatic renewal
- [ ] Start Nginx with SSL

### **Step 8: Final Configuration**
- [ ] Set proper file permissions
- [ ] Create log directories
- [ ] Restart all services
- [ ] Verify service status

## 🔍 Verification Checklist

### **Service Status:**
- [ ] MySQL running
- [ ] Redis running
- [ ] Nginx running
- [ ] Django service running (port 82)
- [ ] ASGI service running (port 83)

### **Port Status:**
- [ ] Port 80 listening (HTTP)
- [ ] Port 443 listening (HTTPS)
- [ ] Port 82 listening (Django)
- [ ] Port 83 listening (ASGI)

### **Website Access:**
- [ ] HTTP redirects to HTTPS
- [ ] HTTPS accessible
- [ ] Main store loads
- [ ] Admin panel accessible
- [ ] API endpoints working

### **SSL Certificate:**
- [ ] Certificate valid
- [ ] Auto-renewal configured
- [ ] Security headers present

## 🎯 Success Criteria

After deployment, you should have:

### **Live URLs:**
- ✅ https://sppix.com (Main store)
- ✅ https://www.sppix.com (WWW subdomain)
- ✅ https://90.249.95.206 (Direct IP access)
- ✅ https://sppix.com/admin/ (Admin panel)
- ✅ https://sppix.com/api/ (API endpoints)

### **Admin Access:**
- ✅ Username: admin
- ✅ Email: admin@sppix.com
- ✅ Password: SppixAdmin2024!

### **Management Commands:**
- ✅ `sudo systemctl status sppix-django sppix-asgi`
- ✅ `sudo systemctl restart sppix-django sppix-asgi`
- ✅ `sudo journalctl -u sppix-django -f`
- ✅ `sudo nginx -t`
- ✅ `sudo systemctl reload nginx`

## 🚨 Troubleshooting

### **Common Issues:**

1. **Services not starting:**
   - Check logs: `sudo journalctl -u sppix-django -f`
   - Check permissions: `sudo chown -R sppix:sppix /opt/sppix-store`
   - Check configuration: `sudo nginx -t`

2. **Database connection issues:**
   - Test connection: `mysql -u sppix_user -p'SppixStore2024!' sppix_store`
   - Check MySQL status: `sudo systemctl status mysql`

3. **SSL certificate issues:**
   - Test renewal: `sudo certbot renew --dry-run`
   - Check certificate: `sudo certbot certificates`

4. **Port conflicts:**
   - Check ports: `netstat -tlnp | grep -E ":(80|443|82|83) "`
   - Check firewall: `sudo ufw status`

5. **Permission issues:**
   - Fix ownership: `sudo chown -R sppix:sppix /opt/sppix-store`
   - Fix permissions: `sudo chmod -R 755 /opt/sppix-store`

## 🎉 Deployment Complete!

Once all checklist items are completed, your SPPIX store will be live and ready for business on Debian!

**Quick Deploy Option:**
```bash
# Make script executable
chmod +x debian_quick_deploy.sh

# Run automated deployment
./debian_quick_deploy.sh
```

This will handle all the steps automatically and deploy your SPPIX store to production! 🚀
