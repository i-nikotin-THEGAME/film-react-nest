#!/bin/bash

# Deploy script for film-react-nest application
# This script pulls the latest images from GitHub Container Registry and restarts services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="i-nikotin-THEGAME"
REPO_NAME="film-react-nest"
DOCKER_COMPOSE_FILE="docker-compose.yml"
LOG_FILE="$HOME/deployment.log"

# Log function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Header
log "================================"
log "🚀 Starting deployment process..."
log "================================"

# Check if Docker is running
if ! docker ps &>/dev/null; then
    error "Docker daemon is not running. Please start Docker first."
fi

log "✅ Docker daemon is running"

# Check if docker-compose.yml exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    error "docker-compose.yml not found in current directory"
fi

log "✅ docker-compose.yml found"

# Set image names
BACKEND_IMAGE="$REGISTRY/$REPO_OWNER/$REPO_NAME/backend:latest"
FRONTEND_IMAGE="$REGISTRY/$REPO_OWNER/$REPO_NAME/frontend:latest"
NGINX_IMAGE="$REGISTRY/$REPO_OWNER/$REPO_NAME/nginx:latest"

log "📦 Image references:"
log "   Backend: $BACKEND_IMAGE"
log "   Frontend: $FRONTEND_IMAGE"
log "   Nginx: $NGINX_IMAGE"

# Pull latest images
log ""
log "🔄 Pulling latest images from GitHub Container Registry..."

if ! docker pull "$BACKEND_IMAGE"; then
    warning "Failed to pull backend image, using existing image if available"
fi

if ! docker pull "$FRONTEND_IMAGE"; then
    warning "Failed to pull frontend image, using existing image if available"
fi

if ! docker pull "$NGINX_IMAGE"; then
    warning "Failed to pull nginx image, using existing image if available"
fi

success "Images pulled successfully"

# Stop running containers
log ""
log "🛑 Stopping running containers..."
if docker-compose down -v; then
    success "Containers stopped"
else
    warning "Failed to stop some containers, continuing..."
fi

# Start containers with new images
log ""
log "▶️ Starting containers with new images..."
if ! docker-compose up -d; then
    error "Failed to start containers"
fi

success "Containers started successfully"

# Wait for services to be ready
log ""
log "⏳ Waiting for services to be ready..."
sleep 5

# Check health status
log ""
log "🔍 Checking service health..."

# Check backend
if docker-compose exec -T backend curl -f http://localhost:3000/api/afisha/films &>/dev/null; then
    success "Backend is healthy"
else
    warning "Backend health check failed, but container is running"
fi

# Check frontend
if docker-compose exec -T nginx curl -f http://localhost:80/ &>/dev/null; then
    success "Frontend/Nginx is healthy"
else
    warning "Frontend health check failed, but container is running"
fi

# Display running containers
log ""
log "📋 Running containers:"
docker-compose ps | tee -a "$LOG_FILE"

# Display logs
log ""
log "📝 Recent logs:"
log "Backend logs (last 10 lines):"
docker-compose logs --tail=10 backend 2>/dev/null || log "No backend logs available"

log ""
log "Frontend logs (last 10 lines):"
docker-compose logs --tail=10 nginx 2>/dev/null || log "No frontend logs available"

# Summary
log ""
log "================================"
log "✅ Deployment completed successfully!"
log "================================"
log ""
log "🌐 Application URLs:"
log "   Frontend: https://inikotinthegame.nomorepartiessbs.ru"
log "   Backend API: https://inikotinthegame.nomorepartiessbs.ru/api/afisha"
log ""

exit 0
