# Section 7: Import Data (Windows PowerShell)
Write-Host "=== SECTION 7: Import Data ===" -ForegroundColor Green

# Import data using Django management commands
python manage.py seed_database
python manage.py seed_comprehensive_products

Write-Host "✅ Section 7 Complete - Data imported" -ForegroundColor Green
Write-Host "👉 Run Section 8 next" -ForegroundColor Cyan
