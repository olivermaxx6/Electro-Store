# Section 6: Create Database Tables (Windows PowerShell)
Write-Host "=== SECTION 6: Create Database Tables ===" -ForegroundColor Green

# Create tables
python manage.py migrate

Write-Host "✅ Section 6 Complete - Tables created" -ForegroundColor Green
Write-Host "👉 Run Section 7 next" -ForegroundColor Cyan
