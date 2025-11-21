# Open in Android Studio - Quick Guide

## 🚀 Method 1: Use the Script

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance
./open-android-studio.sh
```

This will automatically open Android Studio with the project!

## 🚀 Method 2: Manual Open

1. **Open Android Studio**
2. **File → Open**
3. Navigate to: `/Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app`
4. Click **OK**

## 📋 After Opening

### 1. Get Dependencies
If Android Studio prompts, click **"Get Dependencies"** or run:
```bash
flutter pub get
```

### 2. Make Sure Backend is Running
Open a terminal and run:
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance/backend
npm run dev
```

### 3. Run the App
- Click the **Run** button (green play icon) in Android Studio
- Or press `Shift + F10`
- Select your device/emulator
- App will install and launch

### 4. Login
- Email: `admin@hexa-me.com`
- Password: `admin123`

### 5. See Dashboard!
After login, you'll see:
- ✅ Check-in status
- ✅ Working hours
- ✅ Check In/Out button
- ✅ Today's stats
- ✅ Recent history

## ✅ API Configuration

The API URL is already set for Android Emulator:
- Emulator: `http://10.0.2.2:3000/api` ✅
- Physical Device: Update to your computer's IP

## 🎉 That's It!

The dashboard will appear automatically after login!


