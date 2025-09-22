import stripe
import json
import logging
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Payment

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_intent(request):
    """Create a Stripe Payment Intent"""
    try:
        # Get store settings for currency
        from .models import StoreSettings
        store_settings = StoreSettings.objects.first()
        default_currency = store_settings.currency.lower() if store_settings else 'gbp'
        
        data = request.data
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to cents
        currency = data.get('currency', default_currency).lower()
        
        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'order_id': data.get('order_id', ''),
                'user_id': data.get('user_id', 'guest'),
                'customer_email': data.get('metadata', {}).get('customer_email', ''),
                'customer_name': data.get('metadata', {}).get('customer_name', ''),
            }
        )
        
        logger.info(f"Created payment intent {intent.id} for amount {amount} {currency}")
        
        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Payment intent creation error: {str(e)}")
        return Response(
            {'error': 'Payment processing failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """Handle Stripe webhooks for payment status updates"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        # Verify webhook signature
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        else:
            # For development/testing without webhook secret
            event = json.loads(payload)
            logger.warning("Processing webhook without signature verification (development mode)")
            
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    event_type = event['type']
    logger.info(f"Received Stripe webhook: {event_type}")
    
    try:
        if event_type == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            handle_payment_succeeded(payment_intent)
        elif event_type == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            handle_payment_failed(payment_intent)
        elif event_type == 'payment_intent.canceled':
            payment_intent = event['data']['object']
            handle_payment_canceled(payment_intent)
        elif event_type == 'checkout.session.completed':
            session = event['data']['object']
            handle_checkout_session_completed(session)
        else:
            logger.info(f"Unhandled event type: {event_type}")
    
    except Exception as e:
        logger.error(f"Error processing webhook event {event_type}: {str(e)}")
        return JsonResponse({'error': 'Webhook processing failed'}, status=500)
    
    return JsonResponse({'status': 'success'})

def handle_payment_succeeded(payment_intent):
    """Handle successful payment"""
    try:
        payment_id = payment_intent['id']
        amount = payment_intent['amount'] / 100  # Convert from cents
        currency = payment_intent['currency'].upper()
        metadata = payment_intent.get('metadata', {})
        
        logger.info(f"Processing successful payment: {payment_id}")
        
        # Try to find the order by payment intent ID first
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_id)
            order = payment.order
        except Payment.DoesNotExist:
            # If no payment record exists, try to find by order_id in metadata
            order_id = metadata.get('order_id')
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                except Order.DoesNotExist:
                    logger.error(f"Order not found for payment {payment_id}")
                    return
            else:
                logger.error(f"No order_id found in metadata for payment {payment_id}")
                return
        
        # Update order status to paid
        order.status = 'paid'
        order.save()
        
        # Create or update payment record
        payment, created = Payment.objects.get_or_create(
            stripe_payment_intent_id=payment_id,
            defaults={
                'order': order,
                'amount': amount,
                'currency': currency,
                'status': 'completed'
            }
        )
        
        if not created:
            payment.status = 'completed'
            payment.save()
        
        logger.info(f"Payment succeeded for order {order.id}")
        
    except Exception as e:
        logger.error(f"Error handling payment success: {str(e)}")

def handle_payment_failed(payment_intent):
    """Handle failed payment"""
    try:
        payment_id = payment_intent['id']
        amount = payment_intent['amount'] / 100  # Convert from cents
        currency = payment_intent['currency'].upper()
        metadata = payment_intent.get('metadata', {})
        
        logger.info(f"Processing failed payment: {payment_id}")
        
        # Try to find the order by payment intent ID first
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_id)
            order = payment.order
        except Payment.DoesNotExist:
            # If no payment record exists, try to find by order_id in metadata
            order_id = metadata.get('order_id')
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                except Order.DoesNotExist:
                    logger.error(f"Order not found for payment {payment_id}")
                    return
            else:
                logger.error(f"No order_id found in metadata for payment {payment_id}")
                return
        
        # Update order status to payment_failed
        order.status = 'payment_failed'
        order.save()
        
        # Create or update payment record
        payment, created = Payment.objects.get_or_create(
            stripe_payment_intent_id=payment_id,
            defaults={
                'order': order,
                'amount': amount,
                'currency': currency,
                'status': 'failed'
            }
        )
        
        if not created:
            payment.status = 'failed'
            payment.save()
        
        logger.info(f"Payment failed for order {order.id}")
        
    except Exception as e:
        logger.error(f"Error handling payment failure: {str(e)}")

