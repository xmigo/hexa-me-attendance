# Hexa-Me Backend API

Node.js/Express backend for the Hexa-Me attendance management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL database:
```bash
createdb hexa_me
```

4. Set up Redis (for session management):
```bash
# Install and start Redis
redis-server
```

5. Run migrations (if using):
```bash
npm run migrate:up
```

6. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/history` - Get attendance history

### Geofence
- `GET /api/geofence` - Get all work zones
- `GET /api/geofence/:id` - Get single work zone
- `POST /api/geofence` - Create work zone (admin/manager)
- `PUT /api/geofence/:id` - Update work zone (admin/manager)
- `DELETE /api/geofence/:id` - Delete work zone (admin)
- `POST /api/geofence/validate` - Validate location

### Users
- `GET /api/users` - Get all users (admin/manager/hr)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (admin)

### Location
- `POST /api/location` - Record location
- `GET /api/location/history` - Get location history

### Reports
- `GET /api/reports/attendance-summary` - Attendance summary
- `GET /api/reports/violations` - Violation report
- `GET /api/reports/daily` - Daily attendance report

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/realtime-locations` - Real-time locations

## WebSocket Events

- `attendance-update` - Emitted when attendance record is created
- `location-update` - Emitted when location is updated

## Database Models

- User
- WorkZone
- AttendanceRecord
- LocationHistory
- BiometricEnrollment


