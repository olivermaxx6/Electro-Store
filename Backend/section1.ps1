# Section 1: Install Python Packages (Windows PowerShell)
Write-Host "=== SECTION 1: Install Python Packages ===" -ForegroundColor Green

# Install required packages
pip install django djangorestframework django-cors-headers channels mysqlclient django-mysql python-dotenv stripe

# Verify installation
python -c "import django; print('Django version:', django.get_version())"
python -c "import rest_framework; print('DRF installed successfully')"

Write-Host "✅ Section 1 Complete - Packages installed" -ForegroundColor Green
Write-Host "👉 Run Section 2 next" -ForegroundColor Cyan
