# Hexa-Me Setup Guide

Complete setup instructions for the Hexa-Me Attendance Management System.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Redis 6+
- Flutter SDK 3.0+ (for mobile app)
- Git

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- Redis connection
- JWT secrets
- API keys (Google Maps, etc.)

4. Create PostgreSQL database:
```bash
createdb hexa_me
```

5. Start Redis:
```bash
redis-server
```

6. Run the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Admin Dashboard Setup

1. Navigate to admin dashboard directory:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Run development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3001`

## Mobile App Setup

1. Navigate to mobile app directory:
```bash
cd mobile-app
```

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Update API configuration in `lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://YOUR_SERVER_IP:3000/api';
```

4. Run the app:
```bash
flutter run
```

## Initial Setup

1. **Create Admin User** (via API or database):
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

2. **Login to Admin Dashboard**:
   - Go to `http://localhost:3001/login`
   - Use the admin credentials created above

3. **Create Work Zones**:
   - Navigate to Geofence section
   - Create work zones (circles or polygons)
   - Mark restricted areas (red zones)

4. **Add Employees**:
   - Navigate to Users section
   - Add employees or bulk import via CSV

## Development Workflow

### Backend Development
- API endpoints are in `backend/src/routes/`
- Models are in `backend/src/models/`
- Middleware in `backend/src/middleware/`

### Admin Dashboard Development
- Pages are in `admin-dashboard/src/app/`
- Components in `admin-dashboard/src/components/`
- State management in `admin-dashboard/src/store/`

### Mobile App Development
- Screens in `mobile-app/lib/screens/`
- Services in `mobile-app/lib/services/`
- Providers in `mobile-app/lib/providers/`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
cd mobile-app
flutter test
```

## Production Deployment

### Backend
1. Build the project:
```bash
npm run build
```

2. Set `NODE_ENV=production` in `.env`

3. Use PM2 or similar process manager:
```bash
pm2 start dist/server.js
```

### Admin Dashboard
1. Build the project:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

### Mobile App
1. Build APK (Android):
```bash
flutter build apk --release
```

2. Build IPA (iOS):
```bash
flutter build ios --release
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `createdb hexa_me`

### Redis Connection Issues
- Verify Redis is running: `redis-cli ping`
- Check Redis connection in `.env`

### API CORS Issues
- Update `CORS_ORIGIN` in backend `.env`
- Include all frontend URLs

### Mobile App API Connection
- Ensure device/emulator can reach server IP
- Check firewall settings
- Use `10.0.2.2` for Android emulator (localhost)

## Support

For issues or questions, refer to the documentation or contact support.


