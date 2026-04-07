#!/bin/bash
# Build the macOS demo app
# Usage: ./scripts/build-macos.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MACOS_DIR="$PROJECT_DIR/macos"
BUILD_DIR="$PROJECT_DIR/build"

# Check app bundle (built by vite, includes all dependencies)
if [ ! -f "$PROJECT_DIR/dist/app.js" ]; then
    echo "ERROR: dist/app.js not found. Run 'pnpm run build' first."
    exit 1
fi

echo "==> Compiling macOS app..."
mkdir -p "$BUILD_DIR"

SWIFT_FILES=(
    "$MACOS_DIR/main.swift"
    "$MACOS_DIR/AppDelegate.swift"
    "$MACOS_DIR/RootViewController.swift"
    "$MACOS_DIR/NativeViewRenderer.swift"
    "$MACOS_DIR/Shared/JSBridge.swift"
)

swiftc \
    -o "$BUILD_DIR/TimelessMacDemo" \
    -framework Cocoa \
    -framework JavaScriptCore \
    -target arm64-apple-macosx13.0 \
    "${SWIFT_FILES[@]}"

echo "==> Creating app bundle..."
APP_BUNDLE="$BUILD_DIR/Timeless macOS Demo.app"
rm -rf "$APP_BUNDLE"
mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

cp "$BUILD_DIR/TimelessMacDemo" "$APP_BUNDLE/Contents/MacOS/"
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
