from django.core.management.base import BaseCommand
from django.test import Client
import json

class Command(BaseCommand):
    help = "Run quick HTTP diagnostics with Django test client."

    def handle(self, *args, **kwargs):
        c = Client()

        # Health
        r = c.get("/api/admin/health/ping/")
        self.stdout.write(f"GET /api/admin/health/ping/ -> {r.status_code} {r.content}")

        # Echo
        r = c.post("/api/admin/debug/request-echo/", {"x": "1"})
        self.stdout.write(f"POST /api/admin/debug/request-echo/ -> {r.status_code} {r.content}")

        # Admin categories list (unauthenticated expected 401)
        r = c.get("/api/admin/categories/")
        self.stdout.write(f"GET /api/admin/categories/ (no auth) -> {r.status_code}")

        # If router import failed, this will likely be 404; check your console log for 'Router setup failed'.
