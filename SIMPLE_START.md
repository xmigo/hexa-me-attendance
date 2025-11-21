# Simple Start - Just Login and Work

## 🚀 One Command to Start Everything

```bash
./START_HERE.sh
```

That's it! Wait 30 seconds, then:

1. **Website opens automatically** at http://localhost:3001
2. **Login with:**
   - Email: `admin@hexa-me.com`
   - Password: `admin123`

## ✅ What It Does Automatically

- Starts PostgreSQL
- Starts Redis  
- Creates database
- Installs dependencies
- Creates admin user
- Starts backend (port 3000)
- Starts website (port 3001)
- Opens browser

## 📱 For Mobile APK

After website is running:

```bash
cd mobile-app
flutter build apk
```

APK will be in: `mobile-app/build/app/outputs/flutter-apk/app-release.apk`

## 🛑 To Stop

Press `Ctrl+C` or find the process and kill it.

---

**That's all you need! Just run `./START_HERE.sh`**


