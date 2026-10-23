#!/bin/bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
swift build --package-path "$project_dir" -c release
binary_dir="$(swift build --package-path "$project_dir" -c release --show-bin-path)"
mkdir -p "$project_dir/build"
staging="$(mktemp -d "$project_dir/build/.swift-shadcn-XXXXXX")"
trap 'rm -rf "$staging"' EXIT
application="$staging/Timeless Shadcn Swift.app"
contents="$application/Contents"
mkdir -p "$contents/MacOS" "$contents/Resources"
cp "$binary_dir/TimelessShadcnSwift" "$contents/MacOS/TimelessShadcnSwift"
cp -R "$binary_dir/TimelessShadcnSwift_TimelessShadcnSwift.bundle" "$contents/Resources/"
test -f "$contents/Resources/TimelessShadcnSwift_TimelessShadcnSwift.bundle/Icons/house.svg"
cp "$project_dir/../../LICENSE" "$contents/Resources/LICENSE.txt"
cat > "$contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>TimelessShadcnSwift</string>
<key>CFBundleIdentifier</key><string>com.timeless.shadcn-swift</string>
<key>CFBundleName</key><string>Timeless Shadcn Swift</string>
<key>CFBundleDisplayName</key><string>Timeless Shadcn Swift</string>
<key>CFBundleVersion</key><string>1</string>
<key>CFBundleShortVersionString</key><string>1.0.0</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSMinimumSystemVersion</key><string>14.0</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSPrincipalClass</key><string>NSApplication</string>
</dict></plist>
PLIST
codesign --force --sign - --timestamp=none "$application"
codesign --verify --deep --strict "$application"
output="$project_dir/build/Timeless Shadcn Swift.app"
if [[ -e "$output" ]]; then mv "$output" "$staging/previous.app"; fi
if ! mv "$application" "$output"; then
    if [[ -e "$staging/previous.app" ]]; then mv "$staging/previous.app" "$output"; fi
    exit 1
fi
echo "Built $output"
