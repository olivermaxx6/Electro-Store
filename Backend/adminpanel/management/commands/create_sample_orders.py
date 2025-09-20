from django.core.management.base import BaseCommand
from adminpanel.models import Order, OrderItem, Product
import uuid
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create sample orders for dashboard testing'

    def handle(self, *args, **options):
        # Get some products to use in orders
        products = Product.objects.all()[:5]
        
        if not products.exists():
            self.stdout.write(
                self.style.WARNING('No products found. Please create some products first.')
            )
            return

        # Sample orders data
        sample_orders = [
            {
                'customer_email': 'customer1@example.com',
                'customer_phone': '+1234567890',
                'shipping_address': {
                    'firstName': 'John',
                    'lastName': 'Doe',
                    'address1': '123 Main St',
                    'city': 'New York',
                    'state': 'NY',
                    'postcode': '10001'
                },
                'subtotal': Decimal('299.97'),
                'shipping_cost': Decimal('9.99'),
                'tax_amount': Decimal('24.00'),
                'total_price': Decimal('333.96'),
                'status': 'delivered',
                'payment_method': 'credit_card',
                'shipping_name': 'Standard Shipping',
                'items': [
                    {'product': products[0], 'quantity': 2, 'unit_price': Decimal('99.99')},
                    {'product': products[1] if len(products) > 1 else products[0], 'quantity': 1, 'unit_price': Decimal('99.99')}
                ]
            },
            {
                'customer_email': 'customer2@example.com',
                'customer_phone': '+0987654321',
                'shipping_address': {
                    'firstName': 'Jane',
                    'lastName': 'Smith',
                    'address1': '456 Oak Ave',
                    'city': 'Los Angeles',
                    'state': 'CA',
                    'postcode': '90210'
                },
                'subtotal': Decimal('149.99'),
                'shipping_cost': Decimal('19.99'),
                'tax_amount': Decimal('12.00'),
                'total_price': Decimal('181.98'),
                'status': 'processing',
                'payment_method': 'credit_card',
                'shipping_name': 'Express Shipping',
                'items': [
                    {'product': products[2] if len(products) > 2 else products[0], 'quantity': 1, 'unit_price': Decimal('149.99')}
                ]
            },
            {
                'customer_email': 'customer3@example.com',
                'customer_phone': '+1122334455',
                'shipping_address': {
                    'firstName': 'Bob',
                    'lastName': 'Johnson',
                    'address1': '789 Pine St',
                    'city': 'Chicago',
                    'state': 'IL',
                    'postcode': '60601'
                },
                'subtotal': Decimal('199.98'),
                'shipping_cost': Decimal('9.99'),
                'tax_amount': Decimal('16.00'),
                'total_price': Decimal('225.97'),
                'status': 'shipped',
                'payment_method': 'credit_card',
                'shipping_name': 'Standard Shipping',
                'items': [
                    {'product': products[3] if len(products) > 3 else products[0], 'quantity': 2, 'unit_price': Decimal('99.99')}
                ]
            },
            {
                'customer_email': 'customer4@example.com',
                'customer_phone': '+5544332211',
                'shipping_address': {
                    'firstName': 'Alice',
                    'lastName': 'Brown',
                    'address1': '321 Elm St',
                    'city': 'Houston',
                    'state': 'TX',
                    'postcode': '77001'
                },
                'subtotal': Decimal('79.99'),
                'shipping_cost': Decimal('9.99'),
                'tax_amount': Decimal('6.40'),
                'total_price': Decimal('96.38'),
                'status': 'pending',
                'payment_method': 'credit_card',
                'shipping_name': 'Standard Shipping',
                'items': [
                    {'product': products[4] if len(products) > 4 else products[0], 'quantity': 1, 'unit_price': Decimal('79.99')}
                ]
            }
        ]

        created_orders = 0
        
        for order_data in sample_orders:
            # Create order
            order = Order.objects.create(
                tracking_id=str(uuid.uuid4()),
                payment_id=f'pay_{uuid.uuid4().hex[:12]}',
                customer_email=order_data['customer_email'],
                customer_phone=order_data['customer_phone'],
                shipping_address=order_data['shipping_address'],
                subtotal=order_data['subtotal'],
                shipping_cost=order_data['shipping_cost'],
                tax_amount=order_data['tax_amount'],
                total_price=order_data['total_price'],
                status=order_data['status'],
                payment_method=order_data['payment_method'],
                shipping_name=order_data['shipping_name']
            )
            
            # Create order items
            for item_data in order_data['items']:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price']
                )
            
            created_orders += 1
            self.stdout.write(f'Created order #{order.id} with tracking ID: {order.tracking_id}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_orders} sample orders')
        )
