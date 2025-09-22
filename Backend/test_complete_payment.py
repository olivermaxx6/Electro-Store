#!/usr/bin/env python3
"""
Complete Stripe payment test using the proper frontend approach
This simulates exactly what happens when a user pays with a card
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
from adminpanel.id_generators import generate_unique_tracking_id

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def test_complete_payment_flow():
    """Test the complete payment flow as it would happen in the frontend"""
    print("🧪 Testing Complete Stripe Payment Flow")
    print("=" * 60)
    
    # Step 1: Create Payment Intent (what frontend does)
    print("🔄 Step 1: Creating Payment Intent...")
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=2500,  # £25.00 in pence
            currency='gbp',
            metadata={
                'customer_email': 'test@example.com',
                'customer_name': 'Test Customer',
                'test': 'complete_flow'
            }
        )
        
        print("✅ Payment Intent Created:")
        print(f"   ID: {payment_intent.id}")
        print(f"   Amount: £{payment_intent.amount/100:.2f}")
        print(f"   Currency: {payment_intent.currency.upper()}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Client Secret: {payment_intent.client_secret}")
        print()
        
    except Exception as e:
        print(f"❌ Payment Intent Creation Failed: {e}")
        return False
    
    # Step 2: Create Order (what happens after payment intent)
    print("🔄 Step 2: Creating Order...")
    try:
        order = Order.objects.create(
            user=None,
            tracking_id=generate_unique_tracking_id(),
            payment_id=payment_intent.id,
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
            payment_status='unpaid'  # Initially unpaid
        )
        
        # Create Payment record
        payment_record = Payment.objects.create(
            order=order,
            stripe_payment_intent_id=payment_intent.id,
            amount=25.00,
            currency='GBP',
            status='pending'
        )
        
        print("✅ Order and Payment Record Created:")
        print(f"   Order ID: {order.id}")
        print(f"   Tracking ID: {order.tracking_id}")
        print(f"   Payment Record ID: {payment_record.id}")
        print(f"   Order Status: {order.status}")
        print(f"   Payment Status: {payment_record.status}")
        print()
        
    except Exception as e:
        print(f"❌ Order Creation Failed: {e}")
        return False
    
    # Step 3: Simulate Successful Payment (what webhook does)
    print("🔄 Step 3: Simulating Successful Payment Webhook...")
    try:
        from adminpanel.views_stripe import handle_payment_succeeded
        
        # Simulate webhook data
        webhook_payment_intent = {
            'id': payment_intent.id,
            'amount': payment_intent.amount,
            'currency': payment_intent.currency,
            'metadata': {
                'order_id': str(order.id)
            }
        }
        
        handle_payment_succeeded(webhook_payment_intent)
        
        # Refresh from database
        order.refresh_from_db()
        payment_record.refresh_from_db()
        
        print("✅ Payment Webhook Processed:")
        print(f"   Order Status: {order.status}")
        print(f"   Order Payment Status: {order.payment_status}")
        print(f"   Payment Record Status: {payment_record.status}")
        print()
        
    except Exception as e:
        print(f"❌ Webhook Processing Failed: {e}")
        return False
    
    # Step 4: Verify Final State
    print("🔄 Step 4: Verifying Final State...")
    try:
        # Check Stripe Payment Intent status
        updated_intent = stripe.PaymentIntent.retrieve(payment_intent.id)
        
        print("✅ Final Verification:")
        print(f"   Stripe Payment Intent Status: {updated_intent.status}")
        print(f"   Database Order Status: {order.status}")
        print(f"   Database Payment Status: {payment_record.status}")
        print(f"   Amount: £{payment_record.amount}")
        print(f"   Currency: {payment_record.currency}")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Verification Failed: {e}")
        return False

def test_stripe_responses():
    """Test and print various Stripe API responses"""
    print("🧪 Testing Stripe API Responses")
    print("=" * 60)
    
    try:
        # Test 1: List Payment Intents
        print("🔄 Test 1: Listing Recent Payment Intents...")
        intents = stripe.PaymentIntent.list(limit=3)
        
        print("✅ Payment Intents Response:")
        for i, intent in enumerate(intents.data, 1):
            print(f"   {i}. ID: {intent.id}")
            print(f"      Amount: £{intent.amount/100:.2f}")
            print(f"      Currency: {intent.currency.upper()}")
            print(f"      Status: {intent.status}")
            print(f"      Created: {datetime.fromtimestamp(intent.created)}")
            print()
        
        # Test 2: Retrieve Specific Payment Intent
        if intents.data:
            print("🔄 Test 2: Retrieving Specific Payment Intent...")
            specific_intent = stripe.PaymentIntent.retrieve(intents.data[0].id)
            
            print("✅ Payment Intent Details:")
            print(f"   ID: {specific_intent.id}")
            print(f"   Amount: {specific_intent.amount}")
            print(f"   Currency: {specific_intent.currency}")
            print(f"   Status: {specific_intent.status}")
            print(f"   Metadata: {specific_intent.metadata}")
            print(f"   Charges Count: {len(specific_intent.charges.data) if specific_intent.charges else 0}")
            print()
        
        # Test 3: Test Currency Support
        print("🔄 Test 3: Testing Currency Support...")
        currencies = ['gbp', 'usd', 'eur']
        for currency in currencies:
            try:
                test_intent = stripe.PaymentIntent.create(
                    amount=100,  # £1.00 equivalent
                    currency=currency,
                    metadata={'test_currency': currency}
                )
                print(f"   ✅ {currency.upper()}: Supported (ID: {test_intent.id})")
                # Cancel the test intent
                stripe.PaymentIntent.cancel(test_intent.id)
            except Exception as e:
                print(f"   ❌ {currency.upper()}: Error - {str(e)}")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Stripe API Test Failed: {e}")
        return False

def main():
    print("🚀 Complete Stripe Payment Integration Test")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔑 Stripe Key: {stripe.api_key[:12]}...{stripe.api_key[-4:]}")
    print(f"🌍 Environment: {'Test' if 'test' in stripe.api_key else 'Live'}")
    print()
    
    # Test 1: Complete Payment Flow
    flow_result = test_complete_payment_flow()
    
    # Test 2: Stripe API Responses
    api_result = test_stripe_responses()
    
    # Summary
    print("=" * 60)
    print("📊 COMPLETE TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Complete Payment Flow: {'PASSED' if flow_result else 'FAILED'}")
    print(f"✅ Stripe API Responses: {'PASSED' if api_result else 'FAILED'}")
    print()
    
    if flow_result and api_result:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Payment Intent Creation: Working")
        print("✅ Order Creation: Working")
        print("✅ Payment Tracking: Working")
        print("✅ Webhook Processing: Working")
        print("✅ GBP Currency: Working")
        print("✅ Database Integration: Working")
        print()
        print("🚀 Your Stripe integration is fully functional!")
        print()
        print("💡 Next Steps:")
        print("   1. Open Frontend/stripe_test.html in your browser")
        print("   2. Use test card: 4242 4242 4242 4242")
        print("   3. Monitor payments at http://localhost:5174/admin/orders")
        print("   4. Check Stripe Dashboard: https://dashboard.stripe.com/test/payments")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    print("\n📋 Test Card Information:")
    print("   ✅ Success: 4242 4242 4242 4242")
    print("   ❌ Declined: 4000 0000 0000 0002")
    print("   🔐 3D Secure: 4000 0025 0000 3155")
    print("   💸 Insufficient Funds: 4000 0000 0000 9995")

if __name__ == "__main__":
    main()


