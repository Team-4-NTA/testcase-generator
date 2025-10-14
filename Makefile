# Testcase Generator AI - Makefile
# Common commands for development and deployment

.PHONY: help build up down logs shell migrate collectstatic test clean install

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  build       - Build Docker containers"
	@echo "  up          - Start all services"
	@echo "  down        - Stop all services"
	@echo "  logs        - Show logs"
	@echo "  shell       - Open Django shell"
	@echo "  migrate     - Run database migrations"
	@echo "  collectstatic - Collect static files"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean up containers and volumes"
	@echo "  dev         - Start development environment"
	@echo "  prod        - Start production environment"

# Install dependencies
install:
	pip install -r requirements.txt

# Build Docker containers
build:
	docker-compose build --no-cache

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Open Django shell
shell:
	docker-compose exec web python manage.py shell

# Run database migrations
migrate:
	docker-compose exec web python manage.py migrate

# Collect static files
collectstatic:
	docker-compose exec web python manage.py collectstatic --noinput

# Run tests
test:
	docker-compose exec web python manage.py test

# Clean up containers and volumes
clean:
	docker-compose down -v
	docker system prune -f

# Development environment
dev:
	docker-compose -f docker-compose.yml up -d
	@echo "Development environment started"
	@echo "Access the application at: http://localhost:8888"

# Production environment
prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started"

# Create superuser
createsuperuser:
	docker-compose exec web python manage.py createsuperuser

# Backup database
backup:
	docker-compose exec db mysqldump -u root -p create_testcase_ai > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Restore database
restore:
	@echo "Usage: make restore FILE=backup_file.sql"
	docker-compose exec -T db mysql -u root -p create_testcase_ai < $(FILE)

# Check code quality
lint:
	docker-compose exec web python -m flake8 .
	docker-compose exec web python -m black --check .

# Format code
format:
	docker-compose exec web python -m black .

# Security check
security:
	docker-compose exec web python -m bandit -r .

# Update requirements
update-requirements:
	docker-compose exec web pip freeze > requirements.txt

# Show container status
status:
	docker-compose ps

# Restart specific service
restart:
	@echo "Usage: make restart SERVICE=service_name"
	docker-compose restart $(SERVICE)

# Follow logs for specific service
logs-service:
	@echo "Usage: make logs-service SERVICE=service_name"
	docker-compose logs -f $(SERVICE)
