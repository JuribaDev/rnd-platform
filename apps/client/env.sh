#!/bin/sh

set -e

log() {
  echo "[INFO] $1"
}

if [ -z "$API_URL" ]; then
  echo "[ERROR] API_URL environment variable is not set."
  exit 1
fi

log "Replacing API_URL in main JavaScript files"

find /usr/share/nginx/html/ -name 'main*.js' -exec sed -i 's|apiUrl:[^,]*|apiUrl:"'"${API_URL}"'"|g' {} +

log "API_URL successfully replaced in JavaScript files"

log "Verifying changes in JavaScript files"
for file in /usr/share/nginx/html/main*.js; do
  head -n 5 "$file"
done

log "Script completed successfully"
