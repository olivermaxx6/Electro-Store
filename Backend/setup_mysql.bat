@echo off
echo Creating MySQL database and user for Electro Store...
echo.

REM Connect to MySQL and execute the setup commands
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'electro_user'@'localhost' IDENTIFIED BY 'ElectroStore2024!'; GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost'; FLUSH PRIVILEGES; SHOW DATABASES LIKE 'electro_store'; SELECT User, Host FROM mysql.user WHERE User = 'electro_user';"

echo.
echo MySQL setup completed!
pause
