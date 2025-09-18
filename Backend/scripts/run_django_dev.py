import os
import sys
import subprocess

# Get host and port from environment variables with defaults
host = os.getenv("DJANGO_DEV_HOST", "127.0.0.1")
port = os.getenv("DJANGO_DEV_PORT", "8001")
addr = f"{host}:{port}"

print(f"Starting Django development server on {addr}...")

# Run Django development server using custom runserver command (enforces port policy)
subprocess.check_call([sys.executable, "manage.py", "runserver", addr])
