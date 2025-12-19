#!/bin/sh

# Script to initialize SSL certificates for chartfolio.online
# This should be run once to obtain the initial certificates

DOMAIN="chartfolio.online"
EMAIL="${CERTBOT_EMAIL:-admin@chartfolio.online}"

echo "Initializing SSL certificates for $DOMAIN..."
echo "Using email: $EMAIL"
echo ""

# Check if certificates already exist
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "Certificates already exist for $DOMAIN"
    echo "To renew, certificates will auto-renew via certbot container"
    exit 0
fi

# Request certificates using standalone mode
echo "Requesting certificates from Let's Encrypt..."
certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ SSL certificates successfully obtained!"
    echo "Certificates are located at:"
    echo "  - Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo "  - Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
    echo ""
    echo "You can now restart nginx to use SSL certificates."
else
    echo ""
    echo "✗ Failed to obtain SSL certificates"
    echo "Make sure:"
    echo "  1. Domain $DOMAIN points to this server"
    echo "  2. Ports 80 and 443 are accessible"
    echo "  3. No other service is using port 80"
    exit 1
fi

