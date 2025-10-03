# PowerShell script to deploy admin fix to Linux server
# Run this from Windows to fix the admin routing issue on your Linux server

Write-Host "🚀 SPPIX Admin Panel Fix Deployment" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Server details - UPDATE THESE WITH YOUR SERVER INFO
$SERVER_IP = "90.249.95.206"
$SERVER_USER = "root"  # or your username
$PROJECT_PATH = "/opt/sppix-store"

Write-Host "📋 Server Details:" -ForegroundColor Yellow
Write-Host "   Server: $SERVER_IP" -ForegroundColor White
Write-Host "   User: $SERVER_USER" -ForegroundColor White
Write-Host "   Project Path: $PROJECT_PATH" -ForegroundColor White
Write-Host ""

# Check if files exist locally
if (-not (Test-Path "nginx_admin_fix.conf")) {
    Write-Host "❌ nginx_admin_fix.conf not found in current directory!" -ForegroundColor Red
    Write-Host "   Please make sure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "fix_admin_routing.sh")) {
    Write-Host "❌ fix_admin_routing.sh not found in current directory!" -ForegroundColor Red
    Write-Host "   Please make sure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Local files found" -ForegroundColor Green

# Upload files to server
Write-Host "📤 Uploading files to server..." -ForegroundColor Yellow

try {
    # Upload nginx configuration
    scp nginx_admin_fix.conf ${SERVER_USER}@${SERVER_IP}:/tmp/nginx_admin_fix.conf
    Write-Host "   ✅ nginx_admin_fix.conf uploaded" -ForegroundColor Green
    
    # Upload fix script
    scp fix_admin_routing.sh ${SERVER_USER}@${SERVER_IP}:/tmp/fix_admin_routing.sh
    Write-Host "   ✅ fix_admin_routing.sh uploaded" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to upload files to server!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure you have SSH access to the server." -ForegroundColor Yellow
    exit 1
}

# Execute the fix script on the server
Write-Host "🔧 Executing fix script on server..." -ForegroundColor Yellow

try {
    ssh ${SERVER_USER}@${SERVER_IP} "chmod +x /tmp/fix_admin_routing.sh && /tmp/fix_admin_routing.sh"
    
    Write-Host ""
    Write-Host "🎉 Admin Panel Fix Complete!" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Fixed nginx configuration applied" -ForegroundColor Green
    Write-Host "✅ Nginx reloaded successfully" -ForegroundColor Green
    Write-Host "✅ Admin panel should now be accessible at: https://sppix.com/admin/" -ForegroundColor Green
    Write-Host "✅ Storefront should still work at: https://sppix.com/" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Test the fix:" -ForegroundColor Yellow
    Write-Host "   1. Open https://sppix.com/admin/ in your browser" -ForegroundColor White
    Write-Host "   2. You should see your custom admin panel instead of 404" -ForegroundColor White
    Write-Host "   3. The storefront at https://sppix.com/ should still work" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 What was fixed:" -ForegroundColor Yellow
    Write-Host "   - Moved /admin/ location block before root / location block in nginx" -ForegroundColor White
    Write-Host "   - This ensures /admin/ requests are handled by admin panel, not storefront" -ForegroundColor White
    Write-Host "   - Added proper fallback to /admin/index.html for SPA routing" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to execute fix script on server!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   You may need to run the fix manually:" -ForegroundColor Yellow
    Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
    Write-Host "   sudo /tmp/fix_admin_routing.sh" -ForegroundColor White
    exit 1
}

Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test https://sppix.com/admin/ in your browser" -ForegroundColor White
Write-Host "   2. If it works, you're all set!" -ForegroundColor White
Write-Host "   3. If not, check the server logs:" -ForegroundColor White
Write-Host "      ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
Write-Host "      tail -f /var/log/nginx/sppix_error.log" -ForegroundColor White
Write-Host ""
