# How to See Hexa-Me in Action

## 🎯 Quick Overview

You have 3 components:
1. **Backend API** - Runs on port 3000
2. **Admin Dashboard** - Runs on port 3001 (web browser)
3. **Mobile App** - Runs on your phone/emulator

## 📋 Step-by-Step: See It Now

### Option 1: Quick Test (5 minutes)

#### 1. Check Prerequisites
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance

# Run the setup checker
./start.sh
```

#### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 3. Configure Backend
Edit `backend/.env` and set your PostgreSQL password:
```bash
# Open the file
nano backend/.env
# or
open backend/.env

# Update this line:
DB_PASSWORD=your_actual_postgres_password
```

#### 4. Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Database connection established
```

#### 5. Test Backend (New Terminal)
```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return: {"status":"ok","timestamp":"..."}
```

#### 6. Create Admin User
```bash
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

#### 7. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hexa-me.com",
    "password": "admin123"
  }'
```

You'll get a token - save it!

#### 8. Start Admin Dashboard (New Terminal)
```bash
cd admin-dashboard
npm install
npm run dev
```

#### 9. Open in Browser
Go to: **http://localhost:3001**

You should see the login page (or be redirected there).

---

### Option 2: Using Postman/Thunder Client

1. **Import Collection** (create these requests):

   **Register Admin:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "email": "admin@hexa-me.com",
     "password": "admin123",
     "firstName": "Admin",
     "lastName": "User",
     "role": "admin"
   }
   ```

   **Login:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "admin@hexa-me.com",
     "password": "admin123"
   }
   ```

   **Get Dashboard Stats:**
   - Method: GET
   - URL: `http://localhost:3000/api/admin/dashboard`
   - Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

2. Test the flow!

---

### Option 3: View Database Directly

```bash
# Connect to PostgreSQL
psql -U postgres -d hexa_me

# See tables
\dt

# See users
SELECT id, email, first_name, last_name, role FROM users;

# See work zones
SELECT * FROM work_zones;

# Exit
\q
```

---

## 🖥️ What You'll See

### Backend API
- **Health Check**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api
- **Logs**: In terminal where you ran `npm run dev`

### Admin Dashboard
- **URL**: http://localhost:3001
- **Login Page**: (will redirect automatically)
- **Dashboard**: After login (UI needs implementation, but API works)

### Mobile App
- **Login Screen**: When you run `flutter run`
- **Home Screen**: After login
- **Check-in Screen**: Tap check-in button

---

## 🧪 Test API Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Create Work Zone (after login, use token)
```bash
TOKEN="your_token_here"

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

### 3. Get All Zones
```bash
curl -X GET http://localhost:3000/api/geofence \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Dashboard Stats
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Mobile App Setup

### For Android Emulator:
```bash
cd mobile-app

# Update API URL
# Edit lib/config/api_config.dart
# Change to: static const String baseUrl = 'http://10.0.2.2:3000/api';

flutter pub get
flutter run
```

### For Physical Device:
```bash
# Find your computer's IP
# macOS: ifconfig | grep "inet "
# Windows: ipconfig

# Update lib/config/api_config.dart
# Change to: static const String baseUrl = 'http://YOUR_IP:3000/api';

flutter run
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check password in `backend/.env`
- Check database exists: `psql -U postgres -l | grep hexa_me`

### "Port 3000 already in use"
```bash
# Find what's using it
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change PORT in backend/.env
```

### "Redis connection failed"
```bash
# Start Redis
redis-server

# Or as service
brew services start redis
```

### "Admin dashboard shows errors"
- Check backend is running on port 3000
- Check `admin-dashboard/.env.local` has correct API URL
- Open browser console (F12) to see errors

### "Mobile app can't connect"
- **Emulator**: Use `10.0.2.2` instead of `localhost`
- **Physical device**: Use your computer's IP address
- Check firewall isn't blocking port 3000

---

## ✅ Success Checklist

- [ ] Backend running on port 3000
- [ ] Can access http://localhost:3000/health
- [ ] Admin user created successfully
- [ ] Can login via API and get token
- [ ] Admin dashboard running on port 3001
- [ ] Can open http://localhost:3001 in browser
- [ ] Database has tables (check via psql)

---

## 🎉 Next: What to Build

Once you can see the backend working:

1. **Build Admin Dashboard UI**:
   - Login page
   - Dashboard with stats
   - User management page
   - Geofence management with map

2. **Enhance Mobile App**:
   - Map view with zones
   - Better UI/UX
   - Offline sync
   - Notifications

3. **Add Features**:
   - Email notifications
   - PDF reports
   - Bulk user import
   - Advanced analytics

---

## 📞 Quick Commands Reference

```bash
# Start everything
cd backend && npm run dev          # Terminal 1
cd admin-dashboard && npm run dev  # Terminal 2
cd mobile-app && flutter run       # Terminal 3

# Test API
curl http://localhost:3000/health

# Create admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hexa-me.com","password":"admin123","firstName":"Admin","lastName":"User","role":"admin"}'

# View database
psql -U postgres -d hexa_me
```

**You're all set! Start with the backend, then move to the dashboard and mobile app.** 🚀


