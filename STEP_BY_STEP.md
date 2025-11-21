# Step-by-Step: How to Run Hexa-Me Project

Follow these steps exactly to get your system running.

## 📋 Prerequisites Check

Before starting, make sure you have these installed:

### Step 0: Check Prerequisites

**Check Node.js:**
```bash
node --version
# Should show v18 or higher
```

**Check PostgreSQL:**
```bash
psql --version
# Should show version 12 or higher
```

**Check Redis:**
```bash
redis-cli --version
# Should show version 6 or higher
```

If any are missing, install them first (see INSTALL.md for installation instructions).

---

## 🚀 Step-by-Step Setup

### STEP 1: Start PostgreSQL

**macOS:**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
- Start PostgreSQL service from Services panel

**Verify it's running:**
```bash
psql -U postgres -c "SELECT 1"
# Should return: ?column? | 1
```

---

### STEP 2: Start Redis

**macOS:**
```bash
brew services start redis
```

**Linux:**
```bash
sudo systemctl start redis
# OR
redis-server
```

**Windows:**
- Start Redis service or run `redis-server.exe`

**Verify it's running:**
```bash
redis-cli ping
# Should return: PONG
```

---

### STEP 3: Navigate to Project Directory

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance
```

---

### STEP 4: Create Database

```bash
createdb hexa_me
```

**If that doesn't work, use psql:**
```bash
psql -U postgres
CREATE DATABASE hexa_me;
\q
```

**Verify database exists:**
```bash
psql -U postgres -l | grep hexa_me
# Should show hexa_me in the list
```

---

### STEP 5: Set Up Backend

```bash
cd backend
```

**Install dependencies:**
```bash
npm install
```

**Create .env file:**
```bash
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

JWT_SECRET=dev_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3001,http://localhost:3002
EOF
```

**⚠️ IMPORTANT: Edit .env file and change `DB_PASSWORD` to your actual PostgreSQL password!**

If your PostgreSQL password is different, edit the file:
```bash
nano .env
# OR
open .env
```

Change this line:
```
DB_PASSWORD=postgres
```
To your actual password.

---

### STEP 6: Seed Database (Create Admin User)

```bash
npm run seed
```

**Expected output:**
```
🌱 Starting database seed...
✅ Database synced
✅ Default admin user created
   Email: admin@hexa-me.com
   Password: admin123
✅ Sample work zone created
✅ Sample employee created
🎉 Database seed completed successfully!
```

**If you see errors:**
- Check your database password in .env is correct
- Make sure database `hexa_me` exists
- Make sure PostgreSQL is running

---

### STEP 7: Start Backend Server

**Keep the terminal open and run:**
```bash
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connection established
Redis connection established
```

**✅ Backend is now running!**

**Keep this terminal window open!**

---

### STEP 8: Set Up Admin Dashboard

**Open a NEW terminal window** (keep backend running)

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance/admin-dashboard
```

**Install dependencies:**
```bash
npm install
```

**Create .env.local file:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
```

---

### STEP 9: Start Admin Dashboard

**In the same terminal (admin-dashboard directory):**
```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3001
  - ready started server on 0.0.0.0:3001
```

**✅ Dashboard is now running!**

**Keep this terminal window open too!**

---

### STEP 10: Access the System

**Open your web browser and go to:**
```
http://localhost:3001
```

**You should see the login page!**

---

### STEP 11: Login

**Use these credentials:**
- **Email:** `admin@hexa-me.com`
- **Password:** `admin123`

**Click "Sign In"**

**✅ You're in! You should see the dashboard.**

---

## 🎉 Success! You're Running!

You now have:
- ✅ Backend API running on port 3000
- ✅ Admin Dashboard running on port 3001
- ✅ Database with admin user
- ✅ Full access to all features

---

## 📊 What You Can Do Now

1. **View Dashboard** - See real-time statistics
2. **Create Users** - Go to Users page, click "Add User"
3. **Create Work Zones** - Go to Geofence page, click "Create Zone"
4. **View Attendance** - Go to Attendance page
5. **Generate Reports** - Go to Reports page
6. **Manage Settings** - Go to Settings page

---

## 🐛 Troubleshooting

### Backend won't start?

**Check:**
```bash
# Is PostgreSQL running?
psql -U postgres -c "SELECT 1"

# Is Redis running?
redis-cli ping

# Is database created?
psql -U postgres -l | grep hexa_me

# Check .env file has correct password
cat backend/.env | grep DB_PASSWORD
```

### Dashboard won't start?

**Check:**
```bash
# Is backend running on port 3000?
curl http://localhost:3000/health

# Check .env.local exists
cat admin-dashboard/.env.local
```

### Can't login?

**Check:**
```bash
# Did you run seed?
cd backend
npm run seed

# Test login via API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hexa-me.com","password":"admin123"}'
```

### Port already in use?

```bash
# Find what's using port 3000
lsof -i :3000

# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

---

## 🔄 Quick Reference Commands

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Dashboard:**
```bash
cd admin-dashboard
npm run dev
```

**Seed Database:**
```bash
cd backend
npm run seed
```

**Test Backend:**
```bash
curl http://localhost:3000/health
```

**Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hexa-me.com","password":"admin123"}'
```

---

## 📝 Summary Checklist

- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Database `hexa_me` created
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Backend .env file created and configured
- [ ] Database seeded (`npm run seed`)
- [ ] Backend running (`npm run dev` in backend/)
- [ ] Dashboard dependencies installed (`npm install` in admin-dashboard/)
- [ ] Dashboard .env.local created
- [ ] Dashboard running (`npm run dev` in admin-dashboard/)
- [ ] Can access http://localhost:3001
- [ ] Can login with admin credentials

---

## 🎯 Next Steps After Setup

1. **Create Work Zones:**
   - Go to Geofence page
   - Click "Create Zone"
   - Enter coordinates and radius

2. **Add Employees:**
   - Go to Users page
   - Click "Add User"
   - Fill in employee details

3. **Test Check-in:**
   - Use mobile app or API
   - Test geofence validation

4. **View Reports:**
   - Go to Reports page
   - Select date range
   - View analytics

---

**That's it! Your system is running!** 🚀

If you encounter any issues, check the troubleshooting section above or see INSTALL.md for more details.


