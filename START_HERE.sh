#!/bin/bash

echo "🚀 Starting Hexa-Me - This will set everything up automatically"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if PostgreSQL is running
if ! psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    brew services start postgresql@14 2>/dev/null || sudo systemctl start postgresql 2>/dev/null
    sleep 2
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    redis-server --daemonize yes 2>/dev/null || brew services start redis 2>/dev/null
    sleep 2
fi

# Create database if it doesn't exist
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw hexa_me; then
    echo -e "${YELLOW}Creating database...${NC}"
    createdb hexa_me 2>/dev/null || psql -U postgres -c "CREATE DATABASE hexa_me;" 2>/dev/null
fi

# Setup Backend
echo -e "${GREEN}Setting up backend...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    npm install --silent
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hexa_me
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev_secret_key_12345
JWT_REFRESH_SECRET=dev_refresh_secret_12345
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
EOF
    echo -e "${YELLOW}⚠ Created .env file with default password 'postgres'${NC}"
    echo -e "${YELLOW}⚠ If your PostgreSQL password is different, edit backend/.env${NC}"
fi

# Seed database
echo -e "${GREEN}Creating admin user...${NC}"
npm run seed 2>/dev/null || node -r ts-node/register src/database/seed.ts 2>/dev/null

# Start backend in background
echo -e "${GREEN}Starting backend server...${NC}"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
sleep 5

cd ../admin-dashboard

# Setup Dashboard
echo -e "${GREEN}Setting up dashboard...${NC}"
if [ ! -d "node_modules" ]; then
    npm install --silent
fi

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Start dashboard
echo -e "${GREEN}Starting dashboard...${NC}"
npm run dev > ../dashboard.log 2>&1 &
DASHBOARD_PID=$!
sleep 5

echo ""
echo "================================================================"
echo -e "${GREEN}✅ SYSTEM IS RUNNING!${NC}"
echo "================================================================"
echo ""
echo "🌐 Website: http://localhost:3001"
echo "👤 Login: admin@hexa-me.com"
echo "🔑 Password: admin123"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Dashboard: tail -f dashboard.log"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $DASHBOARD_PID"
echo ""
echo "Opening browser..."
sleep 2
open http://localhost:3001 2>/dev/null || xdg-open http://localhost:3001 2>/dev/null || echo "Please open http://localhost:3001 in your browser"


