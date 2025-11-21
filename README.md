# Hexa-Me: Complete Attendance Management System

A comprehensive, production-ready attendance management system with biometric authentication, real-time location tracking, and geofencing capabilities.

## 🎯 What is Hexa-Me?

Hexa-Me is a complete turnkey solution for managing employee attendance with:

- ✅ **Biometric Authentication** (Fingerprint & Face Recognition)
- ✅ **GPS Location Tracking** with Geofencing
- ✅ **Real-time Monitoring** Dashboard
- ✅ **Work Zone Management** (Allowed & Restricted Areas)
- ✅ **Comprehensive Reporting** & Analytics
- ✅ **Mobile App** for Employees
- ✅ **Admin Dashboard** for Management

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Start all services
./start-all.sh

# 2. Seed database (in backend directory)
cd backend && npm run seed

# 3. Access dashboard
# Open: http://localhost:3001
# Login: admin@hexa-me.com / admin123
```

### Option 2: Manual Setup

See [INSTALL.md](INSTALL.md) for detailed step-by-step instructions.

## 📦 Project Structure

```
Attendance/
├── backend/              # Node.js/Express API Server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Database models
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── utils/        # Utilities (geofence, logger)
│   ├── scripts/         # Setup scripts
│   └── package.json
│
├── admin-dashboard/      # Next.js Admin Dashboard
│   ├── src/
│   │   ├── app/        # Pages (Next.js App Router)
│   │   ├── components/ # React components
│   │   └── store/       # State management
│   └── package.json
│
├── mobile-app/          # Flutter Mobile App
│   ├── lib/
│   │   ├── screens/    # App screens
│   │   ├── providers/  # State management
│   │   └── services/   # API services
│   └── pubspec.yaml
│
├── INSTALL.md           # Complete installation guide
├── QUICK_START.md       # Quick start guide
├── SETUP.md             # Setup instructions
└── start-all.sh         # Start all services script
```

## 🎨 Features

### Backend API
- RESTful API with Express.js & TypeScript
- PostgreSQL database with Sequelize ORM
- Redis for session management
- JWT authentication with refresh tokens
- Real-time updates with Socket.IO
- Geofencing system (circles & polygons)
- Comprehensive error handling & logging

### Admin Dashboard
- **Dashboard Home**: Real-time statistics & overview
- **User Management**: Create, edit, delete users
- **Geofence Management**: Create work zones & restricted areas
- **Attendance Monitoring**: View daily attendance & violations
- **Reports & Analytics**: Charts, statistics, violation reports
- **Settings**: Profile management

### Mobile App
- Biometric authentication
- GPS check-in/check-out
- Geofence validation
- Attendance history
- Offline support

## 📋 Prerequisites

- **Node.js 18+**
- **PostgreSQL 12+**
- **Redis 6+**
- **Flutter 3.0+** (for mobile app)

## 🔧 Installation

### 1. Install Prerequisites

**macOS:**
```bash
brew install node postgresql@14 redis
```

**Ubuntu/Debian:**
```bash
sudo apt install nodejs npm postgresql postgresql-contrib redis-server
```

### 2. Set Up Backend

```bash
cd backend
npm install
npm run setup  # Creates .env file
# Edit .env with your database password
createdb hexa_me
npm run seed   # Creates admin user
npm run dev    # Start server
```

### 3. Set Up Admin Dashboard

```bash
cd admin-dashboard
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
npm run dev    # Start dashboard
```

### 4. Access System

- **Dashboard**: http://localhost:3001
- **API**: http://localhost:3000
- **Login**: admin@hexa-me.com / admin123

## 📚 Documentation

- **[INSTALL.md](INSTALL.md)** - Complete installation guide
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[admin-dashboard/DASHBOARD_FEATURES.md](admin-dashboard/DASHBOARD_FEATURES.md)** - Dashboard features

## 🎯 Default Credentials

After running `npm run seed` in backend:

- **Admin User:**
  - Email: `admin@hexa-me.com`
  - Password: `admin123`

- **Sample Employee:**
  - Email: `employee@hexa-me.com`
  - Password: `employee123`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/history` - Attendance history

### Geofence
- `GET /api/geofence` - List zones
- `POST /api/geofence` - Create zone
- `PUT /api/geofence/:id` - Update zone
- `DELETE /api/geofence/:id` - Delete zone

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reports
- `GET /api/reports/attendance-summary` - Attendance summary
- `GET /api/reports/violations` - Violations report
- `GET /api/reports/daily` - Daily report

See `backend/README.md` for complete API documentation.

## 🛠️ Development

### Backend
```bash
cd backend
npm run dev      # Development server
npm run build    # Build for production
npm run seed     # Seed database
npm test         # Run tests
```

### Admin Dashboard
```bash
cd admin-dashboard
npm run dev      # Development server
npm run build    # Build for production
npm start        # Production server
```

### Mobile App
```bash
cd mobile-app
flutter pub get  # Install dependencies
flutter run      # Run app
```

## 🐛 Troubleshooting

### Database Connection
```bash
# Check PostgreSQL
psql -U postgres -c "SELECT 1"

# Create database
createdb hexa_me
```

### Redis Connection
```bash
# Check Redis
redis-cli ping

# Start Redis
redis-server
```

### Port Issues
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

See [INSTALL.md](INSTALL.md) for more troubleshooting tips.

## 📦 Production Deployment

### Backend
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Admin Dashboard
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

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## 📊 Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Redis
- **Admin Dashboard**: Next.js, React, TypeScript, TailwindCSS
- **Mobile App**: Flutter, Dart
- **Real-time**: Socket.IO
- **Charts**: Recharts

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For issues or questions:
1. Check documentation in this README
2. Review [INSTALL.md](INSTALL.md) troubleshooting section
3. Check error logs in `backend/logs/`

## 🎉 Getting Started Checklist

- [ ] Install prerequisites (Node.js, PostgreSQL, Redis)
- [ ] Clone/navigate to project directory
- [ ] Run `./start-all.sh` or follow manual setup
- [ ] Seed database: `cd backend && npm run seed`
- [ ] Access dashboard: http://localhost:3001
- [ ] Login with admin credentials
- [ ] Create work zones
- [ ] Add employees
- [ ] Start using the system!

---

**Hexa-Me is ready to use! Start with `./start-all.sh` or see [INSTALL.md](INSTALL.md) for detailed setup.** 🚀
