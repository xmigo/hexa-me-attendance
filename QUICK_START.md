# Quick Start Guide - See Hexa-Me in Action

Follow these steps to get the system running and see it in action.

## Step 1: Set Up Database

### Install PostgreSQL (if not installed)
- **macOS**: `brew install postgresql@14`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)
- **Linux**: `sudo apt-get install postgresql`

### Create Database
```bash
# Start PostgreSQL service
# macOS: brew services start postgresql@14
# Linux: sudo systemctl start postgresql

# Create database
createdb hexa_me

# Or using psql:
psql -U postgres
CREATE DATABASE hexa_me;
\q
```

## Step 2: Set Up Redis

### Install Redis (if not installed)
- **macOS**: `brew install redis`
- **Windows**: Download from [redis.io](https://redis.io/download)
- **Linux**: `sudo apt-get install redis-server`

### Start Redis
```bash
# macOS/Linux
redis-server

# Or as a service
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

## Step 3: Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development

# Database - UPDATE WITH YOUR CREDENTIALS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hexa_me
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets - CHANGE THESE IN PRODUCTION
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

# Optional: Maps API (for future use)
GOOGLE_MAPS_API_KEY=
MAPBOX_API_KEY=
EOF

# Start backend server
npm run dev
```

The backend will run on `http://localhost:3000`

## Step 4: Configure Admin Dashboard

Open a **new terminal window**:

```bash
cd admin-dashboard

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Start admin dashboard
npm run dev
```

The admin dashboard will run on `http://localhost:3001`

## Step 5: Create Admin User

Open a **new terminal window** and create an admin user:

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hexa-me.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

Or use a tool like Postman or create a simple script:

```bash
# Create admin script
cat > create_admin.js << 'EOF'
const axios = require('axios');

axios.post('http://localhost:3000/api/auth/register', {
  email: 'admin@hexa-me.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
})
.then(response => {
  console.log('Admin user created:', response.data);
})
.catch(error => {
  console.error('Error:', error.response?.data || error.message);
});
EOF

node create_admin.js
```

## Step 6: Access the Applications

### Admin Dashboard
1. Open browser: `http://localhost:3001`
2. You'll be redirected to login
3. Login with:
   - Email: `admin@hexa-me.com`
   - Password: `admin123`

### Backend API
- Health check: `http://localhost:3000/health`
- API base: `http://localhost:3000/api`

### Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hexa-me.com",
    "password": "admin123"
  }'
```

## Step 7: Set Up Mobile App (Optional)

```bash
cd mobile-app

# Install Flutter dependencies
flutter pub get

# Update API URL in lib/config/api_config.dart
# Change: static const String baseUrl = 'http://localhost:3000/api';
# To your computer's IP address for physical device:
# static const String baseUrl = 'http://192.168.1.XXX:3000/api';
# Or use 10.0.2.2 for Android emulator

# Run on emulator/device
flutter run
```

**Note**: For mobile app to connect:
- **Android Emulator**: Use `http://10.0.2.2:3000/api`
- **iOS Simulator**: Use `http://localhost:3000/api`
- **Physical Device**: Use your computer's IP (e.g., `http://192.168.1.100:3000/api`)

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep hexa_me
```

### Redis Connection Error
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it: kill -9 <PID>

# Or change PORT in backend/.env
```

### CORS Errors
- Make sure `CORS_ORIGIN` in backend `.env` includes your frontend URL
- Check browser console for specific CORS errors

### Admin Dashboard Not Loading
- Check that backend is running on port 3000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors

## What You Can Do Now

1. **Login to Admin Dashboard**: `http://localhost:3001`
2. **Create Work Zones**: (UI to be implemented, but API is ready)
3. **Add Employees**: (UI to be implemented, but API is ready)
4. **Test API**: Use Postman or curl to test endpoints
5. **View Database**: Connect to PostgreSQL and see tables

## Next Steps

1. **Create Work Zone via API**:
```bash
# First, get your auth token from login
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/api/geofence \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Office",
    "zoneType": "circle",
    "centerLat": 40.7128,
    "centerLng": -74.0060,
    "radius": 100,
    "isRestricted": false,
    "bufferDistance": 50
  }'
```

2. **View All Zones**:
```bash
curl -X GET http://localhost:3000/api/geofence \
  -H "Authorization: Bearer $TOKEN"
```

3. **Check Dashboard Stats**:
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Quick Test Checklist

- [ ] PostgreSQL running and database created
- [ ] Redis running
- [ ] Backend server started (port 3000)
- [ ] Admin dashboard started (port 3001)
- [ ] Admin user created
- [ ] Can login to admin dashboard
- [ ] API health check works
- [ ] Can make authenticated API calls

Once all checked, you're ready to start using the system!


