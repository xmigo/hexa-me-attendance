#!/bin/bash

echo "🚀 Hexa-Me Quick Start Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    if psql -U postgres -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        echo -e "${RED}✗ PostgreSQL is not accessible${NC}"
        echo "  Please start PostgreSQL: brew services start postgresql@14"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL not found. Please install it.${NC}"
fi

# Check if Redis is running
echo "Checking Redis..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${RED}✗ Redis is not running${NC}"
        echo "  Starting Redis..."
        redis-server --daemonize yes
        sleep 2
        if redis-cli ping &> /dev/null; then
            echo -e "${GREEN}✓ Redis started${NC}"
        else
            echo -e "${RED}✗ Failed to start Redis${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠ Redis not found. Please install it.${NC}"
fi

# Check if database exists
echo "Checking database..."
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw hexa_me; then
    echo -e "${GREEN}✓ Database 'hexa_me' exists${NC}"
else
    echo -e "${YELLOW}⚠ Database 'hexa_me' not found${NC}"
    echo "  Creating database..."
    createdb hexa_me
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created${NC}"
    else
        echo -e "${RED}✗ Failed to create database${NC}"
        exit 1
    fi
fi

# Check backend .env
echo "Checking backend configuration..."
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠ Backend .env not found${NC}"
    echo "  Creating .env from .env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}⚠ Please edit backend/.env with your database credentials${NC}"
    fi
else
    echo -e "${GREEN}✓ Backend .env exists${NC}"
fi

# Check admin dashboard .env.local
echo "Checking admin dashboard configuration..."
if [ ! -f "admin-dashboard/.env.local" ]; then
    echo -e "${YELLOW}⚠ Admin dashboard .env.local not found${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > admin-dashboard/.env.local
    echo -e "${GREEN}✓ Created admin-dashboard/.env.local${NC}"
else
    echo -e "${GREEN}✓ Admin dashboard .env.local exists${NC}"
fi

echo ""
echo "=============================="
echo -e "${GREEN}Setup check complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database password"
echo "2. Install dependencies:"
echo "   cd backend && npm install"
echo "   cd ../admin-dashboard && npm install"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start dashboard: cd admin-dashboard && npm run dev"
echo ""
echo "Then open: http://localhost:3001"


