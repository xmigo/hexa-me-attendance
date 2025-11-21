# Hexa-Me Attendance System - Deployment Guide

## Overview
This guide covers deploying all three components of the Hexa-Me system:
- Backend API (Node.js/Express)
- Admin Dashboard (Next.js)
- Mobile App (Flutter)

---

## Option 1: Railway.app Deployment (Recommended)

### Prerequisites
- GitHub account
- Railway.app account (free tier available)

### Step 1: Prepare Repository
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance
git init
git add .
git commit -m "Initial commit"
```

Push to GitHub:
```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/hexa-me-attendance.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy PostgreSQL Database
1. Go to https://railway.app
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the connection URL (DATABASE_URL)

### Step 3: Deploy Backend API
1. In Railway, click "New" → "GitHub Repo"
2. Select your repository
3. Choose `/backend` as root directory
4. Add environment variables:
   ```
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
   NODE_ENV=production
   PORT=3000
   REDIS_HOST=<optional>
   REDIS_PORT=6379
   ```
5. Railway will auto-deploy
6. Copy the public URL (e.g., `https://your-backend.railway.app`)

### Step 4: Deploy Admin Dashboard
1. In Railway, click "New" → "GitHub Repo"
2. Select your repository
3. Choose `/admin-dashboard` as root directory
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
5. Copy the public URL (e.g., `https://your-admin.railway.app`)

### Step 5: Update Mobile App
Edit `/mobile-app/lib/config/api_config.dart`:
```dart
class ApiConfig {
  static const String baseUrl = 'https://your-backend.railway.app/api';
  // ... rest of config
}
```

Rebuild the mobile app:
```bash
cd mobile-app
flutter build apk --release
```

The APK will be at: `build/app/outputs/flutter-apk/app-release.apk`

---

## Option 2: Vercel + Render Deployment

### Backend (Render.com)
1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (same as Railway)
5. Deploy

### Admin Dashboard (Vercel)
1. Go to https://vercel.com
2. Import GitHub repository
3. Select `/admin-dashboard` directory
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy

### Database (Supabase or Neon)
1. Create free PostgreSQL on Supabase.com or Neon.tech
2. Copy connection string
3. Update backend DATABASE_URL

---

## Option 3: VPS Deployment (DigitalOcean, Linode, AWS)

### Requirements
- VPS with Ubuntu 22.04
- Domain name (optional)
- SSH access

### Setup Script
```bash
# Install Node.js, PostgreSQL, Nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql nginx

# Setup PostgreSQL
sudo -u postgres createdb hexa_me
sudo -u postgres createuser hexa_admin

# Clone repository
git clone https://github.com/YOUR_USERNAME/hexa-me-attendance.git
cd hexa-me-attendance

# Setup Backend
cd backend
npm install
npm run build
sudo npm install -g pm2
pm2 start dist/server.js --name hexa-backend

# Setup Admin Dashboard
cd ../admin-dashboard
npm install
npm run build
pm2 start npm --name hexa-admin -- start

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/hexa-me
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/hexa-me /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Mobile App Distribution

### Google Play Store (Recommended)
1. Create developer account ($25 one-time fee)
2. Build release APK:
   ```bash
   flutter build apk --release
   ```
3. Upload to Google Play Console
4. Follow app review process

### Direct APK Distribution
1. Host APK on your server or cloud storage
2. Share download link with users
3. Users must enable "Install from Unknown Sources"

### Internal Testing
1. Use Firebase App Distribution (free)
2. Invite testers via email
3. They get automatic updates

---

## Database Migrations

Before deployment, ensure database is set up:

```bash
cd backend
npm run migrate:up
npm run seed  # Optional: Add sample data
```

---

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/database
JWT_SECRET=change-this-to-random-secret
JWT_REFRESH_SECRET=change-this-to-different-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
REDIS_HOST=localhost (optional)
REDIS_PORT=6379
CORS_ORIGIN=https://your-admin-dashboard.com
```

### Admin Dashboard (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.com/api
```

### Mobile App (api_config.dart)
```dart
static const String baseUrl = 'https://your-backend.com/api';
```

---

## SSL Certificates (HTTPS)

### Railway/Render/Vercel
- Automatic SSL certificates provided

### VPS with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl reload nginx
```

---

## Monitoring and Logs

### Railway
- Built-in logs and metrics dashboard

### VPS with PM2
```bash
pm2 logs hexa-backend
pm2 logs hexa-admin
pm2 monit
```

---

## Cost Estimates

### Free Tier (Recommended for Testing)
- Railway: Free $5 credit/month
- Vercel: Free for personal projects
- Render: Free tier with limitations
- Total: **$0/month**

### Production Ready
- Railway Pro: $20/month
- Database: $10/month
- Google Play: $25 one-time
- Total: **~$30/month + $25 setup**

---

## Next Steps

1. Choose deployment platform
2. Set up GitHub repository
3. Deploy database
4. Deploy backend
5. Deploy admin dashboard
6. Update and build mobile app
7. Test entire system
8. Publish mobile app

---

## Support

For issues during deployment:
1. Check logs on your platform
2. Verify environment variables
3. Ensure database migrations ran
4. Check CORS settings
5. Verify API URLs in mobile app

---

## Security Checklist

- [ ] Change all JWT secrets
- [ ] Enable HTTPS
- [ ] Set strong database password
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Use environment variables (never commit secrets)
- [ ] Enable Helmet security headers
- [ ] Review admin user credentials
