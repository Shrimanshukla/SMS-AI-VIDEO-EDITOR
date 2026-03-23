#!/bin/bash

# SMS Video Editor - Docker Deployment Script
# Starts the entire application stack with docker-compose

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SMS AI-Powered Video Editor - Docker Deployment          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed. Please install Docker from https://www.docker.com"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "✗ docker-compose is not installed. Please install Docker Desktop"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "✗ .env file not found"
    echo "Run: bash scripts/setup.sh"
    exit 1
fi

echo "Starting Docker containers..."
echo ""

# Build and start containers
docker-compose up -d

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Deployment Started!                                       ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Frontend: http://localhost:3000                           ║"
echo "║  Backend:  http://localhost:5000/api/health               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop containers: docker-compose down"
echo ""
