#!/bin/bash

# SPPIX Admin Panel and Storefront Fix Script
# This script fixes both the admin panel 404 issue and storefront data display

echo "ðŸ”§ Starting SPPIX Admin Panel and Storefront Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Some commands may need adjustment."
fi

# Step 1: Navigate to project directory
print_status "Navigating to project directory..."
cd /opt/sppix-store || {
    print_error "Failed to navigate to /opt/sppix-store"
    exit 1
}

# Step 2: Check current admin build
print_status "Checking current admin build..."
if [ -f "Frontend/dist/admin/index.html" ]; then
    print_status "Current admin index.html content:"
    head -10 Frontend/dist/admin/index.html
else
    print_error "Admin build not found!"
fi

# Step 3: Rebuild admin panel with correct base path
print_status "Rebuilding admin panel..."
cd Frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Build admin panel
print_status "Building admin panel..."
npm run build:admin

if [ $? -eq 0 ]; then
    print_success "Admin panel built successfully!"
else
    print_error "Admin panel build failed!"
    exit 1
fi

# Step 4: Verify the new build
print_status "Verifying new admin build..."
if [ -f "dist/admin/index.html" ]; then
    print_status "New admin index.html content:"
    head -10 dist/admin/index.html
    
    # Check if assets are correctly referenced
    if grep -q "/admin/assets/" dist/admin/index.html; then
        print_success "Asset paths are correctly set to /admin/assets/"
    else
        print_warning "Asset paths may still be incorrect. Checking..."
        grep -E "(src=|href=)" dist/admin/index.html
    fi
else
    print_error "Admin build verification failed!"
    exit 1
fi

# Step 5: Check Django backend status
print_status "Checking Django backend status..."
cd ../Backend

# Check if Django is running
if pgrep -f "python.*manage.py.*runserver" > /dev/null || pgrep -f "daphne" > /dev/null; then
    print_success "Django backend is running"
else
    print_warning "Django backend may not be running. Starting it..."
    
    # Activate virtual environment if it exists
    if [ -d "../venv" ]; then
        source ../venv/bin/activate
        print_status "Activated virtual environment"
    fi
    
    # Start Django backend in background
    nohup python manage.py runserver 127.0.0.1:82 > ../logs/django.log 2>&1 &
    print_status "Started Django backend on port 82"
    sleep 3
fi

# Step 6: Check database connectivity
print_status "Checking database connectivity..."
python manage.py check --database default
if [ $? -eq 0 ]; then
    print_success "Database connection is working"
else
    print_error "Database connection failed!"
    exit 1
fi

# Step 7: Check if admin data exists
print_status "Checking admin data..."
python manage.py shell -c "
from adminpanel.models import Product, Category, Brand, StoreSettings
print(f'Products: {Product.objects.count()}')
print(f'Categories: {Category.objects.count()}')
print(f'Brands: {Brand.objects.count()}')
print(f'Store Settings: {StoreSettings.objects.count()}')
"

# Step 8: Test API endpoints
print_status "Testing API endpoints..."
cd ..

# Test public API endpoints
print_status "Testing public API endpoints..."
curl -s "http://127.0.0.1:82/api/public/products/" | head -c 100
echo ""
curl -s "http://127.0.0.1:82/api/public/categories/" | head -c 100
echo ""

# Step 9: Reload nginx configuration
print_status "Reloading nginx configuration..."
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    print_success "Nginx configuration reloaded"
else
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Step 10: Test admin panel access
print_status "Testing admin panel access..."
sleep 2
curl -s -o /dev/null -w "%{http_code}" "https://sppix.com/admin/"
echo " - Admin panel HTTP status"

# Step 11: Test storefront access
print_status "Testing storefront access..."
curl -s -o /dev/null -w "%{http_code}" "https://sppix.com/"
echo " - Storefront HTTP status"

# Step 12: Check frontend build
print_status "Checking storefront build..."
if [ -f "Frontend/dist/storefront/index.html" ]; then
    print_success "Storefront build exists"
else
    print_warning "Storefront build not found. Building..."
    cd Frontend
    npm run build:storefront
    if [ $? -eq 0 ]; then
        print_success "Storefront built successfully!"
    else
        print_error "Storefront build failed!"
    fi
    cd ..
fi

# Step 13: Final verification
print_status "Final verification..."

# Check all services
print_status "Checking services status:"
echo "Django Backend: $(pgrep -f 'python.*manage.py.*runserver' > /dev/null && echo 'Running' || echo 'Not Running')"
echo "Nginx: $(systemctl is-active nginx)"
echo "Admin Panel: $(curl -s -o /dev/null -w "%{http_code}" "https://sppix.com/admin/")"
echo "Storefront: $(curl -s -o /dev/null -w "%{http_code}" "https://sppix.com/")"

# Step 14: Create a simple test script
print_status "Creating test script for future use..."
cat > test_sppix.sh << 'EOF'
#!/bin/bash
echo "Testing SPPIX Services..."

echo "1. Admin Panel:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" "https://sppix.com/admin/"

echo "2. Storefront:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" "https://sppix.com/"

echo "3. API Endpoints:"
curl -s -o /dev/null -w "   Products API: %{http_code}\n" "https://sppix.com/api/public/products/"
curl -s -o /dev/null -w "   Categories API: %{http_code}\n" "https://sppix.com/api/public/categories/"

echo "4. Database Check:"
cd /opt/sppix-store/Backend
python manage.py shell -c "
from adminpanel.models import Product, Category
print(f'   Products in DB: {Product.objects.count()}')
print(f'   Categories in DB: {Category.objects.count()}')
"
EOF

chmod +x test_sppix.sh
print_success "Created test script: ./test_sppix.sh"

print_success "ðŸŽ‰ SPPIX Admin Panel and Storefront Fix Complete!"
print_status "Next steps:"
echo "1. Visit https://sppix.com/admin to access admin panel"
echo "2. Visit https://sppix.com to see storefront"
echo "3. Run ./test_sppix.sh to test all services"
echo "4. Check logs in /opt/sppix-store/Backend/logs/django.log if issues persist"

print_status "If you still see issues:"
echo "1. Check nginx error logs: sudo tail -f /var/log/nginx/sppix_error.log"
echo "2. Check Django logs: tail -f /opt/sppix-store/Backend/logs/django.log"
echo "3. Verify database connection and data"
