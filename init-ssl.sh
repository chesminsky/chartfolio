#!/bin/bash

# Script to initialize SSL certificates for the first time
# Usage: ./init-ssl.sh [email]

set -e

DOMAIN="chartfolio.online"
EMAIL="${1:-${CERTBOT_EMAIL:-chartfolio@gmail.com}}"

echo "=========================================="
echo "SSL Certificate Initialization"
echo "=========================================="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Use docker-compose or docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "Error: docker-compose not found"
    exit 1
fi

echo "Step 1: Starting services (without nginx)..."
$DOCKER_COMPOSE up -d server web

echo ""
echo "Step 2: Starting nginx temporarily for certificate validation..."
# Start nginx without SSL to allow certbot to validate
$DOCKER_COMPOSE up -d nginx

echo ""
echo "Step 3: Requesting SSL certificates from Let's Encrypt..."
echo "This may take a minute..."

# Run certbot in the certbot container to obtain certificates
$DOCKER_COMPOSE run --rm \
    -e CERTBOT_EMAIL="$EMAIL" \
    certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ SSL certificates successfully obtained!"
    echo ""
    echo "Step 4: Reloading nginx to use SSL configuration..."
    # Restart nginx so the entrypoint script detects certificates and switches to SSL config
    $DOCKER_COMPOSE restart nginx
    
    # Wait a moment for nginx to restart
    sleep 3
    
    echo ""
    echo "=========================================="
    echo "✓ SSL Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Your site should now be accessible at: https://$DOMAIN"
    echo ""
    echo "Certificates will auto-renew every 12 hours via the certbot container."
    echo "You can check renewal status with: $DOCKER_COMPOSE logs certbot"
    echo ""
    echo "Note: After certificate renewal, nginx will need to be reloaded."
    echo "You can set up a post-renewal hook or manually reload: $DOCKER_COMPOSE exec nginx nginx -s reload"
else
    echo ""
    echo "✗ Failed to obtain SSL certificates"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Ensure domain $DOMAIN points to this server's IP"
    echo "  2. Ensure ports 80 and 443 are open and accessible"
    echo "  3. Check nginx logs: $DOCKER_COMPOSE logs nginx"
    echo "  4. Check certbot logs: $DOCKER_COMPOSE logs certbot"
    exit 1
fi

