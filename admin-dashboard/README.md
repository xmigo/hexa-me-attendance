# Hexa-Me Admin Dashboard

Next.js admin dashboard for managing the Hexa-Me attendance system.

## Features

- User management (add, edit, delete, bulk import)
- Work zone creation and management
- Restricted area (red zone) enforcement
- Real-time attendance monitoring
- Location tracking and analytics
- Comprehensive reporting
- Interactive map visualization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # React components
├── lib/          # Utilities and API client
├── store/        # State management (Zustand)
└── types/        # TypeScript types
```

## Pages

- `/login` - Admin login
- `/dashboard` - Main dashboard with statistics
- `/users` - User management
- `/geofence` - Work zone management
- `/attendance` - Attendance monitoring
- `/reports` - Reports and analytics
- `/settings` - System settings


