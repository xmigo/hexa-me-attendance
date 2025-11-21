# Open Hexa-Me in Android Studio

## 🚀 Quick Steps

### 1. Open Android Studio

### 2. Open Project
- Click **File → Open**
- Navigate to: `/Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app`
- Click **OK**

### 3. Update API URL

Open: `lib/config/api_config.dart`

**For Android Emulator (use this):**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

**For Physical Device:**
```dart
// First find your IP: ifconfig | grep "inet "
static const String baseUrl = 'http://192.168.1.XXX:3000/api';
```

### 4. Get Dependencies

In Android Studio terminal:
```bash
flutter pub get
```

### 5. Make Sure Backend is Running

In a separate terminal:
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance/backend
npm run dev
```

### 6. Run the App

- Click the **Run** button (green play icon)
- Or press `Shift + F10`
- Or run: `flutter run`

## 📱 What You'll See

1. **Login Screen** - Enter credentials
2. **Dashboard** - Shows:
   - Check-in status
   - Working hours
   - Check-in/out button
   - Recent history

## 🔑 Login Credentials

- Email: `admin@hexa-me.com`
- Password: `admin123`

## ✅ That's It!

The app will open and you can see the dashboard!


