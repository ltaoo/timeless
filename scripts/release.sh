#!/bin/bash

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 0.3.0"
  exit 1
fi

# Validate semver format
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
  echo "Error: Invalid version format '$VERSION'. Expected semver (e.g. 0.3.0, 1.0.0-beta.1)"
  exit 1
fi

COUNT=0

for pkg in packages/*/package.json; do
  NAME=$(grep -o '"name": *"[^"]*"' "$pkg" | head -1 | sed 's/"name": *"//;s/"//')
  OLD=$(grep -o '"version": *"[^"]*"' "$pkg" | head -1 | sed 's/"version": *"//;s/"//')

  # Update version field
  sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$VERSION\"/" "$pkg"

  echo "  $NAME: $OLD -> $VERSION"
  COUNT=$((COUNT + 1))
done

echo ""
echo "Updated $COUNT packages to version $VERSION"

echo ""
echo "Building all packages..."
pnpm build
echo "Build complete."
