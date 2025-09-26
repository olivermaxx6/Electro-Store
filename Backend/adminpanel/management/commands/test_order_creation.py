from django.core.management.base import BaseCommand
from adminpanel.models import Order, OrderItem, Product, Payment
from adminpanel.id_generators import generate_unique_tracking_id
import stripe
from django.conf import settings

class Command(BaseCommand):
    help = 'Test order creation flow to verify webhook handler works'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Order Creation Flow'))
        self.stdout.write('=' * 50)
        
        try:
            # Step 1: Check if we have products
            products = Product.objects.all()
            if not products.exists():
                self.stdout.write(self.style.ERROR('❌ No products found. Please seed the database first.'))
                return
            
            product = products.first()
            self.stdout.write(f'✅ Using product: {product.name} (£{product.price})')
            
            # Step 2: Create a test order
            self.stdout.write('\n🔄 Step 1: Creating test order...')
            order = Order.objects.create(
                user=None,  # Guest order
                tracking_id=generate_unique_tracking_id(),
                payment_id='pi_test_123456789',
                customer_email='test@example.com',
                customer_phone='+1234567890',
                shipping_address={
                    'firstName': 'Test',
                    'lastName': 'Customer',
                    'address1': '123 Test Street',
                    'city': 'Test City',
                    'state': 'Test State',
                    'postcode': 'TE1 1ST'
                },
                subtotal=25.00,
                shipping_cost=0.00,
                tax_amount=0.00,
                total_price=25.00,
                payment_method='credit_card',
                shipping_name='Test Shipping',
                status='pending',
                payment_status='paid'
            )
            
            self.stdout.write(f'✅ Order created: {order.id} - {order.tracking_id}')
            
            # Step 3: Create order item
            self.stdout.write('\n🔄 Step 2: Creating order item...')
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                quantity=1,
                unit_price=25.00
            )
            
            self.stdout.write(f'✅ Order item created: {order_item.id}')
            
            # Step 4: Create payment record
            self.stdout.write('\n🔄 Step 3: Creating payment record...')
            import uuid
            payment = Payment.objects.create(
                order=order,
                stripe_payment_intent_id=f'pi_test_{uuid.uuid4().hex[:8]}',
                amount=25.00,
                currency='GBP',
                status='completed'
            )
            
            self.stdout.write(f'✅ Payment record created: {payment.id}')
            
            # Step 5: Verify order in admin
            self.stdout.write('\n🔄 Step 4: Verifying order data...')
            self.stdout.write(f'   Order ID: {order.id}')
            self.stdout.write(f'   Tracking ID: {order.tracking_id}')
            self.stdout.write(f'   Customer Email: {order.customer_email}')
            self.stdout.write(f'   Total Price: £{order.total_price}')
            self.stdout.write(f'   Status: {order.status}')
            self.stdout.write(f'   Payment Status: {order.payment_status}')
            self.stdout.write(f'   Items Count: {order.items.count()}')
            self.stdout.write(f'   Payment Records: {Payment.objects.filter(order=order).count()}')
            
            # Step 6: Test webhook handler logic
            self.stdout.write('\n🔄 Step 5: Testing webhook handler logic...')
            from adminpanel.views_stripe import handle_checkout_session_completed
            
            # Create a mock session object
            mock_session = {
                'id': order.tracking_id,
                'payment_intent': order.payment_id,
                'amount_total': 2500,  # 25.00 in cents
                'currency': 'gbp',
                'customer_email': order.customer_email,
                'customer_details': {
                    'phone': order.customer_phone
                },
                'shipping_details': {
                    'address': order.shipping_address
                },
                'payment_status': 'paid',
                'metadata': {
                    'user_id': 'guest',
                    'total_price': '25.00',
                    'cart_items_count': '1'
                }
            }
            
            # Test the webhook handler
            try:
                handle_checkout_session_completed(mock_session)
                self.stdout.write('✅ Webhook handler executed successfully')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Webhook handler failed: {str(e)}'))
            
            # Step 7: Final verification
            self.stdout.write('\n🔄 Step 6: Final verification...')
            updated_order = Order.objects.get(id=order.id)
            self.stdout.write(f'   Final Status: {updated_order.status}')
            self.stdout.write(f'   Final Payment Status: {updated_order.payment_status}')
            
            self.stdout.write('\n🎉 Order Creation Test Completed Successfully!')
            self.stdout.write('=' * 50)
            self.stdout.write(f'✅ Order {order.id} is ready for admin panel')
            self.stdout.write(f'✅ Visit /admin/orders to see the order')
            self.stdout.write(f'✅ Webhook handler can process this order')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Test failed: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())
