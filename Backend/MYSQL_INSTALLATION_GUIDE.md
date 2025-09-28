# MySQL Installation Instructions for Windows

## Option 1: Download MySQL Installer (Recommended)
1. Go to: https://dev.mysql.com/downloads/mysql/
2. Download "MySQL Installer for Windows"
3. Run the installer as Administrator
4. Choose "Developer Default" installation
5. Set root password during installation
6. Complete the installation

## Option 2: Using Chocolatey (if available)
```powershell
# Run PowerShell as Administrator
choco install mysql
```

## Option 3: Using winget (if available)
```powershell
# Run PowerShell as Administrator
winget install Oracle.MySQL
```

## After Installation:
1. Start MySQL service: `net start mysql`
2. Test connection: `mysql -u root -p`
3. Run the migration script: `.\mysql_migration_windows.ps1`

## Manual Database Setup (if needed):
```sql
CREATE DATABASE electro_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'electro_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON electro_store.* TO 'electro_user'@'localhost';
FLUSH PRIVILEGES;
```
