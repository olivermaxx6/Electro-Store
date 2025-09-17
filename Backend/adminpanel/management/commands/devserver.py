from django.core.management.commands.runserver import Command as RunserverCommand


class Command(RunserverCommand):
    """
    Custom Django development server command that defaults to 127.0.0.1:8001
    """
    default_addr = "127.0.0.1"
    default_port = "8001"
    
    def add_arguments(self, parser):
        super().add_arguments(parser)
        # Override the default address and port
        parser.set_defaults(addrport=f"{self.default_addr}:{self.default_port}")
