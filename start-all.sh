#!/bin/bash

# Hexa-Me Complete System Startup Script
# Starts all services in the correct order

echo "🚀 Starting Hexa-Me System"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
check_service() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓ $1 found${NC}"
        return 0
    else
        echo -e "${RED}✗ $1 not found${NC}"
        return 1
    fi
}

echo "Checking prerequisites..."
check_service node
check_service psql
check_service redis-cli

# Check PostgreSQL
if psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL is not running. Please start it.${NC}"
    echo "  macOS: brew services start postgresql@14"
    echo "  Linux: sudo systemctl start postgresql"
fi

# Check Redis
if redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${YELLOW}⚠ Redis is not running. Starting...${NC}"
    redis-server --daemonize yes
    sleep 2
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis started${NC}"
    else
        echo -e "${RED}✗ Failed to start Redis${NC}"
    fi
fi

# Check database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw hexa_me; then
    echo -e "${GREEN}✓ Database 'hexa_me' exists${NC}"
else
    echo -e "${YELLOW}⚠ Database 'hexa_me' not found. Creating...${NC}"
    createdb hexa_me
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created${NC}"
        echo -e "${YELLOW}⚠ Run 'npm run seed' in backend directory to seed data${NC}"
    else
        echo -e "${RED}✗ Failed to create database${NC}"
    fi
fi

echo ""
echo "=========================="
echo ""
echo "Starting services..."
echo ""

# Function to start service in new terminal
start_in_terminal() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd '$1' && $2\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        gnome-terminal -- bash -c "cd '$1' && $2; exec bash" 2>/dev/null || \
        xterm -e "cd '$1' && $2" 2>/dev/null || \
        echo "Please start manually: cd '$1' && $2"
    else
        echo "Please start manually: cd '$1' && $2"
    fi
}

# Start Backend
echo "Starting Backend Server..."
if [ -d "backend" ]; then
    cd backend
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠ .env file not found. Creating from example...${NC}"
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${YELLOW}⚠ Please edit backend/.env with your database password${NC}"
        fi
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "Installing backend dependencies..."
        npm install
    fi
    
    echo -e "${GREEN}Starting backend on http://localhost:3000${NC}"
    start_in_terminal "$(pwd)" "npm run dev"
    cd ..
    sleep 3
else
    echo -e "${RED}✗ Backend directory not found${NC}"
fi

# Start Admin Dashboard
echo "Starting Admin Dashboard..."
if [ -d "admin-dashboard" ]; then
    cd admin-dashboard
    if [ ! -f ".env.local" ]; then
        echo "Creating .env.local..."
        echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dashboard dependencies..."
        npm install
    fi
    
    echo -e "${GREEN}Starting dashboard on http://localhost:3001${NC}"
    start_in_terminal "$(pwd)" "npm run dev"
    cd ..
    sleep 3
else
    echo -e "${RED}✗ Admin dashboard directory not found${NC}"
fi

echo ""
echo "=========================="
echo -e "${GREEN}Services starting!${NC}"
echo ""
echo "Access points:"
echo "  📊 Admin Dashboard: http://localhost:3001"
echo "  🔌 Backend API: http://localhost:3000"
echo "  ❤️  Health Check: http://localhost:3000/health"
echo ""
echo "Default credentials:"
echo "  Email: admin@hexa-me.com"
echo "  Password: admin123"
echo ""
echo "Note: Services are starting in separate terminal windows."
echo "Check those windows for any errors."


