from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
import asyncio

class Command(BaseCommand):
    help = "Ping channel layer (Redis)"

    def handle(self, *args, **opts):
        layer = get_channel_layer()
        async def _ping():
            # Simple no-op send/receive group (won't deliver but will validate connection)
            try:
                await layer.group_add("ws_health_group", "test!channel")
                await layer.group_discard("ws_health_group", "test!channel")
                print("Channel layer OK")
            except Exception as e:
                print("Channel layer FAIL:", e)
        asyncio.run(_ping())
