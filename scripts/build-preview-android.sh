#!/usr/bin/env sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
"${script_dir}/check-env.sh"

echo "Starting EAS preview Android APK build (internal distribution)..."
npx eas build -p android --profile preview
