from django.core.management.commands.runserver import Command as BaseRunserver
from django.core.management.base import CommandError


class Command(BaseRunserver):
    default_addr = "127.0.0.1"
    default_port = "8001"

    def handle(self, *args, **options):
        # Resolve the effective addr:port the parent would use
        addr = options.get("addr")
        port = options.get("port")
        addrport = options.get("addrport")

        effective = addrport or (f"{addr or self.default_addr}:{port or self.default_port}")

        if effective.endswith(":8000") or effective == "8000":
            raise CommandError("Port 8000 is disallowed in this repo. Use 127.0.0.1:8001.")

        # Normalize back into options in case only port was supplied
        options["addrport"] = effective
        return super().handle(*args, **options)
