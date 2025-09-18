#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Dev-only guard: rewrite or block port 8000 for runserver
    if "runserver" in sys.argv:
        # If no addr:port was given, append the correct one
        if sys.argv[-1] == "runserver":
            sys.argv.append("127.0.0.1:8001")
        else:
            # Normalize last/next arg if it's :8000 or 8000
            for i, a in enumerate(sys.argv):
                if a.endswith(":8000") or a == "8000":
                    sys.argv[i] = a.replace(":8000", ":8001") if ":" in a else "8001"

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
