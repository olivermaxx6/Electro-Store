import os
import sys
import subprocess

# Set Stripe environment variables if not already set
if not os.getenv("STRIPE_SECRET_KEY"):
    os.environ["STRIPE_SECRET_KEY"] = "your_stripe_secret_key_here"

if not os.getenv("STRIPE_PUBLISHABLE_KEY"):
    os.environ["STRIPE_PUBLISHABLE_KEY"] = "your_stripe_publishable_key_here"

# Get host and port from environment variables with defaults
host = os.getenv("DJANGO_DEV_HOST", "127.0.0.1")
port = os.getenv("DJANGO_DEV_PORT", "8001")
addr = f"{host}:{port}"

print(f"Starting Django development server on {addr}...")
print(f"Stripe Secret Key: {os.getenv('STRIPE_SECRET_KEY', 'NOT SET')[:20]}...")

# Run Django development server using custom runserver command (enforces port policy)
subprocess.check_call([sys.executable, "manage.py", "runserver", addr])