def handle_payment_canceled(payment_intent):
    """Handle canceled payment"""
    try:
        payment_id = payment_intent['id']
        amount = payment_intent['amount'] / 100  # Convert from cents
        currency = payment_intent['currency'].upper()
        metadata = payment_intent.get('metadata', {})
        
        logger.info(f"Processing canceled payment: {payment_id}")
        
        # Try to find the order by payment intent ID first
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_id)
            order = payment.order
        except Payment.DoesNotExist:
            # If no payment record exists, try to find by order_id in metadata
            order_id = metadata.get('order_id')
            if order_id:
                try:
                    order = Order.objects.get(id=order_id)
                except Order.DoesNotExist:
                    logger.error(f"Order not found for payment {payment_id}")
                    return
            else:
                logger.error(f"No order_id found in metadata for payment {payment_id}")
                return
        
        # Update order status to cancelled
        order.status = 'cancelled'
        order.save()
        
        # Create or update payment record
        payment, created = Payment.objects.get_or_create(
            stripe_payment_intent_id=payment_id,
            defaults={
                'order': order,
                'amount': amount,
                'currency': currency,
                'status': 'cancelled'
            }
        )
        
        if not created:
            payment.status = 'cancelled'
            payment.save()
        
        logger.info(f"Payment canceled for order {order.id}")
        
    except Exception as e:
        logger.error(f"Error handling payment cancellation: {str(e)}")

