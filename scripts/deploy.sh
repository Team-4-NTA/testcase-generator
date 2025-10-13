#!/bin/bash

# Production deployment script

echo "Starting production deployment..."

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "Deploying to $ENVIRONMENT environment using $DOCKER_COMPOSE_FILE"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose is required but not installed. Please install docker-compose."
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p staticfiles
mkdir -p media/uploads
mkdir -p media/outputs
mkdir -p media/results
mkdir -p logs

# Build and start services
echo "Building and starting services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "Checking service status..."
docker-compose -f "$DOCKER_COMPOSE_FILE" ps

# Run migrations
echo "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec web python manage.py migrate

# Collect static files
echo "Collecting static files..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec web python manage.py collectstatic --noinput

# Create superuser if needed
echo "Creating superuser (if needed)..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec web python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"

echo "Deployment completed successfully!"
echo "Services are running. Check logs with: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
