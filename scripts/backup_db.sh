#!/bin/bash

# Database backup script

echo "Starting database backup..."

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-create_testcase_ai}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-Asdf1234#}

# Create backup directory if it doesn't exist
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

# Create backup
echo "Creating backup: $BACKUP_FILE"
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction --routines --triggers "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Compress backup
    echo "Compressing backup..."
    gzip "$BACKUP_FILE"
    echo "Compressed backup: ${BACKUP_FILE}.gz"
    
    # Keep only last 7 days of backups
    echo "Cleaning old backups..."
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
    
    echo "Backup process completed successfully!"
else
    echo "Backup failed!"
    exit 1
fi
