#!/bin/bash
# Build the macOS demo app
# Usage: ./scripts/build-macos.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$PROJECT_DIR/build"

# Check app bundle (built by vite, includes all dependencies)
if [ ! -f "$PROJECT_DIR/dist/app.js" ]; then
    echo "ERROR: dist/app.js not found. Run 'pnpm run build' first."
    exit 1
fi

echo "==> Building macOS app with SPM..."
cd "$PROJECT_DIR"
swift build -c release

echo "==> Creating app bundle..."
mkdir -p "$BUILD_DIR"
APP_BUNDLE="$BUILD_DIR/Timeless macOS Demo.app"
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

cp "$PROJECT_DIR/.build/release/TimelessMacDemo" "$APP_BUNDLE/Contents/MacOS/"
cp "$PROJECT_DIR/dist/app.js" "$APP_BUNDLE/Contents/Resources/"

cat > "$APP_BUNDLE/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>TimelessMacDemo</string>
    <key>CFBundleIdentifier</key>
    <string>com.timeless.macos-demo</string>
    <key>CFBundleName</key>
    <string>Timeless macOS Demo</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
PLIST

echo "==> Done! App bundle at: $APP_BUNDLE"
echo "    Run with: open \"$APP_BUNDLE\""