def handle_checkout_session_completed(session):
    """Handle successful checkout session completion - IDEMPOTENT"""
    try:
        import uuid
        from .models import Product, OrderItem
        from django.contrib.auth.models import User
        
        session_id = session['id']
        payment_intent_id = session['payment_intent']
        amount_total = session['amount_total'] / 100  # Convert from cents
        currency = session['currency'].upper()
        customer_email = session.get('customer_email', '')
        metadata = session.get('metadata', {})
        
        logger.info(f"🔄 Processing completed checkout session: {session_id}")
        logger.info(f"📧 Customer email: {customer_email}")
        logger.info(f"💰 Amount: {amount_total} {currency}")
        logger.info(f"🔑 Payment intent: {payment_intent_id}")
        logger.info(f"📋 Metadata: {metadata}")
        logger.info(f"📋 Full session data: {json.dumps(session, indent=2, default=str)}")
        
        # Extract order_id from metadata (this is the key for idempotency)
        order_id = metadata.get('order_id')
        user_id = metadata.get('user_id', 'guest')
        
        if not order_id:
            logger.error(f"No order_id found in metadata for session {session_id}")
            return
        
        # IDEMPOTENT: Find existing order by order_id from metadata
        try:
            order = Order.objects.get(id=order_id)
            logger.info(f"✅ Found existing order {order.id} from metadata")
            
            # Extract payment status from session - try multiple sources
            session_payment_status = session.get('payment_status', '')
            payment_intent_status = session.get('payment_intent', {}).get('status', '') if isinstance(session.get('payment_intent'), dict) else ''
            
            logger.info(f"💳 Session payment_status: {session_payment_status}")
            logger.info(f"💳 Payment intent status: {payment_intent_status}")
            
            # Determine payment status from multiple sources
            if session_payment_status == 'paid':
                payment_status = 'paid'
            elif payment_intent_status == 'succeeded':
                payment_status = 'paid'
            elif session_payment_status == 'unpaid':
                payment_status = 'unpaid'
            elif payment_intent_status in ['requires_payment_method', 'requires_confirmation', 'requires_action']:
                payment_status = 'unpaid'
            elif payment_intent_status == 'canceled':
                payment_status = 'failed'
            elif payment_intent_status == 'payment_failed':
                payment_status = 'failed'
            else:
                # For checkout.session.completed, payment was definitely successful
                # User only reaches this webhook if payment completed successfully
                payment_status = 'paid'
                logger.info(f"💳 Setting to 'paid' for completed checkout session (user reached confirmation page)")
            
            # Update order with latest session data (idempotent updates)
            order.tracking_id = session_id  # Update with actual session ID
            order.payment_id = payment_intent_id
            order.payment_status = payment_status
            order.status = 'pending'
            order.save()
            
            logger.info(f"✅ Updated existing order {order.id} with session data")
            
        except Order.DoesNotExist:
            logger.error(f"Order {order_id} from metadata not found for session {session_id}")
            return
        
        # Get line items from the session (skip for test sessions)
        line_items = None
        if not session_id.startswith('cs_test_'):
            try:
                line_items = stripe.checkout.Session.list_line_items(session_id)
            except stripe.error.StripeError as e:
                logger.error(f"Failed to fetch line items for session {session_id}: {str(e)}")
                line_items = None
        
        # Extract shipping information from session
        shipping_address = {}
        customer_name = ''
        customer_phone = ''
        
        if 'shipping_details' in session and session['shipping_details']:
            shipping_details = session['shipping_details']
            if 'address' in shipping_details:
                addr = shipping_details['address']
                shipping_address = {
                    'firstName': shipping_details.get('name', '').split(' ')[0] if shipping_details.get('name') else '',
                    'lastName': ' '.join(shipping_details.get('name', '').split(' ')[1:]) if shipping_details.get('name') and len(shipping_details.get('name', '').split(' ')) > 1 else '',
                    'address1': addr.get('line1', ''),
                    'address2': addr.get('line2', ''),
                    'city': addr.get('city', ''),
                    'state': addr.get('state', ''),
                    'postcode': addr.get('postal_code', ''),
                    'country': addr.get('country', '')
                }
                customer_name = shipping_details.get('name', '')
        
        # Extract customer information - try multiple sources
        customer_phone = ''
        if 'customer_details' in session and session['customer_details']:
            customer_details = session['customer_details']
            logger.info(f"📞 Customer details: {customer_details}")
            
            if not customer_email:
                customer_email = customer_details.get('email', '')
            if not customer_name:
                customer_name = customer_details.get('name', '')
            customer_phone = customer_details.get('phone', '')
            
            logger.info(f"📞 Extracted phone from customer_details: {customer_phone}")
        
        # Also try to get phone from shipping details if not found
        if not customer_phone and 'shipping_details' in session and session['shipping_details']:
            shipping_details = session['shipping_details']
            if 'phone' in shipping_details:
                customer_phone = shipping_details['phone']
                logger.info(f"📞 Extracted phone from shipping_details: {customer_phone}")
        
        # Also try metadata as fallback
        if not customer_phone and 'metadata' in session and session['metadata']:
            metadata_phone = session['metadata'].get('customer_phone', '')
            if metadata_phone:
                customer_phone = metadata_phone
                logger.info(f"📞 Extracted phone from metadata: {customer_phone}")
        
        # Update order with customer and shipping details
        order.customer_email = customer_email
        order.customer_phone = customer_phone
        order.shipping_address = shipping_address
        # Make sure payment status is preserved from earlier update
        order.save()
        
        logger.info(f"📞 Updated customer phone: {customer_phone}")
        logger.info(f"💳 Final payment status: {order.payment_status}")
        logger.info(f"📧 Final customer email: {order.customer_email}")
        
        # IDEMPOTENT: Only create order items if they don't exist
        existing_items_count = order.items.count()
        if existing_items_count == 0 and line_items and hasattr(line_items, 'data'):
            logger.info(f"Creating order items for order {order.id}")
            for item in line_items.data:
                try:
                    # Extract product ID from the price data metadata or name
                    product_name = item['description']
                    # Try to find product by name (this is a simple approach)
                    # In production, you might want to store product IDs in metadata
                    products = Product.objects.filter(name__icontains=product_name.split(' - ')[0])
                    if products.exists():
                        product = products.first()
                        
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=item['quantity'],
                            unit_price=item['price']['unit_amount'] / 100
                        )
                    else:
                        logger.warning(f"Product not found for line item: {product_name}")
                except Exception as e:
                    logger.error(f"Error creating order item: {str(e)}")
                    continue
        elif existing_items_count > 0:
            logger.info(f"Order {order.id} already has {existing_items_count} items, skipping item creation")
        
        # IDEMPOTENT: Create or update payment record
        payment, created = Payment.objects.get_or_create(
            stripe_payment_intent_id=payment_intent_id,
            defaults={
                'order': order,
                'amount': amount_total,
                'currency': currency,
                'status': 'completed'
            }
        )
        
        if not created:
            payment.status = 'completed'
            payment.save()
            logger.info(f"Updated existing payment record {payment.id}")
        else:
            logger.info(f"Created new payment record {payment.id}")
        
        # Send notification to admin panel via WebSocket
        send_order_notification_to_admin(order)
        
        logger.info(f"✅ Order processed successfully: {order.id}")
        logger.info(f"📦 Order details: {order.tracking_id} - {order.customer_email} - £{order.total_price}")
        logger.info(f"💳 Payment record: {payment.id}")
        
    except Exception as e:
        logger.error(f"Error handling checkout session completion: {str(e)}")

