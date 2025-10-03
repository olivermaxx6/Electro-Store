#!/bin/bash

# SPPIX Database Setup Script for Production
# This script sets up MySQL database for the SPPIX project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="sppix_store"
DB_USER="sppix_user"
DB_PASSWORD="SppixStore2024!"
DB_HOST="localhost"
DB_PORT="3306"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${BLUE}🗄️  Setting up MySQL Database for SPPIX${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install MySQL if not already installed
if ! command -v mysql &> /dev/null; then
    print_status "Installing MySQL Server..."
    apt update
    apt install -y mysql-server mysql-client
fi

# Start and enable MySQL service
print_status "Starting MySQL service..."
systemctl start mysql
systemctl enable mysql

# Secure MySQL installation
print_status "Securing MySQL installation..."
mysql_secure_installation << EOF

y
$DB_PASSWORD
$DB_PASSWORD
y
y
y
y
EOF

# Create database and user
print_status "Creating database and user..."
mysql -u root -p$DB_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';
FLUSH PRIVILEGES;
SHOW DATABASES;
EOF

# Configure MySQL for production
print_status "Configuring MySQL for production..."
cat > /etc/mysql/mysql.conf.d/sppix.cnf << EOF
[mysqld]
# Basic settings
default-storage-engine = InnoDB
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Connection settings
max_connections = 200
max_connect_errors = 1000
wait_timeout = 28800
interactive_timeout = 28800

# Query cache
query_cache_type = 1
query_cache_size = 32M
query_cache_limit = 2M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Security
local_infile = 0
symbolic-links = 0

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4
EOF

# Create MySQL log directory
mkdir -p /var/log/mysql
chown mysql:mysql /var/log/mysql

# Restart MySQL to apply configuration
print_status "Restarting MySQL with new configuration..."
systemctl restart mysql

# Test database connection
print_status "Testing database connection..."
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST -e "USE $DB_NAME; SHOW TABLES;" || {
    print_error "Database connection failed!"
    exit 1
}

# Create database backup script
print_status "Creating database backup script..."
cat > /opt/backup_database.sh << EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/database"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Create database backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/sppix_db_\$DATE.sql

# Compress backup
gzip \$BACKUP_DIR/sppix_db_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: sppix_db_\$DATE.sql.gz"
EOF

chmod +x /opt/backup_database.sh

# Create database restore script
print_status "Creating database restore script..."
cat > /opt/restore_database.sh << EOF
#!/bin/bash
if [ -z "\$1" ]; then
    echo "Usage: \$0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="\$1"
if [ ! -f "\$BACKUP_FILE" ]; then
    echo "Backup file not found: \$BACKUP_FILE"
    exit 1
fi

echo "Restoring database from \$BACKUP_FILE..."
gunzip -c "\$BACKUP_FILE" | mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME
echo "Database restore completed!"
EOF

chmod +x /opt/restore_database.sh

# Set up daily database backup
print_status "Setting up daily database backup..."
echo "0 3 * * * /opt/backup_database.sh" | crontab -

# Create database monitoring script
print_status "Creating database monitoring script..."
cat > /opt/monitor_database.sh << EOF
#!/bin/bash
echo "=== SPPIX Database Status ==="
echo ""

# Check MySQL service status
echo "MySQL Service Status:"
systemctl is-active mysql
echo ""

# Check database size
echo "Database Size:"
mysql -u $DB_USER -p$DB_PASSWORD -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = '$DB_NAME' GROUP BY table_schema;"
echo ""

# Check connections
echo "Active Connections:"
mysql -u $DB_USER -p$DB_PASSWORD -e "SHOW STATUS LIKE 'Threads_connected';"
echo ""

# Check slow queries
echo "Slow Query Count:"
mysql -u $DB_USER -p$DB_PASSWORD -e "SHOW STATUS LIKE 'Slow_queries';"
echo ""

# Check uptime
echo "MySQL Uptime:"
mysql -u $DB_USER -p$DB_PASSWORD -e "SHOW STATUS LIKE 'Uptime';"
EOF

chmod +x /opt/monitor_database.sh

# Test Django database connection
print_status "Testing Django database connection..."
cd /opt/sppix-store/Backend
source venv/bin/activate
python manage.py check --database default || {
    print_warning "Django database check failed. This might be normal if migrations haven't been run yet."
}

# Final status
print_status "Database setup complete!"
echo ""
echo -e "${BLUE}📋 Database Configuration Summary:${NC}"
echo -e "   Database Name: $DB_NAME"
echo -e "   Database User: $DB_USER"
echo -e "   Database Host: $DB_HOST"
echo -e "   Database Port: $DB_PORT"
echo -e "   Backup Script: /opt/backup_database.sh"
echo -e "   Restore Script: /opt/restore_database.sh"
echo -e "   Monitor Script: /opt/monitor_database.sh"
echo ""
echo -e "${BLUE}🛠️  Database Management Commands:${NC}"
echo -e "   Backup: sudo /opt/backup_database.sh"
echo -e "   Restore: sudo /opt/restore_database.sh <backup_file>"
echo -e "   Monitor: sudo /opt/monitor_database.sh"
echo -e "   Connect: mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME"
echo ""
echo -e "${GREEN}🗄️  Your database is ready for production!${NC}"
