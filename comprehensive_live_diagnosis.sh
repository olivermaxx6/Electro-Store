#!/bin/bash

# =============================================================================
# COMPREHENSIVE LIVE DEPLOYMENT DIAGNOSIS SCRIPT
# =============================================================================
# This script gathers all critical information to diagnose issues between
# working localhost and problematic live deployment at sppix.com
# =============================================================================

echo "🔍 SPPIX LIVE DEPLOYMENT COMPREHENSIVE DIAGNOSIS"
echo "=================================================="
echo "Timestamp: $(date)"
echo "Server: $(hostname)"
echo "User: $(whoami)"
echo ""

# Create diagnosis report file
REPORT_FILE="/opt/sppix-store/live_diagnosis_$(date +%Y%m%d_%H%M%S).txt"
echo "📋 Report will be saved to: $REPORT_FILE"
echo ""

# Function to log both to console and file
log_section() {
    echo "=== $1 ===" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
}

log_info() {
    echo "$1" | tee -a "$REPORT_FILE"
}

log_section "SYSTEM INFORMATION"
log_info "Hostname: $(hostname)"
log_info "OS: $(cat /etc/os-release | grep PRETTY_NAME)"
log_info "Kernel: $(uname -r)"
log_info "Uptime: $(uptime)"
log_info "Current User: $(whoami)"
log_info "Working Directory: $(pwd)"
log_info ""

log_section "PROJECT STRUCTURE & PERMISSIONS"
log_info "Project Root Directory:"
ls -la /opt/sppix-store/ | tee -a "$REPORT_FILE"
log_info ""

log_info "Frontend Directory Structure:"
ls -la /opt/sppix-store/Frontend/ | tee -a "$REPORT_FILE"
log_info ""

log_info "Backend Directory Structure:"
ls -la /opt/sppix-store/Backend/ | tee -a "$REPORT_FILE"
log_info ""

log_info "Web Directory Permissions:"
ls -la /var/www/html/ | tee -a "$REPORT_FILE"
log_info ""

log_section "PROCESS STATUS"
log_info "Django/Python Processes:"
ps aux | grep -E "(python|django|manage.py)" | grep -v grep | tee -a "$REPORT_FILE"
log_info ""

log_info "Node.js/NPM Processes:"
ps aux | grep -E "(node|npm)" | grep -v grep | tee -a "$REPORT_FILE"
log_info ""

log_info "Nginx Processes:"
ps aux | grep nginx | grep -v grep | tee -a "$REPORT_FILE"
log_info ""

log_info "All Running Services:"
systemctl list-units --type=service --state=running | grep -E "(nginx|django|sppix|gunicorn|uwsgi)" | tee -a "$REPORT_FILE"
log_info ""

log_section "PORT USAGE & NETWORK"
log_info "Active Network Connections:"
netstat -tlnp | grep -E ":(80|443|8000|8001|3000|5173|5174)" | tee -a "$REPORT_FILE"
log_info ""

log_info "Listening Ports:"
ss -tlnp | grep -E ":(80|443|8000|8001|3000|5173|5174)" | tee -a "$REPORT_FILE"
log_info ""

log_section "NGINX CONFIGURATION"
log_info "Nginx Status:"
systemctl status nginx | tee -a "$REPORT_FILE"
log_info ""

log_info "Nginx Configuration Test:"
nginx -t 2>&1 | tee -a "$REPORT_FILE"
log_info ""

log_info "Active Nginx Sites:"
ls -la /etc/nginx/sites-enabled/ | tee -a "$REPORT_FILE"
log_info ""

log_info "Nginx Configuration for sppix.com:"
if [ -f "/etc/nginx/sites-enabled/sppix.com" ]; then
    cat /etc/nginx/sites-enabled/sppix.com | tee -a "$REPORT_FILE"
elif [ -f "/etc/nginx/sites-available/sppix.com" ]; then
    cat /etc/nginx/sites-available/sppix.com | tee -a "$REPORT_FILE"
else
    log_info "No sppix.com nginx config found"
fi
log_info ""

log_info "Nginx Error Logs (Last 50 lines):"
tail -50 /var/log/nginx/error.log | tee -a "$REPORT_FILE"
log_info ""

log_info "Nginx Access Logs (Last 20 lines):"
tail -20 /var/log/nginx/access.log | tee -a "$REPORT_FILE"
log_info ""

log_section "FRONTEND BUILD STATUS"
log_info "Frontend Package.json Scripts:"
if [ -f "/opt/sppix-store/Frontend/package.json" ]; then
    cat /opt/sppix-store/Frontend/package.json | jq '.scripts' 2>/dev/null || grep -A 20 '"scripts"' /opt/sppix-store/Frontend/package.json | tee -a "$REPORT_FILE"
