#!/usr/bin/env python3
"""
Development ASGI server runner for WebSocket support.
Run this instead of manage.py runserver for WebSocket functionality.
"""

import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django
django.setup()

if __name__ == "__main__":
    try:
        import uvicorn
        print("Starting ASGI server with uvicorn...")
        uvicorn.run(
            "core.asgi:application",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("uvicorn not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "uvicorn"])
        print("Please run this script again after installation.")
