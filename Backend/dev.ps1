# Stop anything on :8001
$pid = (Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
if ($pid) { Write-Host "Killing PID $pid on :8001"; Stop-Process -Id $pid -Force }

# Check Python
python --version

# Migrate
python manage.py check
python manage.py migrate

# Runserver on ALL interfaces (WSL/containers/windows)
# If you only bind 127.0.0.1 inside WSL2, Windows browser may not reach it.
Write-Host "Starting Django at 0.0.0.0:8001..."
python manage.py runserver 0.0.0.0:8001
