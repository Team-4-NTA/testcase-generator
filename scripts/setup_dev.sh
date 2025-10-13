#!/bin/bash

# Development environment setup script

echo "Setting up development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is required but not installed. Please install pip3."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements/development.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your configuration."
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p src/media/uploads
mkdir -p src/media/outputs
mkdir -p src/media/results
mkdir -p staticfiles

# Run migrations
echo "Running database migrations..."
cd src
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Development environment setup complete!"
echo "To start the development server, run: make dev"
