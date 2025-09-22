#!/usr/bin/env python3
"""
Test script for Stripe payment integration with test card
This script simulates a complete payment flow and prints all Stripe responses
"""

import os
import sys
import django
import json
import stripe
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from adminpanel.models import Order, Payment
from adminpanel.id_generators import generate_unique_tracking_id, StoreSettings

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def test_stripe_payment():
    """Test complete Stripe payment flow with test card"""
    print("🧪 Testing Stripe Payment Integration")
    print("=" * 50)
    
    # Test card details
    test_card = {
        "number": "4242424242424242",  # Successful test card
        "exp_month": 12,
        "exp_year": 2025,
        "cvc": "123"
    }
    
    amount = 2500  # £25.00 in pence
    currency = "gbp"
    
    print(f"💳 Test Card: {test_card['number'][:4]} **** **** {test_card['number'][-4:]}")
    print(f"💰 Amount: £{amount/100:.2f} {currency.upper()}")
    print(f"📅 Expiry: {test_card['exp_month']:02d}/{test_card['exp_year']}")
    print()
    
    try:
        # Step 1: Create Payment Intent
        print("🔄 Step 1: Creating Payment Intent...")
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'test': 'true',
                'customer_email': 'test@example.com',
                'customer_name': 'Test Customer'
            }
        )
        
        print("✅ Payment Intent Created:")
        print(f"   ID: {payment_intent.id}")
        print(f"   Amount: {payment_intent.amount}")
        print(f"   Currency: {payment_intent.currency}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Client Secret: {payment_intent.client_secret}")
        print()
        
        # Step 2: Create Payment Method
        print("🔄 Step 2: Creating Payment Method...")
        payment_method = stripe.PaymentMethod.create(
            type='card',
            card=test_card,
            billing_details={
                'name': 'Test Customer',
                'email': 'test@example.com'
            }
        )
        
        print("✅ Payment Method Created:")
        print(f"   ID: {payment_method.id}")
        print(f"   Type: {payment_method.type}")
        print(f"   Card Last4: ****{payment_method.card.last4}")
        print(f"   Card Brand: {payment_method.card.brand}")
        print(f"   Card Exp Month: {payment_method.card.exp_month}")
        print(f"   Card Exp Year: {payment_method.card.exp_year}")
        print()
        
        # Step 3: Confirm Payment
        print("🔄 Step 3: Confirming Payment...")
        confirmed_payment = stripe.PaymentIntent.confirm(
            payment_intent.id,
            payment_method=payment_method.id
        )
        
        print("✅ Payment Confirmation Response:")
        print(f"   ID: {confirmed_payment.id}")
        print(f"   Amount: {confirmed_payment.amount}")
        print(f"   Currency: {confirmed_payment.currency}")
        print(f"   Status: {confirmed_payment.status}")
        print(f"   Payment Method: {confirmed_payment.payment_method}")
        print(f"   Charges Count: {len(confirmed_payment.charges.data) if confirmed_payment.charges else 0}")
        
        if confirmed_payment.charges and confirmed_payment.charges.data:
            charge = confirmed_payment.charges.data[0]
            print(f"   Charge ID: {charge.id}")
            print(f"   Charge Status: {charge.status}")
            print(f"   Charge Amount: {charge.amount}")
            print(f"   Charge Currency: {charge.currency}")
            print(f"   Receipt URL: {charge.receipt_url}")
        
        print()
        
        # Step 4: Create Order in Database
        print("🔄 Step 4: Creating Order in Database...")
        order = Order.objects.create(
            user=None,
            tracking_id=generate_unique_tracking_id(),
            payment_id=confirmed_payment.id,
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
        
        print("✅ Order Created:")
        print(f"   Order ID: {order.id}")
        print(f"   Tracking ID: {order.tracking_id}")
        print(f"   Payment ID: {order.payment_id}")
        print(f"   Total: £{order.total_price}")
        print(f"   Status: {order.status}")
        print(f"   Payment Status: {order.payment_status}")
        print()
        
        # Step 5: Create Payment Record
        print("🔄 Step 5: Creating Payment Record...")
        payment_record = Payment.objects.create(
            order=order,
            stripe_payment_intent_id=confirmed_payment.id,
            amount=25.00,
            currency='GBP',
            status='completed'
        )
        
        print("✅ Payment Record Created:")
        print(f"   Payment Record ID: {payment_record.id}")
        print(f"   Stripe Payment Intent: {payment_record.stripe_payment_intent_id}")
        print(f"   Amount: £{payment_record.amount}")
        print(f"   Currency: {payment_record.currency}")
        print(f"   Status: {payment_record.status}")
        print()
        
        # Step 6: Simulate Webhook
        print("🔄 Step 6: Simulating Webhook Processing...")
        from adminpanel.views_stripe import handle_payment_succeeded
        
        webhook_data = {
            'id': confirmed_payment.id,
            'amount': confirmed_payment.amount,
            'currency': confirmed_payment.currency,
            'metadata': {
                'order_id': str(order.id)
            }
        }
        
        handle_payment_succeeded(webhook_data)
        
        # Refresh order from database
        order.refresh_from_db()
        payment_record.refresh_from_db()
        
        print("✅ Webhook Processing Complete:")
        print(f"   Order Status: {order.status}")
        print(f"   Payment Record Status: {payment_record.status}")
        print()
        
        # Final Summary
        print("🎉 PAYMENT TEST COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print(f"✅ Payment Intent: {confirmed_payment.id}")
        print(f"✅ Payment Method: {payment_method.id}")
        print(f"✅ Order Created: {order.tracking_id}")
        print(f"✅ Payment Record: {payment_record.id}")
        print(f"✅ Amount: £{amount/100:.2f} {currency.upper()}")
        print(f"✅ Status: {confirmed_payment.status.upper()}")
        print()
        
        return {
            'success': True,
            'payment_intent': confirmed_payment,
            'payment_method': payment_method,
            'order': order,
            'payment_record': payment_record
        }
        
    except stripe.error.CardError as e:
        print("❌ Card Error:")
        print(f"   Code: {e.code}")
        print(f"   Message: {e.user_message}")
        print(f"   Decline Code: {e.decline_code}")
        return {'success': False, 'error': str(e), 'type': 'card_error'}
        
    except stripe.error.StripeError as e:
        print("❌ Stripe Error:")
        print(f"   Type: {e.__class__.__name__}")
        print(f"   Message: {str(e)}")
        return {'success': False, 'error': str(e), 'type': 'stripe_error'}
        
    except Exception as e:
        print("❌ General Error:")
        print(f"   Type: {e.__class__.__name__}")
        print(f"   Message: {str(e)}")
        return {'success': False, 'error': str(e), 'type': 'general_error'}

def test_failed_payment():
    """Test failed payment with declined card"""
    print("\n" + "=" * 50)
    print("🧪 Testing Failed Payment (Declined Card)")
    print("=" * 50)
    
    # Declined test card
    test_card = {
        "number": "4000000000000002",  # Declined test card
        "exp_month": 12,
        "exp_year": 2025,
        "cvc": "123"
    }
    
    amount = 1500  # £15.00 in pence
    currency = "gbp"
    
    print(f"💳 Declined Test Card: {test_card['number'][:4]} **** **** {test_card['number'][-4:]}")
    print(f"💰 Amount: £{amount/100:.2f} {currency.upper()}")
    print()
    
    try:
        # Create Payment Intent
        print("🔄 Creating Payment Intent for declined card...")
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={'test': 'declined'}
        )
        
        # Create Payment Method
        print("🔄 Creating Payment Method...")
        payment_method = stripe.PaymentMethod.create(
            type='card',
            card=test_card,
            billing_details={'name': 'Test Customer'}
        )
        
        # Try to confirm payment (this should fail)
        print("🔄 Attempting to confirm payment (should fail)...")
        confirmed_payment = stripe.PaymentIntent.confirm(
            payment_intent.id,
            payment_method=payment_method.id
        )
        
        print("❌ Unexpected: Payment should have been declined!")
        
    except stripe.error.CardError as e:
        print("✅ Card Declined (Expected):")
        print(f"   Code: {e.code}")
        print(f"   Message: {e.user_message}")
        print(f"   Decline Code: {e.decline_code}")
        print(f"   Payment Intent ID: {e.payment_intent['id']}")
        print(f"   Payment Intent Status: {e.payment_intent['status']}")
        
        return {
            'success': True,
            'error': str(e),
            'type': 'card_declined',
            'payment_intent_id': e.payment_intent['id']
        }

if __name__ == "__main__":
    print("🚀 Starting Stripe Payment Tests")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test successful payment
    result1 = test_stripe_payment()
    
    # Test failed payment
    result2 = test_failed_payment()
    
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"✅ Successful Payment Test: {'PASSED' if result1.get('success') else 'FAILED'}")
    print(f"✅ Failed Payment Test: {'PASSED' if result2.get('success') else 'FAILED'}")
    print()
    print("🎯 All tests completed!")


