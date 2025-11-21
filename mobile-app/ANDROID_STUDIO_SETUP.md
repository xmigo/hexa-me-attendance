# Android Studio Setup - Hexa-Me Mobile App

## 🚀 Quick Setup

### Step 1: Open in Android Studio

1. **Open Android Studio**
2. **File → Open**
3. Navigate to: `/Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app`
4. Click **OK**

### Step 2: Update API URL

**Important:** Update the API URL in `lib/config/api_config.dart`:

**For Android Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

**For Physical Device:**
```dart
// Find your computer's IP address first
// macOS: ifconfig | grep "inet "
// Then use:
static const String baseUrl = 'http://YOUR_IP_ADDRESS:3000/api';
```

### Step 3: Get Dependencies

In Android Studio terminal or command line:
```bash
cd mobile-app
flutter pub get
```

### Step 4: Run the App

1. **Connect device or start emulator**
2. Click **Run** button (green play icon) in Android Studio
3. Or run: `flutter run`

## 📱 What You'll See

### Login Screen
- Email: `admin@hexa-me.com`
- Password: `admin123`

### Dashboard (After Login)
- Today's check-in status
- Check-in/Check-out button
- Recent attendance history
- Working hours display

## 🔧 Troubleshooting

### "Cannot connect to API"
- Make sure backend is running: `cd backend && npm run dev`
- Check API URL in `lib/config/api_config.dart`
- For emulator: Use `10.0.2.2` instead of `localhost`
- For device: Use your computer's IP address

### "Package not found"
```bash
flutter clean
flutter pub get
```

### Build Errors
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

## ✅ Ready to Run!

Once opened in Android Studio, just click Run!


