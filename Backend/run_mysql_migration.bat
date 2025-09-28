@echo off
echo =============================================
echo ELECTRO-STORE MYSQL MIGRATION
echo =============================================

echo.
echo Step 1: Testing MySQL connection...
python test_mysql_connection.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ MySQL connection test failed!
    echo Please install MySQL and run the database setup first.
    echo See MYSQL_INSTALLATION_GUIDE.md for instructions.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating database schema...
python manage.py makemigrations
python manage.py migrate

echo.
echo Step 3: Loading data from SQLite backup...
python manage.py loaddata sqlite_backup.json

echo.
echo Step 4: Verifying migration...
python manage.py shell -c "from django.apps import apps; total=0; [total:=total+model.objects.count() for app in apps.get_app_configs() for model in app.get_models()]; print(f'Total records migrated: {total}')"

echo.
echo Step 5: Testing Django server...
echo Starting Django server on 127.0.0.1:8001...
echo Press Ctrl+C to stop the server after testing.
python manage.py runserver 127.0.0.1:8001

echo.
echo ✅ Migration completed successfully!
echo.
echo Configuration Summary:
echo - Database: MySQL electro_store
echo - Django Backend: http://127.0.0.1:8001
echo - Storefront: http://localhost:5173
echo - Admin: http://localhost:5174
echo.
pause
