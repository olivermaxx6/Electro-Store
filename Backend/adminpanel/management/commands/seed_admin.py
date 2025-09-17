from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Create or update a default admin (username=admin, password=admin123)"

    def handle(self, *args, **kwargs):
        user, created = User.objects.get_or_create(username="admin", defaults={
            "email": "admin@example.com",
            "is_staff": True,
            "is_superuser": True,
        })
        if created:
            user.set_password("admin123")
            user.save()
            self.stdout.write(self.style.SUCCESS("Admin created: admin / admin123"))
        else:
            user.is_staff = True
            user.is_superuser = True
            user.set_password("admin123")
            user.save()
            self.stdout.write(self.style.SUCCESS("Admin updated: admin / admin123"))
