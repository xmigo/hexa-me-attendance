# Hexa-Me Complete Installation Guide

## 🎯 Turnkey Installation

This guide will help you set up the complete Hexa-Me system from scratch.

## Prerequisites

### Required Software

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
3. **Redis 6+** - [Download](https://redis.io/download)

### Quick Install Prerequisites

**macOS (using Homebrew):**
```bash
brew install node postgresql@14 redis
brew services start postgresql@14
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib redis-server
sudo systemctl start postgresql
sudo systemctl start redis
```

**Windows:**
- Download and install from official websites
- Or use Chocolatey: `choco install nodejs postgresql redis`

## 🚀 Quick Start (Automated Setup)

### Step 1: Clone/Navigate to Project
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance
```

### Step 2: Set Up Backend
```bash
cd backend
chmod +x scripts/setup.sh
npm run setup
# OR manually:
npm install
# Edit .env with your database password
```

### Step 3: Create Database
```bash
# Create database
createdb hexa_me

# Or using psql:
psql -U postgres
CREATE DATABASE hexa_me;
\q
```

### Step 4: Seed Database
```bash
cd backend
npm run seed
```

This creates:
- Default admin user (admin@hexa-me.com / admin123)
- Sample employee (employee@hexa-me.com / employee123)
- Sample work zone

### Step 5: Start Backend
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3000`

### Step 6: Set Up Admin Dashboard
```bash
cd admin-dashboard
chmod +x scripts/setup.sh
npm run setup
# OR manually:
npm install
# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 7: Start Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```

Dashboard will run on `http://localhost:3001`

### Step 8: Access the System

1. **Admin Dashboard**: http://localhost:3001
   - Login: admin@hexa-me.com
   - Password: admin123

2. **Backend API**: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API docs: http://localhost:3000/api

## 📋 Manual Setup (Step by Step)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Edit `.env` file:**
```env
DB_PASSWORD=your_postgres_password_here
# Update other values as needed
```

5. **Create database:**
```bash
createdb hexa_me
```

6. **Seed database:**
```bash
npm run seed
```

7. **Start server:**
```bash
npm run dev
```

### Admin Dashboard Setup

1. **Navigate to admin-dashboard directory:**
```bash
cd admin-dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
```

4. **Start dashboard:**
```bash
npm run dev
```

### Mobile App Setup (Optional)

1. **Navigate to mobile-app directory:**
```bash
cd mobile-app
```

2. **Install Flutter dependencies:**
```bash
flutter pub get
```

3. **Update API URL in `lib/config/api_config.dart`:**
```dart
static const String baseUrl = 'http://localhost:3000/api';
// For Android emulator: 'http://10.0.2.2:3000/api'
// For physical device: 'http://YOUR_IP:3000/api'
```

4. **Run app:**
```bash
flutter run
```

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hexa_me
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (Generate new secrets for production)
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

### Admin Dashboard Configuration (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## ✅ Verification

### Test Backend
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hexa-me.com",
    "password": "admin123"
  }'
```

### Test Dashboard
- Open: http://localhost:3001
- Should see login page
- Login with admin credentials

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check database exists
psql -U postgres -l | grep hexa_me

# Create if missing
createdb hexa_me
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server
# Or: brew services start redis (macOS)
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x start.sh
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📦 Production Deployment

### Build Backend
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Build Admin Dashboard
```bash
cd admin-dashboard
npm run build
npm start
```

### Environment Variables
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production database
- Set up SSL/HTTPS
- Configure proper CORS origins

## 🎉 Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Database `hexa_me` created
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Database seeded
- [ ] Backend running on port 3000
- [ ] Admin dashboard dependencies installed
- [ ] Admin dashboard .env.local configured
- [ ] Admin dashboard running on port 3001
- [ ] Can access http://localhost:3001
- [ ] Can login with admin credentials

## 📚 Additional Resources

- **Backend API Docs**: See `backend/README.md`
- **Dashboard Features**: See `admin-dashboard/DASHBOARD_FEATURES.md`
- **Quick Start**: See `QUICK_START.md`
- **Setup Guide**: See `SETUP.md`

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error logs in `backend/logs/`
3. Verify all prerequisites are installed
4. Ensure all services are running
5. Check environment variables are correct

---

**Your Hexa-Me system is now ready to use!** 🚀


