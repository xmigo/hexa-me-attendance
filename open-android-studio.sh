#!/bin/bash

# Script to open Hexa-Me mobile app in Android Studio

PROJECT_PATH="/Applications/XAMPP/xamppfiles/htdocs/Attendance/mobile-app"

echo "🚀 Opening Hexa-Me in Android Studio..."
echo ""

# Check if Android Studio is installed
if [ -d "/Applications/Android Studio.app" ]; then
    echo "✅ Found Android Studio"
    open -a "Android Studio" "$PROJECT_PATH"
    echo "✅ Opening project in Android Studio..."
    echo ""
    echo "📱 Project location: $PROJECT_PATH"
    echo ""
    echo "⏳ Android Studio is opening..."
    echo "   Once it opens:"
    echo "   1. Wait for project to load"
    echo "   2. Click 'Get Dependencies' if prompted"
    echo "   3. Click Run button (green play icon)"
    echo ""
elif [ -d "$HOME/Applications/Android Studio.app" ]; then
    echo "✅ Found Android Studio"
    open -a "$HOME/Applications/Android Studio.app" "$PROJECT_PATH"
    echo "✅ Opening project in Android Studio..."
elif command -v studio.sh &> /dev/null; then
    echo "✅ Found Android Studio (Linux)"
    studio.sh "$PROJECT_PATH" &
    echo "✅ Opening project in Android Studio..."
else
    echo "⚠️  Android Studio not found in standard locations"
    echo ""
    echo "Please open Android Studio manually:"
    echo "1. Open Android Studio"
    echo "2. File → Open"
    echo "3. Navigate to: $PROJECT_PATH"
    echo "4. Click OK"
    echo ""
    echo "Or if Android Studio is installed elsewhere, run:"
    echo "  open -a 'Android Studio' '$PROJECT_PATH'"
fi

echo ""
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Wait for Android Studio to open"
echo "2. Click 'Get Dependencies' if prompted"
echo "3. Make sure backend is running: cd backend && npm run dev"
echo "4. Click Run button (green play icon)"
echo "5. Select device/emulator"
echo "6. Login: admin@hexa-me.com / admin123"
echo "7. See Dashboard!"
echo ""


