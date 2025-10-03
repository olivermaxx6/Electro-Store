#!/bin/bash

# SPPIX Database and API Verification Script
# This script verifies that data flows correctly from admin to storefront

echo "ðŸ” SPPIX Database and API Verification Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Navigate to project directory
cd /opt/sppix-store/Backend || {
    print_error "Failed to navigate to Backend directory"
    exit 1
}

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    source ../venv/bin/activate
    print_status "Activated virtual environment"
fi

# Step 1: Check Django backend status
print_status "Checking Django backend status..."
if pgrep -f "python.*manage.py.*runserver" > /dev/null || pgrep -f "daphne" > /dev/null; then
    print_success "Django backend is running"
else
    print_warning "Django backend is not running. Starting it..."
    nohup python manage.py runserver 127.0.0.1:82 > ../logs/django.log 2>&1 &
    sleep 3
    print_status "Django backend started"
fi

# Step 2: Database connectivity check
print_status "Testing database connectivity..."
python manage.py check --database default
if [ $? -eq 0 ]; then
    print_success "Database connection is working"
else
    print_error "Database connection failed!"
    exit 1
fi

# Step 3: Check data in database
print_status "Checking data in database..."
python manage.py shell -c "
from adminpanel.models import Product, Category, Brand, StoreSettings, WebsiteContent
from django.contrib.auth.models import User

print('=== DATABASE CONTENT CHECK ===')
print(f'Users: {User.objects.count()}')
print(f'Products: {Product.objects.count()}')
print(f'Categories: {Category.objects.count()}')
print(f'Brands: {Brand.objects.count()}')
print(f'Store Settings: {StoreSettings.objects.count()}')
print(f'Website Content: {WebsiteContent.objects.count()}')

print('\n=== SAMPLE DATA ===')
if Product.objects.exists():
    product = Product.objects.first()
    print(f'Sample Product: {product.name} - {product.price}')
    print(f'  Category: {product.category.name if product.category else \"None\"}')
    print(f'  Brand: {product.brand.name if product.brand else \"None\"}')
    print(f'  Active: {product.is_active}')
else:
    print('No products found!')

if Category.objects.exists():
    category = Category.objects.first()
    print(f'Sample Category: {category.name} - Active: {category.is_active}')
else:
    print('No categories found!')

if StoreSettings.objects.exists():
    settings = StoreSettings.objects.first()
    print(f'Store Name: {settings.store_name}')
    print(f'Currency: {settings.currency}')
else:
    print('No store settings found!')
"

# Step 4: Test API endpoints
print_status "Testing API endpoints..."

# Test public products API
print_status "Testing public products API..."
PRODUCTS_RESPONSE=$(curl -s "http://127.0.0.1:82/api/public/products/")
PRODUCTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:82/api/public/products/")

if [ "$PRODUCTS_STATUS" = "200" ]; then
    print_success "Products API is working (Status: $PRODUCTS_STATUS)"
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
    if [ -n "$PRODUCT_COUNT" ] && [ "$PRODUCT_COUNT" -gt 0 ]; then
        print_success "Products API returned $PRODUCT_COUNT products"
    else
        print_warning "Products API returned empty or no count"
    fi
else
    print_error "Products API failed (Status: $PRODUCTS_STATUS)"
fi

# Test public categories API
print_status "Testing public categories API..."
CATEGORIES_RESPONSE=$(curl -s "http://127.0.0.1:82/api/public/categories/")
CATEGORIES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:82/api/public/categories/")

if [ "$CATEGORIES_STATUS" = "200" ]; then
    print_success "Categories API is working (Status: $CATEGORIES_STATUS)"
    CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
    if [ -n "$CATEGORY_COUNT" ] && [ "$CATEGORY_COUNT" -gt 0 ]; then
        print_success "Categories API returned $CATEGORY_COUNT categories"
    else
        print_warning "Categories API returned empty or no count"
    fi
else
    print_error "Categories API failed (Status: $CATEGORIES_STATUS)"
fi

# Test store settings API
print_status "Testing store settings API..."
SETTINGS_RESPONSE=$(curl -s "http://127.0.0.1:82/api/public/store-settings/")
SETTINGS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:82/api/public/store-settings/")

if [ "$SETTINGS_STATUS" = "200" ]; then
    print_success "Store settings API is working (Status: $SETTINGS_STATUS)"
else
    print_error "Store settings API failed (Status: $SETTINGS_STATUS)"
fi

# Step 5: Test frontend API calls
print_status "Testing frontend API calls..."
cd ../Frontend

# Test if frontend can reach backend
print_status "Testing frontend to backend connectivity..."
FRONTEND_API_TEST=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:82/api/public/products/")
if [ "$FRONTEND_API_TEST" = "200" ]; then
    print_success "Frontend can reach backend API"