def send_order_notification_to_admin(order):
    """Send order notification to admin panel via WebSocket"""
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        from .models import OrderItem
        
        channel_layer = get_channel_layer()
        if channel_layer:
            # Get order items for the notification
            order_items = OrderItem.objects.filter(order=order)
            items_data = []
            for item in order_items:
                items_data.append({
                    'id': item.id,
                    'product_name': item.product.name if item.product else 'Deleted Product',
                    'quantity': item.quantity,
                    'unit_price': float(item.unit_price),
                    'total_price': float(item.unit_price * item.quantity)
                })
            
            # Prepare order notification data
            order_data = {
                'id': order.id,
                'tracking_id': order.tracking_id,
                'payment_id': order.payment_id,
                'customer_email': order.customer_email,
                'customer_phone': order.customer_phone,
                'customer_name': f"{order.shipping_address.get('firstName', '')} {order.shipping_address.get('lastName', '')}".strip(),
                'shipping_address': order.shipping_address,
                'subtotal': float(order.subtotal),
                'shipping_cost': float(order.shipping_cost),
                'tax_amount': float(order.tax_amount),
                'total_price': float(order.total_price),
                'status': order.status,
                'payment_status': order.payment_status,
                'payment_method': order.payment_method,
                'shipping_name': order.shipping_name,
                'created_at': order.created_at.isoformat(),
                'items': items_data
            }
            
            # Send notification to admin chat group
            async_to_sync(channel_layer.group_send)(
                'admin_chat',
                {
                    'type': 'new_order_notification',
                    'order': order_data,
                    'message': f'New order #{order.id} received from {order.customer_email}',
                    'timestamp': order.created_at.isoformat()
                }
            )
            
            logger.info(f"Order notification sent to admin panel for order {order.id}")
            
    except Exception as e:
        logger.error(f"Error sending order notification to admin: {str(e)}")

@api_view(['GET'])
@permission_classes([AllowAny])
def get_payment_intent(request, payment_intent_id):
    """Get payment intent details"""
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        return Response({
            'id': intent.id,
            'status': intent.status,
            'amount': intent.amount,
            'currency': intent.currency,
            'client_secret': intent.client_secret,
            'payment_method': intent.payment_method,
            'metadata': intent.metadata
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error retrieving payment intent: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error retrieving payment intent: {str(e)}")
        return Response(
            {'error': 'Failed to retrieve payment intent'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

