#!/bin/sh
set -e

# Remove any existing default.conf to start clean
rm -f /etc/nginx/conf.d/default.conf

# Temporarily disable nginx.conf if certificates don't exist to avoid test failures
if [ ! -f "/etc/letsencrypt/live/chartfolio.online/fullchain.pem" ] || \
   [ ! -f "/etc/letsencrypt/live/chartfolio.online/privkey.pem" ]; then
    # Rename nginx.conf temporarily so nginx -t doesn't test it
    if [ -f "/etc/nginx/conf.d/nginx.conf" ]; then
        mv /etc/nginx/conf.d/nginx.conf /etc/nginx/conf.d/nginx.conf.disabled
    fi
fi

# Check if SSL certificates exist
if [ -f "/etc/letsencrypt/live/chartfolio.online/fullchain.pem" ] && \
   [ -f "/etc/letsencrypt/live/chartfolio.online/privkey.pem" ]; then
    echo "SSL certificates found, using HTTPS configuration"
    # Restore nginx.conf if it was disabled
    if [ -f "/etc/nginx/conf.d/nginx.conf.disabled" ]; then
        mv /etc/nginx/conf.d/nginx.conf.disabled /etc/nginx/conf.d/nginx.conf
    fi
    cp /etc/nginx/conf.d/nginx.conf /etc/nginx/conf.d/default.conf
else
    echo "SSL certificates not found, using HTTP-only configuration"
    echo "Run ./init-ssl.sh to obtain SSL certificates"
    cp /etc/nginx/conf.d/nginx-init.conf /etc/nginx/conf.d/default.conf
fi

# Test nginx configuration
nginx -t

# Start nginx
exec nginx -g "daemon off;"

