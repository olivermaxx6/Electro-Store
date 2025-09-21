#!/usr/bin/env python3
"""
Complete payment flow test that actually completes payments
This simulates the full frontend-to-backend payment process
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
from adminpanel.models import Order, Payment, StoreSettings

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def complete_payment_with_test_card(card_number, amount=2500, currency='gbp'):
    """Complete a full payment flow with a test card"""
    print(f"\n🧪 Testing Complete Payment Flow")
    print(f"💳 Card: {card_number[:4]} **** **** {card_number[-4:]}")
    print(f"💰 Amount: £{amount/100:.2f} {currency.upper()}")
    print("-" * 60)
    
    try:
        # Step 1: Create Payment Intent (Backend API)
        print("🔄 Step 1: Creating Payment Intent...")
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'test_card': card_number,
                'customer_email': 'test@example.com',
                'customer_name': 'Test Customer',
                'test_timestamp': datetime.now().isoformat()
            }
        )
        
        print(f"✅ Payment Intent Created:")
        print(f"   ID: {payment_intent.id}")
        print(f"   Client Secret: {payment_intent.client_secret}")
        print(f"   Status: {payment_intent.status}")
        print()
        
        # Step 2: Create Payment Method (Frontend simulation)
        print("🔄 Step 2: Creating Payment Method...")
        print("   (Simulating frontend Stripe.js call)")
        
        # For testing, we'll use Stripe's test token approach
        # In production, this would be done by Stripe.js on the frontend
        try:
            payment_method = stripe.PaymentMethod.create(
                type='card',
                card={
                    'number': card_number,
                    'exp_month': 12,
                    'exp_year': 2025,
                    'cvc': '123'
                },
                billing_details={
                    'name': 'Test Customer',
                    'email': 'test@example.com'
                }
            )
            
            print(f"✅ Payment Method Created:")
            print(f"   ID: {payment_method.id}")
            print(f"   Brand: {payment_method.card.brand}")
            print(f"   Last4: {payment_method.card.last4}")
            print()
            
        except stripe.error.InvalidRequestError as e:
            if "raw card data APIs" in str(e):
                print("⚠️ Direct card creation blocked by Stripe (security feature)")
                print("🔄 Using alternative approach...")
                
                # Use Stripe's test token approach
                # Create a test token first
                token = stripe.Token.create(
                    card={
                        'number': card_number,
                        'exp_month': 12,
                        'exp_year': 2025,
                        'cvc': '123'
                    }
                )
                
                print(f"✅ Test Token Created: {token.id}")
                
                # Create payment method from token
                payment_method = stripe.PaymentMethod.create(
                    type='card',
                    card={
                        'token': token.id
                    },
                    billing_details={
                        'name': 'Test Customer',
                        'email': 'test@example.com'
                    }
                )
                
                print(f"✅ Payment Method Created from Token:")
                print(f"   ID: {payment_method.id}")
                print(f"   Brand: {payment_method.card.brand}")
                print(f"   Last4: {payment_method.card.last4}")
                print()
            else:
                raise e
        
        # Step 3: Confirm Payment (Frontend simulation)
        print("🔄 Step 3: Confirming Payment...")
        print(f"   Using Client Secret: {payment_intent.client_secret}")
        
        confirmed_payment = stripe.PaymentIntent.confirm(
            payment_intent.id,
            payment_method=payment_method.id
        )
        
        print(f"✅ Payment Confirmed:")
        print(f"   Status: {confirmed_payment.status}")
        print(f"   Amount: {confirmed_payment.amount}")
        print(f"   Currency: {confirmed_payment.currency}")
        print(f"   Payment Method: {confirmed_payment.payment_method}")
        
        if confirmed_payment.charges and confirmed_payment.charges.data:
            charge = confirmed_payment.charges.data[0]
            print(f"   Charge ID: {charge.id}")
            print(f"   Charge Status: {charge.status}")
            print(f"   Receipt URL: {charge.receipt_url}")
        
        print()
        
        # Step 4: Create Order (Backend)
        print("🔄 Step 4: Creating Order...")
        order = Order.objects.create(
            user=None,
            tracking_id=f"COMPLETE-{datetime.now().strftime('%Y%m%d%H%M%S')}",
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
            subtotal=amount/100,
            shipping_cost=0.00,
            tax_amount=0.00,
            total_price=amount/100,
            payment_method='credit_card',
            shipping_name='Test Shipping',
            status='pending',
            payment_status='paid'
        )
        
        print(f"✅ Order Created:")
        print(f"   Order ID: {order.id}")
        print(f"   Tracking ID: {order.tracking_id}")
        print(f"   Total: £{order.total_price}")
        print(f"   Status: {order.status}")
        print(f"   Payment Status: {order.payment_status}")
        print()
        
        # Step 5: Create Payment Record
        print("🔄 Step 5: Creating Payment Record...")
        payment_record = Payment.objects.create(
            order=order,
            stripe_payment_intent_id=confirmed_payment.id,
            amount=amount/100,
            currency='GBP',
            status='completed'
        )
        
        print(f"✅ Payment Record Created:")
        print(f"   Payment Record ID: {payment_record.id}")
        print(f"   Stripe Payment Intent: {payment_record.stripe_payment_intent_id}")
        print(f"   Amount: £{payment_record.amount}")
        print(f"   Status: {payment_record.status}")
        print()
        
        return {
            'success': True,
            'payment_intent': confirmed_payment,
            'payment_method': payment_method,
            'order': order,
            'payment_record': payment_record,
            'status': confirmed_payment.status
        }
        
    except stripe.error.CardError as e:
        print(f"❌ Card Error:")
        print(f"   Code: {e.code}")
        print(f"   Message: {e.user_message}")
        if hasattr(e, 'decline_code'):
            print(f"   Decline Code: {e.decline_code}")
        return {
            'success': False,
            'error': str(e),
            'error_type': 'card_error',
            'card': card_number
        }
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe Error:")
        print(f"   Type: {e.__class__.__name__}")
        print(f"   Message: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'error_type': 'stripe_error',
            'card': card_number
        }
        
    except Exception as e:
        print(f"❌ General Error:")
        print(f"   Type: {e.__class__.__name__}")
        print(f"   Message: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'error_type': 'general_error',
            'card': card_number
        }

def test_successful_cards():
    """Test successful payment cards"""
    print("🟢 TESTING SUCCESSFUL PAYMENT CARDS")
    print("=" * 60)
    
    successful_cards = [
        {'number': '4242424242424242', 'brand': 'Visa', 'amount': 2500},
        {'number': '5555555555554444', 'brand': 'Mastercard', 'amount': 3000},
        {'number': '378282246310005', 'brand': 'American Express', 'amount': 1500},
    ]
    
    results = []
    
    for card in successful_cards:
        result = complete_payment_with_test_card(card['number'], card['amount'])
        results.append({
            'card': card,
            'result': result
        })
    
    return results

def test_declined_cards():
    """Test declined payment cards"""
    print("\n🔴 TESTING DECLINED PAYMENT CARDS")
    print("=" * 60)
    
    declined_cards = [
        {'number': '4000000000000002', 'brand': 'Generic Decline', 'amount': 2000},
        {'number': '4000000000009995', 'brand': 'Insufficient Funds', 'amount': 1800},
    ]
    
    results = []
    
    for card in declined_cards:
        result = complete_payment_with_test_card(card['number'], card['amount'])
        results.append({
            'card': card,
            'result': result
        })
    
    return results

def cleanup_incomplete_payments():
    """Cancel any incomplete payment intents from previous tests"""
    print("\n🧹 CLEANING UP INCOMPLETE PAYMENTS")
    print("=" * 60)
    
    try:
        # Get recent payment intents
        payment_intents = stripe.PaymentIntent.list(
            limit=10,
            created={'gte': int((datetime.now().timestamp() - 3600) * 1000)}  # Last hour
        )
        
        cancelled_count = 0
        for pi in payment_intents.data:
            if pi.status == 'requires_payment_method':
                try:
                    cancelled = stripe.PaymentIntent.cancel(pi.id)
                    print(f"✅ Cancelled: {pi.id} (£{pi.amount/100:.2f})")
                    cancelled_count += 1
                except Exception as e:
                    print(f"❌ Failed to cancel {pi.id}: {str(e)}")
        
        print(f"\n📊 Cleanup Summary:")
        print(f"   Total Payment Intents Found: {len(payment_intents.data)}")
        print(f"   Cancelled: {cancelled_count}")
        
    except Exception as e:
        print(f"❌ Cleanup Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Complete Payment Flow Tests")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Clean up any incomplete payments first
    cleanup_incomplete_payments()
    
    # Test successful cards
    successful_results = test_successful_cards()
    
    # Test declined cards
    declined_results = test_declined_cards()
    
    # Summary
    print("\n📊 COMPLETE PAYMENT FLOW TEST SUMMARY")
    print("=" * 60)
    
    print("\n✅ SUCCESSFUL PAYMENTS:")
    for item in successful_results:
        card = item['card']
        result = item['result']
        if result['success']:
            print(f"   {card['brand']}: {result['status']} - Order {result['order'].tracking_id}")
        else:
            print(f"   {card['brand']}: FAILED - {result['error']}")
    
    print("\n❌ DECLINED PAYMENTS:")
    for item in declined_results:
        card = item['card']
        result = item['result']
        if not result['success']:
            print(f"   {card['brand']}: DECLINED - {result.get('error', 'Unknown error')}")
        else:
            print(f"   {card['brand']}: UNEXPECTED SUCCESS")
    
    print("\n🎯 All complete payment flow tests finished!")
    print("💡 Check your Stripe dashboard - payments should now show as 'Succeeded' with payment methods attached!")
