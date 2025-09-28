# Section 2: Install MySQL Packages (Windows PowerShell)
Write-Host "=== SECTION 2: Install MySQL Packages ===" -ForegroundColor Green

# Install required packages
pip install mysqlclient django-cors-headers django-mysql

# Verify
python -c "import MySQLdb; print('MySQL client OK')"

Write-Host "✅ Section 2 Complete - Packages installed" -ForegroundColor Green
Write-Host "👉 Run Section 3 next" -ForegroundColor Cyan