else
    log_info "Frontend package.json not found"
fi
log_info ""

log_info "Frontend Build Directory:"
if [ -d "/opt/sppix-store/Frontend/dist" ]; then
    ls -la /opt/sppix-store/Frontend/dist/ | tee -a "$REPORT_FILE"
    log_info ""
    log_info "Storefront Build:"
    ls -la /opt/sppix-store/Frontend/dist/storefront/ 2>/dev/null | tee -a "$REPORT_FILE"
    log_info ""
    log_info "Admin Build:"
    ls -la /opt/sppix-store/Frontend/dist/admin/ 2>/dev/null | tee -a "$REPORT_FILE"
else
    log_info "Frontend dist directory not found"
fi
log_info ""

log_info "Web Directory Contents:"
if [ -d "/var/www/html/storefront" ]; then
    ls -la /var/www/html/storefront/ | tee -a "$REPORT_FILE"
else
    log_info "Web storefront directory not found"
fi
log_info ""

log_info "Frontend Environment File:"
if [ -f "/opt/sppix-store/Frontend/.env" ]; then
    cat /opt/sppix-store/Frontend/.env | tee -a "$REPORT_FILE"
else
    log_info "Frontend .env file not found"
fi
log_info ""

log_section "BACKEND STATUS"
log_info "Django Settings Check:"
if [ -f "/opt/sppix-store/Backend/core/settings.py" ]; then
    log_info "Django Settings File Found"
    grep -E "(DEBUG|ALLOWED_HOSTS|CORS|DATABASE)" /opt/sppix-store/Backend/core/settings.py | tee -a "$REPORT_FILE"
else
    log_info "Django settings.py not found"
fi
log_info ""

log_info "Django Environment:"
if [ -f "/opt/sppix-store/Backend/.env" ]; then
    cat /opt/sppix-store/Backend/.env | tee -a "$REPORT_FILE"
else
    log_info "Backend .env file not found"
fi
log_info ""

log_info "Python Virtual Environment:"
if [ -d "/opt/sppix-store/Backend/venv" ]; then
    log_info "Virtual environment found"
    /opt/sppix-store/Backend/venv/bin/python --version | tee -a "$REPORT_FILE"
    /opt/sppix-store/Backend/venv/bin/pip list | grep -E "(django|cors|rest)" | tee -a "$REPORT_FILE"
else
    log_info "Virtual environment not found"
fi
log_info ""

log_info "Django Logs (Last 50 lines):"
if [ -f "/opt/sppix-store/Backend/logs/django.log" ]; then
    tail -50 /opt/sppix-store/Backend/logs/django.log | tee -a "$REPORT_FILE"
else
    log_info "Django log file not found"
fi
log_info ""

log_section "DATABASE STATUS"
log_info "Database Connection Test:"
cd /opt/sppix-store/Backend
if [ -f "manage.py" ]; then
    source venv/bin/activate 2>/dev/null
    python manage.py check --database default 2>&1 | tee -a "$REPORT_FILE"
    python manage.py showmigrations 2>&1 | tail -20 | tee -a "$REPORT_FILE"
else
    log_info "Django manage.py not found"
fi
log_info ""

log_section "API ENDPOINT TESTING"
log_info "Testing Live API Endpoints:"

# Test store settings
log_info "1. Store Settings API:"
curl -s -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
     -H "Accept: application/json" \
     "https://sppix.com/api/public/store-settings/" | head -10 | tee -a "$REPORT_FILE"
log_info ""

# Test categories
log_info "2. Categories API:"
curl -s -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
     -H "Accept: application/json" \
     "https://sppix.com/api/public/categories/" | head -10 | tee -a "$REPORT_FILE"
log_info ""

# Test top categories
log_info "3. Top Categories API:"
curl -s -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
     -H "Accept: application/json" \
     "https://sppix.com/api/public/categories/?top=true" | head -10 | tee -a "$REPORT_FILE"
log_info ""

# Test services
log_info "4. Services API:"
curl -s -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
     -H "Accept: application/json" \
     "https://sppix.com/api/public/services/" | head -10 | tee -a "$REPORT_FILE"
log_info ""

# Test website content
log_info "5. Website Content API:"
curl -s -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
     -H "Accept: application/json" \
     "https://sppix.com/api/public/website-content/1/" | head -10 | tee -a "$REPORT_FILE"
log_info ""

