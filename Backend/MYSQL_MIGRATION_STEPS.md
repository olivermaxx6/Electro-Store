# Complete MySQL Migration Guide for Electro-Store

## Prerequisites
1. **Install MySQL Server** (see MYSQL_INSTALLATION_GUIDE.md)
2. **Start MySQL Service**: `net start mysql`
3. **Verify Installation**: `mysql --version`

## Step-by-Step Migration Process

### Step 1: Install MySQL Server
Follow the instructions in `MYSQL_INSTALLATION_GUIDE.md` to install MySQL.

### Step 2: Create Database and User
Run these commands in MySQL (as root):
```sql
CREATE DATABASE electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!';
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES LIKE 'electro_store';
```

### Step 3: Test Database Connection
```bash
cd Backend
python -c "import pymysql; pymysql.install_as_MySQLdb(); import django; django.setup(); from django.db import connection; connection.ensure_connection(); print('✅ MySQL connection successful!')"
```

### Step 4: Create Database Schema
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Load Data from SQLite Backup
```bash
python manage.py loaddata sqlite_backup.json
```

### Step 6: Verify Migration
```bash
python manage.py shell -c "from django.apps import apps; total=0; [total:=total+model.objects.count() for app in apps.get_app_configs() for model in app.get_models()]; print(f'Total records: {total}')"
```

### Step 7: Test Application
```bash
python manage.py runserver 127.0.0.1:8001
```

## Troubleshooting

### If MySQL Connection Fails:
1. Check MySQL service: `net start mysql`
2. Verify credentials in `core/settings.py`
3. Test connection: `mysql -u electro_user -p electro_store`

### If Data Loading Fails:
1. Check backup file: `sqlite_backup.json`
2. Try loading individual apps: `python manage.py loaddata sqlite_backup.json --verbosity=2`

### If CORS Issues Occur:
1. Check CORS settings in `core/settings.py`
2. Verify frontend URLs are in `CORS_ALLOWED_ORIGINS`

## Configuration Summary
- **Database**: MySQL `electro_store`
- **User**: `electro_user`
- **Password**: `ElectroStore2024!`
- **Django Backend**: `http://127.0.0.1:8001`
- **Storefront**: `http://localhost:5173`
- **Admin**: `http://localhost:5174`

## Files Modified
- ✅ `core/settings.py` - Updated to use MySQL
- ✅ `sqlite_backup.json` - Created data backup
- ✅ `db.sqlite3.backup` - Created SQLite backup

## Next Steps After Migration
1. Test all functionality
2. Update frontend environment variables if needed
3. Consider removing SQLite files after verification
4. Set up regular MySQL backups