else
    print_error "Frontend cannot reach backend API (Status: $FRONTEND_API_TEST)"
fi

# Step 6: Check if sample data exists, if not create some
print_status "Checking if sample data exists..."
cd ../Backend

python manage.py shell -c "
from adminpanel.models import Product, Category, Brand, StoreSettings
from django.contrib.auth.models import User

# Check if we have any data
if Product.objects.count() == 0:
    print('No products found. Creating sample data...')
    
    # Create a sample brand
    brand, created = Brand.objects.get_or_create(name='Sample Brand')
    if created:
        print(f'Created brand: {brand.name}')
    
    # Create a sample category
    category, created = Category.objects.get_or_create(
        name='Electronics',
        defaults={'description': 'Electronic devices and gadgets'}
    )
    if created:
        print(f'Created category: {category.name}')
    
    # Create sample products
    products_data = [
        {'name': 'Sample Laptop', 'price': 999.99, 'description': 'A sample laptop'},
        {'name': 'Sample Phone', 'price': 599.99, 'description': 'A sample smartphone'},
        {'name': 'Sample Tablet', 'price': 399.99, 'description': 'A sample tablet'},
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'price': product_data['price'],
                'description': product_data['description'],
                'category': category,
                'brand': brand,
                'is_active': True
            }
        )
        if created:
            print(f'Created product: {product.name}')
    
    print('Sample data created successfully!')
else:
    print(f'Found {Product.objects.count()} existing products')

# Ensure store settings exist
if StoreSettings.objects.count() == 0:
    print('No store settings found. Creating default settings...')
    StoreSettings.objects.create(
        store_name='SPPIX Store',
        currency='USD',
        tax_rate=0.08,
        shipping_rate=9.99
    )
    print('Default store settings created!')
else:
    print('Store settings already exist')
"

# Step 7: Final API test
print_status "Final API test after data verification..."
sleep 2

# Test products API again
FINAL_PRODUCTS_RESPONSE=$(curl -s "http://127.0.0.1:82/api/public/products/")
FINAL_PRODUCTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:82/api/public/products/")

if [ "$FINAL_PRODUCTS_STATUS" = "200" ]; then
    print_success "Final products API test passed (Status: $FINAL_PRODUCTS_STATUS)"
    
    # Show sample product data
    echo "$FINAL_PRODUCTS_RESPONSE" | head -c 200
    echo "..."
else
    print_error "Final products API test failed (Status: $FINAL_PRODUCTS_STATUS)"
fi

# Step 8: Test HTTPS endpoints
print_status "Testing HTTPS endpoints..."
HTTPS_PRODUCTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://sppix.com/api/public/products/")
HTTPS_CATEGORIES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://sppix.com/api/public/categories/")

if [ "$HTTPS_PRODUCTS_STATUS" = "200" ]; then
    print_success "HTTPS Products API working (Status: $HTTPS_PRODUCTS_STATUS)"
else
    print_error "HTTPS Products API failed (Status: $HTTPS_PRODUCTS_STATUS)"
fi

if [ "$HTTPS_CATEGORIES_STATUS" = "200" ]; then
    print_success "HTTPS Categories API working (Status: $HTTPS_CATEGORIES_STATUS)"
else
    print_error "HTTPS Categories API failed (Status: $HTTPS_CATEGORIES_STATUS)"
fi

# Step 9: Summary
print_status "=== VERIFICATION SUMMARY ==="
echo "Database Status: $(python manage.py check --database default > /dev/null 2>&1 && echo 'OK' || echo 'FAILED')"
echo "Products API: $FINAL_PRODUCTS_STATUS"
echo "Categories API: $CATEGORIES_STATUS"
echo "Store Settings API: $SETTINGS_STATUS"
echo "HTTPS Products API: $HTTPS_PRODUCTS_STATUS"
echo "HTTPS Categories API: $HTTPS_CATEGORIES_STATUS"

# Step 10: Recommendations
print_status "=== RECOMMENDATIONS ==="
if [ "$FINAL_PRODUCTS_STATUS" != "200" ]; then
    print_warning "Products API is not working. Check Django logs and database connection."
fi

if [ "$CATEGORIES_STATUS" != "200" ]; then
    print_warning "Categories API is not working. Check Django logs and database connection."
fi

if [ "$HTTPS_PRODUCTS_STATUS" != "200" ]; then
    print_warning "HTTPS API is not working. Check nginx configuration and SSL certificates."
fi

print_success "Database and API verification complete!"
print_status "Next steps:"
echo "1. Check Django logs: tail -f /opt/sppix-store/Backend/logs/django.log"
echo "2. Check nginx logs: sudo tail -f /var/log/nginx/sppix_error.log"
echo "3. Test frontend: https://sppix.com"
echo "4. Test admin panel: https://sppix.com/admin"
