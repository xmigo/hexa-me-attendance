# Build APK - Simple Instructions

## 🚀 Build from Android Studio (Recommended)

The command line has Gradle/Java compatibility issues. **Build from Android Studio instead** - it handles everything automatically.

### Steps:

1. **Open Android Studio** (project should already be open)

2. **Build Menu:**
   - Click **Build** (top menu bar)
   - Select **Build Bundle(s) / APK(s)**
   - Select **Build APK(s)**

3. **Wait for Build:**
   - Takes 2-5 minutes
   - Watch progress in bottom status bar

4. **Get APK:**
   - When done, click **"locate"** link in notification
   - Or navigate to: `build/app/outputs/flutter-apk/app-release.apk`

## 📱 Install APK on Device

1. Transfer APK to Android device (USB, email, cloud)
2. On device: Settings → Security → Enable "Install from Unknown Sources"
3. Tap APK file to install
4. Open "Hexa-Me" app
5. Login: `admin@hexa-me.com` / `admin123`
6. **See Dashboard!**

## ✅ That's It!

The APK is ready to install and use!

---

**Note:** Command line build has Java/Gradle version conflicts. Android Studio resolves these automatically.


