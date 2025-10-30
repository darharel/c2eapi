#!/bin/bash

# Chess2Earn - Pull from Docker Hub and Deploy
# This script pulls the latest images from Docker Hub and deploys them

set -e

echo "========================================="
echo "🐳 Chess2Earn - Deploy from Docker Hub"
echo "========================================="
echo ""

# Configuration
DOCKER_USERNAME="dajrl"
DOCKER_REPO="c2eapi"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker first:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sudo sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Installing Docker Compose..."
    sudo apt install docker-compose -y
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

echo "📥 Pulling latest images from Docker Hub..."
echo ""

# Pull backend image
echo "📦 Pulling backend image..."
docker pull $DOCKER_USERNAME/$DOCKER_REPO:backend-latest
if [ $? -ne 0 ]; then
    echo "❌ Failed to pull backend image!"
    echo "Make sure the images have been pushed to Docker Hub first."
    exit 1
fi
echo "✅ Backend image pulled"
echo ""

# Pull frontend image
echo "📦 Pulling frontend image..."
docker pull $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest
if [ $? -ne 0 ]; then
    echo "❌ Failed to pull frontend image!"
    exit 1
fi
echo "✅ Frontend image pulled"
echo ""

# Pull nginx image
echo "📦 Pulling nginx image..."
docker pull nginx:alpine
echo "✅ Nginx image pulled"
echo ""

echo "========================================="
echo "🚀 Starting Services"
echo "========================================="
echo ""

# Stop existing containers if running
if [ "$(docker ps -q -f name=chess2earn)" ]; then
    echo "⏹️  Stopping existing containers..."
    docker-compose -f docker-compose.dockerhub.yml down
    echo "✅ Stopped"
    echo ""
fi

# Start services using Docker Hub compose file
echo "🚀 Starting services with latest images..."
docker-compose -f docker-compose.dockerhub.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Checking service health..."
docker-compose -f docker-compose.dockerhub.yml ps

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
echo "View logs:           docker-compose -f docker-compose.dockerhub.yml logs -f"
echo "Stop services:       docker-compose -f docker-compose.dockerhub.yml down"
echo "Restart:             docker-compose -f docker-compose.dockerhub.yml restart"
echo "Update images:       docker-compose -f docker-compose.dockerhub.yml pull && docker-compose -f docker-compose.dockerhub.yml up -d"
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
    echo "   docker-compose -f docker-compose.dockerhub.yml logs backend"
fi

echo ""
echo "Happy deploying! 🚀"
