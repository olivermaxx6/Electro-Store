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

