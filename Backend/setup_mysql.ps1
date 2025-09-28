# PowerShell script to create MySQL database and user
Write-Host "Creating MySQL database and user for Electro Store..." -ForegroundColor Green

# MySQL connection details
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$rootUser = "root"
$databaseName = "electro_store"
$dbUser = "electro_user"
$dbPassword = "ElectroStore2024!"

# SQL commands to execute
$sqlCommands = @"
CREATE DATABASE IF NOT EXISTS $databaseName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$dbUser'@'localhost' IDENTIFIED BY '$dbPassword';
GRANT ALL PRIVILEGES ON $databaseName.* TO '$dbUser'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES LIKE '$databaseName';
SELECT User, Host FROM mysql.user WHERE User = '$dbUser';
"@

# Execute the commands
Write-Host "Executing MySQL commands..." -ForegroundColor Yellow
Write-Host "You will be prompted for the MySQL root password." -ForegroundColor Cyan

try {
    & $mysqlPath -u $rootUser -p -e $sqlCommands
    Write-Host "MySQL setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error executing MySQL commands: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
