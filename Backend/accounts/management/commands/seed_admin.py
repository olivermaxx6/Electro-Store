from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = "Seed a default admin user (username=admin, password=admin123) or use env ADMIN_USER/ADMIN_PASS"

    def handle(self, *args, **options):
        username = os.getenv("ADMIN_USER", "admin")
        password = os.getenv("ADMIN_PASS", "admin123")
        email = os.getenv("ADMIN_EMAIL", "admin@example.com")

        user, created = User.objects.get_or_create(username=username, defaults={
            "email": email,
            "is_staff": True,
            "is_superuser": True,
        })
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin {username}/{password}"))
        else:
            self.stdout.write(self.style.WARNING("Admin user already exists"))
