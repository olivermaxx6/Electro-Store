# Section 3: MySQL Database Setup (Windows PowerShell)
Write-Host "=== SECTION 3: MySQL Database Setup ===" -ForegroundColor Green

# Generate a secure password
$MYSQL_PASSWORD = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | % {[char]$_})
Write-Host "Generated password: $MYSQL_PASSWORD" -ForegroundColor Yellow

# Save password to file
"Password: $MYSQL_PASSWORD" | Out-File -FilePath "$env:USERPROFILE\mysql_pass.txt" -Encoding ASCII
Write-Host "Password saved to: $env:USERPROFILE\mysql_pass.txt" -ForegroundColor Cyan

# Create SQL commands
$sqlCommands = @"
CREATE DATABASE myproject CHARACTER SET utf8mb4;
CREATE USER 'django_user'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL ON myproject.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
"@

# Save SQL commands to temporary file
$sqlCommands | Out-File -FilePath "temp_mysql_setup.sql" -Encoding ASCII

Write-Host "Executing MySQL commands..." -ForegroundColor Yellow
Write-Host "You will be prompted for your MySQL root password." -ForegroundColor Cyan

# Execute MySQL commands
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < temp_mysql_setup.sql

# Clean up temporary file
Remove-Item "temp_mysql_setup.sql" -Force

Write-Host "✅ Section 3 Complete - MySQL database created" -ForegroundColor Green
Write-Host "👉 Run Section 4 next" -ForegroundColor Cyan
