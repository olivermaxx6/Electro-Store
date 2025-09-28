# MySQL Migration Guide for Electro-Store

This guide will help you migrate your Electro-Store Django application from SQLite to MySQL with multi-port frontend support.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Django 5.2.6
- MySQL Server
- Node.js (for frontend)

### 1. Run the Migration Script

```bash
cd Backend
chmod +x mysql_migration_script.sh
./mysql_migration_script.sh
```

### 2. Update Django Settings

After running the migration script, you'll need to manually update your `settings.py`:

1. Uncomment the MySQL database configuration
2. Comment out the SQLite configuration
3. Set your MySQL password in environment variables

### 3. Start Development Environment

```bash
# Linux/Mac
./start_dev.sh

# Windows
start_dev.bat

# PowerShell
.\start_dev.ps1
```

## 📋 Configuration Details

### Port Configuration
- **Django Backend**: `127.0.0.1:8001`
- **Storefront**: `localhost:5173`
- **Admin Panel**: `localhost:5174`

### Database Configuration

#### SQLite (Default)
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

#### MySQL (After Migration)
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DJANGO_DB_NAME", "electro_store"),
        "USER": os.getenv("DJANGO_DB_USER", "electro_user"),
        "PASSWORD": os.getenv("DJANGO_DB_PASSWORD", ""),
        "HOST": os.getenv("DJANGO_DB_HOST", "localhost"),
        "PORT": os.getenv("DJANGO_DB_PORT", "3306"),
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES', character_set_connection=utf8mb4, collation_connection=utf8mb4_unicode_ci",
            "charset": "utf8mb4",
            "use_unicode": True,
            "connect_timeout": 30,
        },
        "CONN_MAX_AGE": 300,
        "TIME_ZONE": "UTC",
    }
}
```

### CORS Configuration

The application is configured to support multiple frontend ports:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",    # Storefront
    "http://127.0.0.1:5173",   # Storefront
    "http://localhost:5174",    # Admin
    "http://127.0.0.1:5174",   # Admin
    "http://localhost:8001",   # Django dev server
    "http://127.0.0.1:8001",   # Django dev server
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## 🔧 Manual Configuration Steps

### 1. Environment Variables

Create a `.env` file in the Backend directory:

```bash
cp env.mysql.example .env
```

Update the `.env` file with your MySQL credentials:

```env
DJANGO_DB_NAME=electro_store
DJANGO_DB_USER=electro_user
DJANGO_DB_PASSWORD=your_actual_mysql_password
DJANGO_DB_HOST=localhost
DJANGO_DB_PORT=3306
```

### 2. Frontend Environment Variables

Update your React frontend `.env` files:

#### Storefront (.env)
```env
VITE_API_URL=http://127.0.0.1:8001/api/
VITE_BASE_URL=http://127.0.0.1:8001
```

#### Admin (.env)
```env
VITE_ADMIN_API_URL=http://127.0.0.1:8001/admin/api/
VITE_BASE_URL=http://127.0.0.1:8001
```

### 3. Database Migration

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
python manage.py shell
```

```python
from django.db import connection
connection.ensure_connection()
print("✅ MySQL connection successful!")
```

### 2. Test API Endpoints

```bash
# Test API
curl http://127.0.0.1:8001/api/

# Test Admin
curl http://127.0.0.1:8001/admin/

# Test CORS
curl -H "Origin: http://localhost:5173" -I http://127.0.0.1:8001/api/
```

### 3. Test Frontend Integration

1. Start Django: `./start_dev.sh`
2. Start Storefront: `cd ../Frontend && npm run dev`
3. Start Admin: `cd ../Frontend && npm run dev:admin`

## 🚨 Troubleshooting

### Common Issues

#### 1. MySQL Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### 2. CORS Issues
- Check browser console for CORS errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Ensure `CORS_ALLOW_CREDENTIALS = True`

#### 3. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8001
netstat -tulpn | grep :5173
netstat -tulpn | grep :5174
```

#### 4. Database Migration Issues
```bash
# Reset migrations (if needed)
python manage.py migrate --fake-initial

# Check migration status
python manage.py showmigrations
```

### Performance Optimization

#### MySQL Configuration
```sql
-- Optimize MySQL for Django
SET GLOBAL innodb_buffer_pool_size = 1073741824;
SET GLOBAL innodb_log_file_size = 268435456;
SET GLOBAL max_connections = 500;
SET GLOBAL thread_cache_size = 16;
```

#### Django Settings
```python
# Enable MySQL query optimization
DJANGO_MYSQL_REWRITE_QUERIES = True

# Connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 300
```

## 🔒 Security Considerations

### Development
- `CORS_ALLOW_ALL_ORIGINS = True` (for development only)
- `DEBUG = True` (for development only)

### Production
```python
# Production settings
CORS_ALLOW_ALL_ORIGINS = False
DEBUG = False
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

## 📊 Monitoring

### Database Monitoring
```bash
# Check MySQL status
mysql -u root -p -e "SHOW PROCESSLIST;"

# Monitor Django database queries
python manage.py shell
```

```python
from django.db import connection
print(f"Queries executed: {len(connection.queries)}")
```

### Log Monitoring
```bash
# Django logs
tail -f logs/django.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

## 🎯 Next Steps

1. **Production Deployment**: Update settings for production environment
2. **Backup Strategy**: Set up automated database backups
3. **Monitoring**: Implement application monitoring
4. **Performance**: Optimize database queries and indexes
5. **Security**: Implement proper security headers and SSL

## 📚 Additional Resources

- [Django MySQL Documentation](https://docs.djangoproject.com/en/stable/ref/databases/#mysql-notes)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [CORS Configuration Guide](https://github.com/adamchainz/django-cors-headers)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Django and MySQL logs
3. Verify all environment variables are set correctly
4. Ensure all required packages are installed

For additional help, refer to the project documentation or create an issue in the project repository.
