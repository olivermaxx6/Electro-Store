# Complete SQLite to MySQL Migration Guide
## Electro Store Django Project

This guide will walk you through migrating your Django Electro Store project from SQLite to MySQL with zero downtime and minimal risk.

## 📋 Pre-Migration Checklist

### ✅ Prerequisites
- [ ] MySQL Server installed (5.7+ or 8.0+)
- [ ] Python virtual environment activated
- [ ] Current SQLite database backed up
- [ ] Admin access to MySQL server
- [ ] Project currently running without errors

### ✅ Current Project Analysis
Your project is **migration-ready** because:
- ✅ Uses standard Django ORM (no raw SQL)
- ✅ JSONField usage (supported in MySQL 5.7+)
- ✅ UUIDField usage (fully supported)
- ✅ Standard field types only
- ✅ No database-specific code found

---

## 🚀 Step-by-Step Migration Process

### Step 1: Install MySQL and Setup Database

#### 1.1 Install MySQL Server
```bash
# Windows (using Chocolatey)
choco install mysql

# Or download from: https://dev.mysql.com/downloads/mysql/

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (using Homebrew)
brew install mysql
```

#### 1.2 Start MySQL Service
```bash
# Windows
net start mysql

# Linux/macOS
sudo systemctl start mysql
# or
sudo service mysql start
```

#### 1.3 Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

#### 1.4 Create Database and User
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'electro_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 2: Install Python MySQL Driver

#### 2.1 Install MySQL Client
```bash
# Navigate to your Backend directory
cd Backend

# Install MySQL driver
pip install mysqlclient

# Alternative if mysqlclient fails:
pip install PyMySQL
```

#### 2.2 Update requirements.txt
```bash
# Add to requirements.txt
echo "mysqlclient==2.2.0" >> requirements.txt
# or
echo "PyMySQL==1.1.0" >> requirements.txt
```

### Step 3: Update Django Configuration

#### 3.1 Create Environment File
```bash
# Copy the example environment file
cp env.example .env
```

#### 3.2 Update .env File
```env
# Database Configuration - Update these lines
DATABASE_URL=mysql://electro_user:your_password@localhost:3306/electro_store

# Add MySQL-specific settings
DB_ENGINE=django.db.backends.mysql
DB_NAME=electro_store
DB_USER=electro_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

#### 3.3 Update settings.py
Replace the DATABASES section in `Backend/core/settings.py`:

```python
# Database Configuration
import os
from dotenv import load_dotenv

load_dotenv()

