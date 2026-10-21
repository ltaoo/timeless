#!/bin/bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
node "$PROJECT_DIR/../../packages/timeless-macos/scripts/build-app.mjs" \
  --bundle "$PROJECT_DIR/dist/app.js" \
  --output "$PROJECT_DIR/build/Timeless macOS Demo.app" \
  --name "Timeless macOS Demo" --identifier com.timeless.macos-demo
