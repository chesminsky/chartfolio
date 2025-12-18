#!/bin/sh
set -e

# Check if SSL certificates exist
if [ -f "/etc/letsencrypt/live/chartfolio.me/fullchain.pem" ] && \
   [ -f "/etc/letsencrypt/live/chartfolio.me/privkey.pem" ]; then
    echo "SSL certificates found, using HTTPS configuration"
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