DATABASES = {
    "default": {
        "ENGINE": os.getenv("DB_ENGINE", "django.db.backends.mysql"),
        "NAME": os.getenv("DB_NAME", "electro_store"),
        "USER": os.getenv("DB_USER", "electro_user"),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

### Step 4: Test Database Connection

#### 4.1 Test Connection
```bash
# Navigate to Backend directory
cd Backend

# Test database connection
python manage.py dbshell
```

If successful, you should see MySQL prompt. Type `EXIT;` to return.

#### 4.2 Create Initial Tables
```bash
# Create all tables
python manage.py migrate

# Check if migrations were successful
python manage.py showmigrations
```

### Step 5: Data Migration (If You Have Existing Data)

#### 5.1 Export Data from SQLite
```bash
# Create a data export script
cat > export_sqlite_data.py << 'EOF'
import os
import django
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Export data using Django's dumpdata
execute_from_command_line(['manage.py', 'dumpdata', '--natural-foreign', '--natural-primary', '-e', 'contenttypes', '-e', 'auth.Permission', '--indent', '2', '--output', 'data_backup.json'])
EOF

# Run the export
python export_sqlite_data.py
```

#### 5.2 Import Data to MySQL
```bash
# Load data into MySQL database
python manage.py loaddata data_backup.json
```

### Step 6: Create Superuser and Test

#### 6.1 Create Admin User
```bash
python manage.py createsuperuser
```

#### 6.2 Test Application
```bash
# Start development server
python manage.py runserver

# Test in browser: http://localhost:8000/admin/
```

### Step 7: Verify Migration Success

#### 7.1 Database Verification
```bash
# Check database tables
python manage.py dbshell
```

In MySQL prompt:
```sql
-- List all tables
SHOW TABLES;

-- Check a specific table structure
DESCRIBE adminpanel_product;

-- Check data count
SELECT COUNT(*) FROM adminpanel_product;

-- Exit
EXIT;
```

#### 7.2 Application Testing Checklist
- [ ] Admin panel loads correctly
- [ ] User authentication works
- [ ] Product CRUD operations work
- [ ] Order creation works
- [ ] JSONField data displays correctly
- [ ] File uploads work
- [ ] API endpoints respond correctly
- [ ] WebSocket connections work

---

## 🔧 Troubleshooting Common Issues

### Issue 1: MySQL Client Installation Problems

**Problem**: `mysqlclient` installation fails
**Solution**:
```bash
# Install system dependencies first
# Windows: Install Visual Studio Build Tools
# Ubuntu/Debian:
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential

# Then install
pip install mysqlclient
```

### Issue 2: Character Set Issues

**Problem**: Unicode characters not displaying correctly
**Solution**: Ensure UTF-8 configuration:
```python
# In settings.py DATABASES OPTIONS
"OPTIONS": {
    "charset": "utf8mb4",
    "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
    "use_unicode": True,
}
```

### Issue 3: Connection Refused

**Problem**: Can't connect to MySQL
**Solution**:
```bash
# Check MySQL service status
sudo systemctl status mysql

# Check if MySQL is listening on port 3306
netstat -tlnp | grep 3306

# Restart MySQL service
sudo systemctl restart mysql
```

### Issue 4: Permission Denied

**Problem**: User doesn't have proper privileges
**Solution**:
```sql
-- Connect as root and fix permissions
mysql -u root -p

GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 5: Migration Errors

**Problem**: Migrations fail to apply
**Solution**:
```bash
# Check migration status
python manage.py showmigrations

# Reset migrations if needed (DANGER: Only for development)
python manage.py migrate --fake-initial

# Or reset specific app
python manage.py migrate adminpanel zero
python manage.py migrate adminpanel
```

---

## 📊 Performance Optimization

### MySQL Configuration Tuning

#### 1. Update MySQL Configuration
Edit `/etc/mysql/mysql.conf.d/mysqld.cnf` (Linux) or `my.ini` (Windows):

```ini
[mysqld]
# Basic settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Query cache (MySQL 5.7)
query_cache_type = 1
query_cache_size = 32M

# Connection settings
max_connections = 100
```

#### 2. Django Database Optimization
```python
# In settings.py - Add database optimization
DATABASES = {
    "default": {
        # ... existing config ...
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            "isolation_level": None,  # Use MySQL's default
        },
        "CONN_MAX_AGE": 60,  # Connection pooling
    }
}
```

---

## 🔄 Rollback Plan (If Needed)

### Quick Rollback to SQLite
```python
# In settings.py - Revert to SQLite
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

### Data Recovery
```bash
# If you need to restore from backup
python manage.py loaddata data_backup.json
```

---

## 📈 Production Deployment Considerations

### 1. Environment Variables
```env
# Production .env
DEBUG=False
DB_ENGINE=django.db.backends.mysql
DB_NAME=electro_store_prod
DB_USER=electro_prod_user
DB_PASSWORD=strong_production_password
DB_HOST=your-mysql-server.com
DB_PORT=3306
```

### 2. Security Settings
```python
# In production settings.py
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            "ssl": {"ca": "/path/to/ca-cert.pem"},  # For SSL connections
        },
        "CONN_MAX_AGE": 300,
    }
}
```

### 3. Backup Strategy
```bash
# Create automated backup script
cat > backup_mysql.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u electro_user -p electro_store > backup_${DATE}.sql
gzip backup_${DATE}.sql
EOF

chmod +x backup_mysql.sh
```

---

## ✅ Post-Migration Checklist

### Immediate Verification
- [ ] Application starts without errors
- [ ] Admin panel accessible
- [ ] All CRUD operations work
- [ ] File uploads function
- [ ] API endpoints respond
- [ ] WebSocket connections work
- [ ] User authentication works
- [ ] Payment processing works

### Performance Testing
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Concurrent user handling

### Data Integrity
- [ ] All records migrated correctly
- [ ] JSONField data intact
- [ ] File references working
- [ ] User sessions preserved

---

## 🎯 Expected Benefits After Migration

1. **Better Performance**: MySQL handles concurrent connections better
2. **Scalability**: Easier to scale horizontally
3. **Production Ready**: Industry standard for production deployments
4. **Advanced Features**: Better indexing, query optimization
5. **Backup & Recovery**: More robust backup solutions
6. **Monitoring**: Better monitoring and profiling tools

---

## 📞 Support & Resources

### Documentation
- [Django Database Documentation](https://docs.djangoproject.com/en/stable/topics/db/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Django MySQL Backend](https://docs.djangoproject.com/en/stable/ref/databases/#mysql-notes)

### Common Commands Reference
```bash
# Database operations
python manage.py migrate
python manage.py makemigrations
python manage.py dbshell
python manage.py dumpdata
python manage.py loaddata

# MySQL operations
mysql -u username -p database_name
mysqldump -u username -p database_name > backup.sql
mysql -u username -p database_name < backup.sql
```

---

**🎉 Congratulations!** Your Django Electro Store is now running on MySQL with improved performance, scalability, and production readiness.

Remember to:
- Monitor performance after migration
- Set up regular backups
- Update your deployment scripts
- Test thoroughly in staging environment before production deployment
