#!/bin/bash

# Chess2Earn - Push to Docker Hub Script
# This script builds and pushes images to Docker Hub

set -e

echo "========================================="
echo "🐳 Chess2Earn Docker Hub Push"
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

echo "📝 Logging in to Docker Hub..."
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin

if [ $? -ne 0 ]; then
    echo "❌ Docker login failed!"
    exit 1
fi

echo "✅ Successfully logged in to Docker Hub"
echo ""

echo "========================================="
echo "🔨 Building Docker Images"
echo "========================================="
echo ""

# Build Backend Image
echo "📦 Building backend image..."
docker build -t chess2earn-backend:latest ./backend
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
echo "✅ Backend image built"
echo ""

# Build Frontend Image
echo "📦 Building frontend image..."
docker build -t chess2earn-frontend:latest ./frontend
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend image built"
echo ""

echo "========================================="
echo "🏷️  Tagging Images for Docker Hub"
echo "========================================="
echo ""

# Tag images
docker tag chess2earn-backend:latest $DOCKER_USERNAME/$DOCKER_REPO:backend-latest
docker tag chess2earn-frontend:latest $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest

# Optional: Tag with version number
VERSION=$(date +%Y%m%d-%H%M%S)
docker tag chess2earn-backend:latest $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION
docker tag chess2earn-frontend:latest $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION

echo "✅ Images tagged:"
echo "   - $DOCKER_USERNAME/$DOCKER_REPO:backend-latest"
echo "   - $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION"
echo "   - $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest"
echo "   - $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION"
echo ""

echo "========================================="
echo "📊 Image Information"
echo "========================================="
echo ""
docker images | grep -E "(REPOSITORY|$DOCKER_REPO|chess2earn)"
echo ""

echo "========================================="
echo "⚠️  READY TO PUSH"
echo "========================================="
echo ""
echo "Images are built and tagged. Ready to push to Docker Hub."
echo ""
echo "The following images will be pushed:"
echo "  1. $DOCKER_USERNAME/$DOCKER_REPO:backend-latest"
echo "  2. $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION"
echo "  3. $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest"
echo "  4. $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION"
echo ""
read -p "Do you want to push these images to Docker Hub? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Push cancelled by user"
    exit 0
fi

echo ""
echo "========================================="
echo "🚀 Pushing Images to Docker Hub"
echo "========================================="
echo ""

# Push Backend
echo "📤 Pushing backend image..."
docker push $DOCKER_USERNAME/$DOCKER_REPO:backend-latest
docker push $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION
echo "✅ Backend pushed"
echo ""

# Push Frontend
echo "📤 Pushing frontend image..."
docker push $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest
docker push $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION
echo "✅ Frontend pushed"
echo ""

echo "========================================="
echo "🎉 Push Complete!"
echo "========================================="
echo ""
echo "Your images are now available on Docker Hub:"
echo ""
echo "Backend:"
echo "  docker pull $DOCKER_USERNAME/$DOCKER_REPO:backend-latest"
echo "  docker pull $DOCKER_USERNAME/$DOCKER_REPO:backend-$VERSION"
echo ""
echo "Frontend:"
echo "  docker pull $DOCKER_USERNAME/$DOCKER_REPO:frontend-latest"
echo "  docker pull $DOCKER_USERNAME/$DOCKER_REPO:frontend-$VERSION"
echo ""
echo "View on Docker Hub:"
echo "  https://hub.docker.com/r/$DOCKER_USERNAME/$DOCKER_REPO"
echo ""
echo "========================================="

# Logout
echo ""
echo "🔒 Logging out from Docker Hub..."
docker logout
echo "✅ Logged out"
echo ""
echo "Happy deploying! 🚀"
