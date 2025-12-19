#!/bin/bash

# Chartfolio Project - Quick Start Script
# This script helps you get the Chartfolio project up and running quickly

set -e

echo "=========================================="
echo "Chartfolio Project - Quick Start"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not available. Please install Docker Compose V2."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists, if not create from template
if [ ! -f .env ]; then
    echo "Creating .env file from env.template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "✓ .env file created"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and fill in all required values:"
        echo "   - MongoDB connection string"
        echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
        echo "   - OAuth credentials (Google, Facebook)"
        echo "   - Email credentials"
        echo "   - API tokens (Tinkoff, Currency, OpenAI)"
        echo "   - Proxy configuration"
        echo ""
        read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
    else
        echo "Warning: env.template not found. Creating minimal .env..."
        echo "# Chartfolio Environment Variables" > .env
        echo "JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo 'your-secret-key-here-change-in-production')" >> .env
        echo "ASSETS_FRONTEND_URL=http://localhost" >> .env
        echo "ASSETS_AUTH_URL=http://localhost" >> .env
        echo "✓ .env file created with minimal configuration"
        echo ""
        echo "⚠️  You must edit .env and add all required environment variables!"
        read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
    fi
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Building Docker images..."
if command -v docker-compose &> /dev/null; then
    docker-compose build
else
    docker compose build
fi

echo ""
echo "Starting services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "Checking service status..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "=========================================="
echo "Chartfolio Project is now running!"
echo "=========================================="
echo ""
echo "Access the application at:"
echo "  HTTP:  http://localhost (or http://chartfolio.online if DNS configured)"
echo "  HTTPS: https://localhost (or https://chartfolio.online if SSL configured)"
echo ""
echo "Note: If this is the first time, you need to initialize SSL certificates:"
echo "  make init-ssl"
echo ""
echo "To view logs: make logs"
echo "To stop:      make down"
echo ""
echo "For more commands, run: make help"
echo ""

