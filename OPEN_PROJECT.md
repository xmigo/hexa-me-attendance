# How to See Project in Android Studio

## 🔍 Problem: Can't See Application in Android Studio

If you can't see the project, follow these steps:

## ✅ Solution 1: Open as Flutter Project

1. **Close Android Studio** (if open)

2. **Open Android Studio**

3. **Click "Open"** (on welcome screen) or **File → Open**

4. **Navigate to:**
   ```
   /Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app
   ```

5. **Select the `mobile-app` folder** (not the Attendance folder)

6. **Click "OK"**

7. **Important:** When Android Studio asks, select:
   - **"Open as Flutter Project"** or
   - **"Trust Project"**

8. **Wait for indexing** (may take 1-2 minutes)

9. **Click "Get Dependencies"** if prompted

## ✅ Solution 2: From Terminal

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app
open -a "Android Studio" .
```

## ✅ Solution 3: Check Project Structure

After opening, you should see in the left sidebar:

```
mobile-app/
├── android/
├── lib/
│   ├── config/
│   ├── providers/
│   ├── screens/
│   └── main.dart
├── pubspec.yaml
└── ...
```

## 🔧 If Still Not Visible

1. **File → Invalidate Caches → Invalidate and Restart**

2. **File → Sync Project with Gradle Files**

3. **View → Tool Windows → Project** (to show project panel)

4. **Check if Flutter plugin is installed:**
   - File → Settings → Plugins
   - Search "Flutter"
   - Install if not installed

## 📱 What You Should See

- **Left Panel:** Project structure with `lib/`, `android/`, etc.
- **Top Bar:** Run button (green play icon)
- **Bottom:** Terminal, Run, etc.

## 🚀 Once Visible

1. Click **Run** button (green play icon)
2. Select device/emulator
3. App will build and run!

---

**The project is at:** `/Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app`

Make sure you open the **`mobile-app`** folder, not the parent `Attendance` folder!


