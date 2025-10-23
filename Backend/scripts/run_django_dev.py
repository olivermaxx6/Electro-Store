#!/usr/bin/env python
"""
Django Development Server Launcher
Forces Django to run on 127.0.0.1:8001 in development
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Get the backend directory (parent of scripts)
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)
    
    # Set environment variables to ensure port 8001
    os.environ.setdefault('DJANGO_DEV_HOST', '127.0.0.1')
    os.environ.setdefault('DJANGO_DEV_PORT', '8001')
    
    # Build the command
    cmd = [sys.executable, 'manage.py', 'runserver', '127.0.0.1:8001']
    
    print("Starting Django development server on 127.0.0.1:8001...")
    print(f"Command: {' '.join(cmd)}")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
