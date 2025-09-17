from django.core.management.base import BaseCommand
from adminpanel.models import StoreSettings

class Command(BaseCommand):
    help = 'Create or update store settings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--currency',
            type=str,
            default='USD',
            help='Currency code (default: USD)'
        )
        parser.add_argument(
            '--tax-rate',
            type=float,
            default=0.0,
            help='Tax rate percentage (default: 0.0)'
        )
        parser.add_argument(
            '--shipping-rate',
            type=float,
            default=0.0,
            help='Shipping rate (default: 0.0)'
        )

    def handle(self, *args, **options):
        currency = options['currency']
        tax_rate = options['tax_rate']
        shipping_rate = options['shipping_rate']

        # Get or create store settings
        store_settings, created = StoreSettings.objects.get_or_create(
            id=1,
            defaults={
                'currency': currency,
                'tax_rate': tax_rate,
                'shipping_rate': shipping_rate,
            }
        )

        if not created:
            # Update existing settings
            store_settings.currency = currency
            store_settings.tax_rate = tax_rate
            store_settings.shipping_rate = shipping_rate
            store_settings.save()
            self.stdout.write(
                self.style.SUCCESS(f'Updated store settings: Currency={currency}, Tax Rate={tax_rate}%, Shipping Rate=${shipping_rate}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Created store settings: Currency={currency}, Tax Rate={tax_rate}%, Shipping Rate=${shipping_rate}')
            )
