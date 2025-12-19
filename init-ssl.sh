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
echo "Step 2: Rebuilding nginx container to ensure latest configuration..."
# Rebuild nginx to ensure it has the correct configuration files
$DOCKER_COMPOSE build nginx

echo ""
echo "Step 3: Starting nginx temporarily for certificate validation..."
# Start nginx without SSL to allow certbot to validate
$DOCKER_COMPOSE up -d nginx

# Wait for nginx to be ready
echo "Waiting for nginx to be ready..."
sleep 5

# Check if nginx container is running
NGINX_RUNNING=false
for i in {1..20}; do
    if $DOCKER_COMPOSE ps nginx 2>/dev/null | grep -q "Up\|running"; then
        NGINX_RUNNING=true
        echo "✓ Nginx container is running"
        break
    fi
    sleep 1
done

if [ "$NGINX_RUNNING" = false ]; then
    echo "✗ Nginx container failed to start"
    echo "Check nginx status: $DOCKER_COMPOSE ps nginx"
    echo "Check nginx logs: $DOCKER_COMPOSE logs nginx"
    exit 1
fi

# Give nginx a moment to fully initialize
sleep 3
echo "✓ Nginx should be ready"

echo ""
echo "Step 4: Requesting SSL certificates from Let's Encrypt..."
echo "This may take a minute..."

# Ensure the certbot-www volume directory exists and is accessible
echo "Verifying volume setup..."
$DOCKER_COMPOSE exec -T nginx mkdir -p /var/www/certbot/.well-known/acme-challenge || true

# Test that nginx can serve files from the webroot
echo "Testing nginx configuration..."
$DOCKER_COMPOSE exec -T nginx sh -c 'echo "test" > /var/www/certbot/.well-known/acme-challenge/test.txt' || true

# Verify nginx is listening on port 80
echo "Verifying nginx is listening on port 80..."
if ! $DOCKER_COMPOSE exec -T nginx sh -c 'netstat -tuln | grep -q ":80 " || ss -tuln | grep -q ":80 "' 2>/dev/null; then
    echo "Warning: Nginx may not be listening on port 80"
    echo "Check nginx logs: $DOCKER_COMPOSE logs nginx"
fi

# Important: Ensure the domain points to this server and port 80 is accessible from the internet
echo ""
echo "⚠️  IMPORTANT: Before proceeding, ensure:"
echo "   1. Domain $DOMAIN DNS points to this server's public IP"
echo "   2. Port 80 is open and accessible from the internet"
echo "   3. No firewall is blocking incoming connections on port 80"
echo ""

# Run certbot in the certbot container to obtain certificates
# Override the entrypoint since the default one runs a renewal loop
# Volumes are inherited from service definition, but explicitly mount to be sure
echo "Running certbot..."
$DOCKER_COMPOSE run --rm \
    --entrypoint "certbot" \
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
    echo "Step 5: Reloading nginx to use SSL configuration..."
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

