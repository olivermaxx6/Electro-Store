#!/bin/bash

# =============================================
# ELECTRO-STORE DEVELOPMENT ENVIRONMENT
# Django: 127.0.0.1:8001 | Admin: 5174 | Storefront: 5173
# =============================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}ELECTRO-STORE DEVELOPMENT ENVIRONMENT${NC}"
echo -e "${BLUE}=============================================${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"
FRONTEND_DIR="$SCRIPT_DIR/../Frontend"

# Check if we're in the Backend directory
if [ ! -f "$BACKEND_DIR/manage.py" ]; then
    echo -e "${RED}Error: This script must be run from the Backend directory${NC}"
    echo -e "${YELLOW}Current directory: $(pwd)${NC}"
    echo -e "${YELLOW}Expected manage.py at: $BACKEND_DIR/manage.py${NC}"
    exit 1
fi

# Check if Frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${YELLOW}Warning: Frontend directory not found at $FRONTEND_DIR${NC}"
    echo -e "${YELLOW}You'll need to start your frontend manually${NC}"
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if netstat -tulpn 2>/dev/null | grep ":$port " > /dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check port availability
echo -e "\n${YELLOW}Checking port availability...${NC}"

if check_port 8001; then
    echo -e "${RED}❌ Port 8001 is already in use${NC}"
    echo -e "${YELLOW}Please stop the service using port 8001 and try again${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Port 8001 is available${NC}"
fi

if check_port 5173; then
    echo -e "${YELLOW}⚠️  Port 5173 (storefront) is in use${NC}"
fi

if check_port 5174; then
    echo -e "${YELLOW}⚠️  Port 5174 (admin) is in use${NC}"
fi

# Start Django backend
echo -e "\n${GREEN}Starting Django on 127.0.0.1:8001...${NC}"
cd "$BACKEND_DIR"

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source venv/bin/activate
elif [ -d "../venv" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source ../venv/bin/activate
fi

# Start Django server
python3 manage.py runserver 127.0.0.1:8001 &
DJANGO_PID=$!

# Wait for Django to start
echo -e "${BLUE}Waiting for Django to start...${NC}"
sleep 5

# Check if Django started successfully
if ps -p $DJANGO_PID > /dev/null; then
    echo -e "${GREEN}✅ Django running on http://127.0.0.1:8001${NC}"
else
    echo -e "${RED}❌ Django failed to start${NC}"
    exit 1
fi

# Display connection information
echo -e "\n${BLUE}=============================================${NC}"
echo -e "${BLUE}DEVELOPMENT ENVIRONMENT READY${NC}"
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}Backend API:${NC} http://127.0.0.1:8001/api/"
echo -e "${GREEN}Django Admin:${NC} http://127.0.0.1:8001/admin/"
echo -e "${GREEN}Health Check:${NC} http://127.0.0.1:8001/health/"

echo -e "\n${YELLOW}📋 Start your frontends manually:${NC}"
if [ -d "$FRONTEND_DIR" ]; then
    echo -e "   ${BLUE}Storefront:${NC} cd $FRONTEND_DIR && npm run dev (port 5173)"
    echo -e "   ${BLUE}Admin:${NC} cd $FRONTEND_DIR && npm run dev:admin (port 5174)"
else
    echo -e "   ${YELLOW}Frontend directory not found at: $FRONTEND_DIR${NC}"
    echo -e "   ${YELLOW}Please start your frontend manually${NC}"
fi

echo -e "\n${YELLOW}🔧 Useful commands:${NC}"
echo -e "   ${BLUE}Create superuser:${NC} python3 manage.py createsuperuser"
echo -e "   ${BLUE}Run migrations:${NC} python3 manage.py migrate"
echo -e "   ${BLUE}Collect static:${NC} python3 manage.py collectstatic"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping Django server...${NC}"
    kill $DJANGO_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Django server stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for Django process
wait $DJANGO_PID
