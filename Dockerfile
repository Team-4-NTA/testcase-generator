# Use official Python image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements/ requirements/

# Install Python packages
RUN pip install --no-cache-dir -r requirements/development.txt

# Copy source code
COPY src/ .

# Create directories for static and media files
RUN mkdir -p staticfiles media

# Expose port
EXPOSE 8888

# Command to run Django application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8888"]