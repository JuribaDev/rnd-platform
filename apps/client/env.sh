#!/bin/sh

# Recreate config file
envsubst < /usr/share/nginx/html/main*.js > /usr/share/nginx/html/main-replaced.js
mv /usr/share/nginx/html/main-replaced.js /usr/share/nginx/html/main*.js

# Replace API_URL in the main.js file
sed -i 's|apiUrl:[^,]*|apiUrl:"'"${API_URL}"'"|g' /usr/share/nginx/html/main*.js
