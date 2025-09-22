#!/bin/bash

# Stripe Integration Test Runner Script (Linux/macOS)
# This script runs both Django backend and React frontend Stripe integration tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PATH="Backend"
FRONTEND_PATH="Frontend"
TEST_RESULTS=()

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    print_status $GREEN "🚀 Stripe Integration Test Suite"
    print_status $GREEN "=================================================="
}

print_section() {
    local message=$1
    echo ""
    print_status $YELLOW "🧪 $message"
}

print_success() {
    local message=$1
    print_status $GREEN "✅ $message"
}

print_error() {
    local message=$1
    print_status $RED "❌ $message"
}

print_warning() {
    local message=$1
    print_status $YELLOW "⚠️ $message"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run backend tests
run_backend_tests() {
    print_section "Running Django Backend Stripe Tests..."
    
    if [ ! -d "$BACKEND_PATH" ]; then
        print_error "Backend directory not found: $BACKEND_PATH"
        return 1
    fi
    
    cd "$BACKEND_PATH"
    
    # Check if Python is available
    if ! command_exists python3; then
        print_error "Python3 not found. Please install Python to run backend tests."
        return 1
    fi
    
    # Check if Django is available
    if ! python3 -c "import django" 2>/dev/null; then
        print_error "Django not available. Please install requirements."
        return 1
    fi
    
    # Run Stripe integration tests
    print_status $CYAN "Running Stripe integration tests..."
    if python3 test_runner.py test_stripe_integration; then
        print_success "Backend tests passed!"
        TEST_RESULTS+=("Backend: PASSED")
        return 0
    else
        print_error "Backend tests failed!"
        TEST_RESULTS+=("Backend: FAILED")
        return 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    print_section "Running React Frontend Stripe Tests..."
    
    if [ ! -d "$FRONTEND_PATH" ]; then
        print_error "Frontend directory not found: $FRONTEND_PATH"
        return 1
    fi
    
    cd "$FRONTEND_PATH"
    
    # Check if Node.js is available
    if ! command_exists node; then
        print_error "Node.js not found. Please install Node.js to run frontend tests."
        return 1
    fi
    
    # Check if npm is available
    if ! command_exists npm; then
        print_error "npm not found. Please install npm to run frontend tests."
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status $CYAN "Installing dependencies..."
        if ! npm install; then
            print_error "Failed to install dependencies."
            return 1
        fi
    fi
    
    # Install test dependencies if needed
    if [ ! -f "package.json" ] || ! grep -q "@testing-library/react" package.json; then
        print_status $CYAN "Installing test dependencies..."
        npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom msw @types/jest ts-jest
    fi
    
    # Run Stripe integration tests
    print_status $CYAN "Running Stripe integration tests..."
    
    # Check if Jest is configured
    if [ -f "jest.config.js" ] || grep -q "jest" package.json; then
        if npm run test:stripe 2>/dev/null; then
            print_success "Frontend tests passed!"
            TEST_RESULTS+=("Frontend: PASSED")
            return 0
        fi
    fi
    
    # Run with Jest directly
    if npx jest --testPathPattern=PaymentForm.integration.test.tsx --verbose --watchAll=false; then
        print_success "Frontend tests passed!"
        TEST_RESULTS+=("Frontend: PASSED")
        return 0
    else
        print_error "Frontend tests failed!"
        TEST_RESULTS+=("Frontend: FAILED")
        return 1
    fi
}

# Function to show test summary
show_test_summary() {
    echo ""
    print_status $GREEN "📊 Test Summary"
    print_status $GREEN "=============================="
    
    local passed_count=0
    local total_count=${#TEST_RESULTS[@]}
    
    for result in "${TEST_RESULTS[@]}"; do
        if [[ $result == *"PASSED"* ]]; then
            print_success "$result"
            ((passed_count++))
        elif [[ $result == *"FAILED"* ]]; then
            print_error "$result"
        else
            print_warning "$result"
        fi
    done
    
    echo ""
    print_status $GREEN "Results: $passed_count/$total_count test suites passed"
    
    if [ $passed_count -eq $total_count ]; then
        echo ""
        print_success "🎉 All Stripe integration tests passed!"
        print_success "Your Stripe integration is working correctly!"
        return 0
    else
        echo ""
        print_error "💥 Some tests failed. Please check the output above."
        return 1
    fi
}

# Function to show help
show_help() {
    print_status $GREEN "Stripe Integration Test Runner"
    echo ""
    print_status $CYAN "Usage: ./run_stripe_tests.sh [options]"
    echo ""
    print_status $YELLOW "Options:"
    print_status $NC "  --backend-only    Run only backend tests"
    print_status $NC "  --frontend-only   Run only frontend tests"
    print_status $NC "  --help           Show this help message"
    echo ""
    print_status $YELLOW "Examples:"
    print_status $NC "  ./run_stripe_tests.sh                # Run all tests"
    print_status $NC "  ./run_stripe_tests.sh --backend-only # Run only Django tests"
    print_status $NC "  ./run_stripe_tests.sh --frontend-only # Run only React tests"
}

# Main execution
main() {
    print_header
    
    # Check for specific test options
    case "${1:-}" in
        --backend-only)
            print_status $CYAN "Running backend tests only..."
            run_backend_tests
            ;;
        --frontend-only)
            print_status $CYAN "Running frontend tests only..."
            run_frontend_tests
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            # Run both tests
            local backend_success=true
            local frontend_success=true
            
            if ! run_backend_tests; then
                backend_success=false
            fi
            
            cd ..  # Return to root directory
            
            if ! run_frontend_tests; then
                frontend_success=false
            fi
            ;;
    esac
    
    # Show summary
    show_test_summary
}

# Make script executable and run
chmod +x "$0"
main "$@"
