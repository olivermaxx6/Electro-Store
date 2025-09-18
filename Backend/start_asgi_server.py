#!/usr/bin/env python3
"""
Start ASGI server for Django with WebSocket support.
This script ensures proper Django setup before starting the server.
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def main():
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    
    # Setup Django
    django.setup()
    
    print("Starting ASGI server with WebSocket support...")
    print("Server will be available at:")
    print("  HTTP: http://127.0.0.1:8001")
    print("  WebSocket: ws://127.0.0.1:8001/ws/")
    print()
    
    try:
        import daphne
        from daphne.management.commands.runserver import Command as DaphneCommand
        
        # Start Daphne server
        os.system('daphne -b 127.0.0.1 -p 8001 core.asgi:application')
        
    except ImportError:
        print("Daphne not found. Installing...")
        os.system('pip install daphne')
        print("Please run this script again.")
        return
    
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == '__main__':
    main()
