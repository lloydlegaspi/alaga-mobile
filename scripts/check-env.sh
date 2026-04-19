#!/usr/bin/env sh
set -eu

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

required_vars="EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_ANON_KEY"
missing=0

for var_name in $required_vars; do
  eval "var_value=\${$var_name-}"

  if [ -z "${var_value}" ]; then
    echo "[missing] ${var_name}"
    missing=1
  else
    echo "[ok] ${var_name}"
  fi
done

if [ "$missing" -ne 0 ]; then
  cat <<'EOF'

Missing required Expo public environment variables.

Quick fix:
1. Copy .env.example to .env
2. Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
3. Re-run this script

For EAS cloud builds, also set these variables in EAS environment settings
so they are available during remote build.
EOF
  exit 1
fi

echo "Environment check passed."
