# Section 5: Test MySQL Connection (Windows PowerShell)
Write-Host "=== SECTION 5: Test MySQL Connection ===" -ForegroundColor Green

# Test connection
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.db import connection
connection.ensure_connection()
print('✅ MySQL connection successful')
"

Write-Host "✅ Section 5 Complete - Connection tested" -ForegroundColor Green
Write-Host "👉 Run Section 6 next" -ForegroundColor Cyan
