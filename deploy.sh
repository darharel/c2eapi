#!/bin/bash

# Chess2Earn Docker Deployment Script
# This script sets up and deploys the application using Docker

set -e

echo "========================================="
echo "🐳 Chess2Earn Docker Deployment"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed! Please log out and log back in, then run this script again."
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Installing Docker Compose..."
    sudo apt install docker-compose -y
    echo "✅ Docker Compose installed!"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from template..."
    cp .env.docker .env
    echo ""
    echo "📝 Please edit .env file with your credentials:"
    echo "   nano .env"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Checking service health..."
docker-compose ps

echo ""
echo "========================================="
echo "🎉 Deployment Complete!"
echo "========================================="
echo ""
echo "📊 Your application is running:"
echo ""
echo "Frontend:   http://localhost:3000"
echo "Backend:    http://localhost:3001"
echo "Admin:      http://localhost:3000/admin"
echo "API Test:   http://localhost:3000/api-test"
echo "Health:     http://localhost:3001/health"
echo ""
echo "With Nginx:"
echo "Main Site:  http://localhost"
echo "API:        http://localhost/api"
echo ""
echo "========================================="
echo "📝 Useful Commands:"
echo "========================================="
echo ""
echo "View logs:           docker-compose logs -f"
echo "Stop services:       docker-compose down"
echo "Restart:             docker-compose restart"
echo "Rebuild:             docker-compose up -d --build"
echo "Seed database:       docker exec -it chess2earn-backend npm run db:seed"
echo ""
echo "========================================="

# Test health endpoint
echo ""
echo "🔍 Testing health endpoint..."
sleep 2
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check failed. Check logs:"
    echo "   docker-compose logs backend"
fi

echo ""
echo "Happy deploying! 🚀"
