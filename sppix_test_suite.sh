#!/bin/bash

# SPPIX One-Stop Test Script
# Comprehensive test of all site functionality

echo "🧪 SPPIX One-Stop Test Suite"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_code="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    print_test "$test_name"
    
    local result=$(eval "$test_command" 2>/dev/null)
    local status_code=$?
    
    if [ "$status_code" = "$expected_code" ] || [ "$result" = "$expected_code" ]; then
        print_pass "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_fail "$test_name (Expected: $expected_code, Got: $result)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test HTTP response
test_http() {
    local url="$1"
    local test_name="$2"
    local expected_code="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    print_test "$test_name"
    
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$http_code" = "$expected_code" ]; then
        print_pass "$test_name (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_fail "$test_name (Expected: HTTP $expected_code, Got: HTTP $http_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "🌐 Testing Website Accessibility"
echo "--------------------------------"

# Test 1: Admin Panel Access
test_http "https://sppix.com/admin/" "Admin Panel Access" "200"

# Test 2: Storefront Access
test_http "https://sppix.com/" "Storefront Access" "200"

# Test 3: API Health Check
test_http "https://sppix.com/api/public/health/" "API Health Check" "200"

# Test 4: Static Files
test_http "https://sppix.com/static/" "Static Files Access" "200"

# Test 5: Media Files
test_http "https://sppix.com/media/" "Media Files Access" "200"

echo ""
echo "🔧 Testing Server Services"
echo "-------------------------"

# Test 6: Nginx Status
run_test "Nginx Service Status" "systemctl is-active nginx" "0"

# Test 7: Django Backend (if running)
run_test "Django Backend Check" "curl -s http://127.0.0.1:82/api/public/health/ | grep -q 'ok'" "0"

# Test 8: WebSocket Service (if running)
run_test "WebSocket Service Check" "curl -s http://127.0.0.1:83/health/ | grep -q 'ok'" "0"

echo ""
echo "📁 Testing File Structure"
echo "------------------------"

# Test 9: Admin Build Exists
run_test "Admin Build Directory" "test -d /opt/sppix-store/Frontend/dist/admin" "0"

# Test 10: Storefront Build Exists
run_test "Storefront Build Directory" "test -d /opt/sppix-store/Frontend/dist/storefront" "0"

# Test 11: Admin Index File
run_test "Admin Index File" "test -f /opt/sppix-store/Frontend/dist/admin/index.html" "0"

# Test 12: Storefront Index File
run_test "Storefront Index File" "test -f /opt/sppix-store/Frontend/dist/storefront/index.html" "0"

echo ""
echo "🔒 Testing Security & SSL"
echo "----------------------"

# Test 13: HTTPS Redirect
test_http "http://sppix.com/" "HTTP to HTTPS Redirect" "301"

# Test 14: SSL Certificate
run_test "SSL Certificate Check" "openssl s_client -connect sppix.com:443 -servername sppix.com < /dev/null 2>/dev/null | grep -q 'Verify return code: 0'" "0"

echo ""
echo "⚡ Testing Performance"
echo "--------------------"

# Test 15: Response Time (should be under 2 seconds)
print_test "Admin Panel Response Time"
admin_time=$(curl -s -o /dev/null -w "%{time_total}" https://sppix.com/admin/ 2>/dev/null)
if (( $(echo "$admin_time < 2.0" | bc -l) )); then
    print_pass "Admin Panel Response Time (${admin_time}s)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_fail "Admin Panel Response Time (${admin_time}s - too slow)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 16: Storefront Response Time
print_test "Storefront Response Time"
store_time=$(curl -s -o /dev/null -w "%{time_total}" https://sppix.com/ 2>/dev/null)
if (( $(echo "$store_time < 2.0" | bc -l) )); then
    print_pass "Storefront Response Time (${store_time}s)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_fail "Storefront Response Time (${store_time}s - too slow)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ $TESTS_PASSED/$TESTS_TOTAL tests passed${NC}"
    echo ""
    echo "🚀 Your SPPIX site is working perfectly!"
    echo "   - Admin panel: https://sppix.com/admin/"
    echo "   - Storefront: https://sppix.com/"
    echo "   - API: https://sppix.com/api/"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Test admin panel login and features"
    echo "   2. Test storefront functionality"
    echo "   3. Add products and test ordering"
    echo "   4. Monitor performance and logs"
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${GREEN}✅ $TESTS_PASSED tests passed${NC}"
    echo -e "${RED}❌ $TESTS_FAILED tests failed${NC}"
    echo ""
    echo "🔧 Failed tests need attention:"
    echo "   - Check nginx logs: sudo tail -f /var/log/nginx/sppix_error.log"
    echo "   - Check service status: sudo systemctl status nginx"
    echo "   - Verify file permissions and paths"
fi

echo ""
echo "📋 Quick Commands for Troubleshooting:"
echo "   sudo systemctl status nginx"
echo "   sudo tail -f /var/log/nginx/sppix_error.log"
echo "   sudo tail -f /var/log/nginx/sppix_access.log"
echo "   curl -I https://sppix.com/admin/"
echo "   curl -I https://sppix.com/"
echo ""