log_section "FRONTEND FILE ANALYSIS"
log_info "Checking for hardcoded localhost URLs in deployed files:"
if [ -d "/var/www/html/storefront" ]; then
    grep -r "127.0.0.1\|localhost" /var/www/html/storefront/ 2>/dev/null | head -10 | tee -a "$REPORT_FILE"
    log_info ""
    
    log_info "Checking for API base URL in built files:"
    grep -r "api.*base.*url\|VITE_API" /var/www/html/storefront/ 2>/dev/null | head -5 | tee -a "$REPORT_FILE"
else
    log_info "Storefront deployment directory not found"
fi
log_info ""

log_section "SSL/HTTPS STATUS"
log_info "SSL Certificate Status:"
echo | openssl s_client -servername sppix.com -connect sppix.com:443 2>/dev/null | \
    openssl x509 -noout -dates 2>/dev/null | tee -a "$REPORT_FILE"
log_info ""

log_info "SSL Certificate Details:"
echo | openssl s_client -servername sppix.com -connect sppix.com:443 2>/dev/null | \
    openssl x509 -noout -subject -issuer 2>/dev/null | tee -a "$REPORT_FILE"
log_info ""

log_section "WEBSITE RESPONSE TESTING"
log_info "Homepage Response Test:"
curl -s -I "https://sppix.com/" | tee -a "$REPORT_FILE"
log_info ""

log_info "Homepage Content Sample:"
curl -s "https://sppix.com/" | head -20 | tee -a "$REPORT_FILE"
log_info ""

log_info "Admin Panel Response:"
curl -s -I "https://sppix.com/admin/" | tee -a "$REPORT_FILE"
log_info ""

log_section "COMPARISON WITH LOCALHOST"
log_info "For comparison, here's what should work (localhost setup):"
log_info "✅ Django Backend: http://127.0.0.1:8001"
log_info "✅ React Storefront: http://127.0.0.1:5173"
log_info "✅ React Admin: http://127.0.0.1:5174"
log_info "✅ API Endpoints working: /api/public/store-settings/, /api/public/categories/, etc."
log_info "✅ Categories displaying correctly in storefront"
log_info "✅ Admin expand/collapse functionality working"
log_info ""

log_section "RECENT SYSTEM LOGS"
log_info "System Journal (Last 50 entries related to nginx/django):"
journalctl -n 50 --no-pager | grep -E "(nginx|django|sppix|error|fail)" | tee -a "$REPORT_FILE"
log_info ""

log_section "DISK SPACE & RESOURCES"
log_info "Disk Usage:"
df -h | tee -a "$REPORT_FILE"
log_info ""

log_info "Memory Usage:"
free -h | tee -a "$REPORT_FILE"
log_info ""

log_info "CPU Load:"
uptime | tee -a "$REPORT_FILE"
log_info ""

log_section "DIAGNOSIS SUMMARY"
log_info "🎯 KEY AREAS TO INVESTIGATE:"
log_info ""
log_info "1. 🔍 FRONTEND BUILD ISSUES:"
log_info "   - Check if frontend is built with correct API URLs (https://sppix.com vs localhost)"
log_info "   - Verify environment variables in production build"
log_info "   - Ensure all assets are properly deployed to /var/www/html/"
log_info ""
log_info "2. 🔍 API CONNECTIVITY:"
log_info "   - Test if Django backend is accessible from frontend"
log_info "   - Check CORS configuration for cross-origin requests"
log_info "   - Verify API endpoints return correct data"
log_info ""
log_info "3. 🔍 NGINX CONFIGURATION:"
log_info "   - Ensure proper routing for storefront vs admin"
log_info "   - Check if API requests are properly proxied to Django"
log_info "   - Verify SSL/HTTPS configuration"
log_info ""
log_info "4. 🔍 DJANGO BACKEND:"
log_info "   - Check if Django is running and accessible"
log_info "   - Verify database connections and migrations"
log_info "   - Check for any Django errors in logs"
log_info ""
log_info "5. 🔍 ENVIRONMENT DIFFERENCES:"
log_info "   - Compare localhost vs production environment variables"
log_info "   - Check for missing dependencies or version mismatches"
log_info "   - Verify file permissions and ownership"
log_info ""

echo ""
echo "📋 DIAGNOSIS COMPLETE!"
echo "📄 Full report saved to: $REPORT_FILE"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Review the report file for any obvious issues"
echo "2. Compare API responses between localhost and live"
echo "3. Check if frontend build contains correct API URLs"
echo "4. Verify nginx is properly routing requests"
echo "5. Test individual API endpoints manually"
echo ""
echo "📤 To share this report:"
echo "   cat $REPORT_FILE"
echo ""
