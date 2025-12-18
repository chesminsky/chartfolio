#!/bin/bash
# Helper script to reload nginx after certificate renewal

if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "Error: docker-compose not found"
    exit 1
fi

echo "Reloading nginx..."
$DOCKER_COMPOSE exec nginx nginx -s reload

if [ $? -eq 0 ]; then
    echo "✓ Nginx reloaded successfully"
else
    echo "✗ Failed to reload nginx"
    exit 1
fi

