#!/usr/bin/env python3
"""
Simple Stripe test using test tokens and frontend integration approach
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

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def test_payment_intent_creation():
    """Test payment intent creation (this works without raw card data)"""
    print("🧪 Testing Stripe Payment Intent Creation")
    print("=" * 50)
    
    try:
        # Create Payment Intent
        print("🔄 Creating Payment Intent...")
        payment_intent = stripe.PaymentIntent.create(
            amount=2500,  # £25.00 in pence
            currency='gbp',
            metadata={
                'test': 'true',
                'customer_email': 'test@example.com',
                'customer_name': 'Test Customer'
            }
        )
        
        print("✅ Payment Intent Created Successfully:")
        print(f"   ID: {payment_intent.id}")
        print(f"   Amount: {payment_intent.amount} (£{payment_intent.amount/100:.2f})")
        print(f"   Currency: {payment_intent.currency.upper()}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Client Secret: {payment_intent.client_secret}")
        print(f"   Created: {datetime.fromtimestamp(payment_intent.created)}")
        print()
        
        return payment_intent
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe Error: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ General Error: {str(e)}")
        return None

def test_frontend_integration():
    """Test the frontend integration approach"""
    print("🧪 Testing Frontend Integration Approach")
    print("=" * 50)
    
    try:
        # Simulate what the frontend does
        print("🔄 Step 1: Creating Payment Intent (Frontend Request)...")
        
        # This simulates the API call the frontend makes
        import requests
        
        response = requests.post(
            'http://127.0.0.1:8001/api/public/create-payment-intent/',
            json={
                'amount': 2500,  # £25.00 in pence
                'currency': 'gbp',
                'metadata': {
                    'customer_email': 'test@example.com',
                    'customer_name': 'Test Customer'
                }
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Frontend Payment Intent Created:")
            print(f"   Payment Intent ID: {data['payment_intent_id']}")
            print(f"   Client Secret: {data['client_secret']}")
            print()
            
            # Now simulate order creation
            print("🔄 Step 2: Creating Order (Frontend Request)...")
            order_response = requests.post(
                'http://127.0.0.1:8001/api/public/orders/',
                json={
                    'cart_items': [{
                        'product_id': 1,
                        'quantity': 1,
                        'unit_price': 25.00
                    }],
                    'subtotal': 25.00,
                    'shipping_cost': 0,
                    'tax_amount': 0,
                    'total_price': 25.00,
                    'payment_id': data['payment_intent_id'],
                    'payment_intent_id': data['payment_intent_id'],
                    'currency': 'GBP',
                    'payment_method': 'credit_card',
                    'customer_email': 'test@example.com',
                    'customer_phone': '+1234567890',
                    'shipping_address': {
                        'firstName': 'Test',
                        'lastName': 'Customer',
                        'address1': '123 Test Street',
                        'city': 'Test City',
                        'state': 'Test State',
                        'postcode': 'TE1 1ST'
                    },
                    'shipping_name': 'Test Shipping'
                },
                headers={'Content-Type': 'application/json'}
            )
            
            if order_response.status_code == 201:
                order_data = order_response.json()
                print("✅ Order Created Successfully:")
                print(f"   Order ID: {order_data['order_id']}")
                print(f"   Tracking ID: {order_data['tracking_id']}")
                print(f"   Payment ID: {order_data['payment_id']}")
                print()
                
                # Check database records
                print("🔄 Step 3: Checking Database Records...")
                order = Order.objects.get(id=order_data['order_id'])
                payment_record = Payment.objects.filter(stripe_payment_intent_id=data['payment_intent_id']).first()
                
                print("✅ Database Records:")
                print(f"   Order Status: {order.status}")
                print(f"   Order Payment Status: {order.payment_status}")
                print(f"   Order Total: £{order.total_price}")
                print(f"   Payment Record Status: {payment_record.status if payment_record else 'Not found'}")
                print(f"   Payment Record Amount: £{payment_record.amount if payment_record else 'N/A'}")
                print()
                
                return {
                    'payment_intent_id': data['payment_intent_id'],
                    'order_id': order_data['order_id'],
                    'tracking_id': order_data['tracking_id']
                }
            else:
                print(f"❌ Order Creation Failed: {order_response.status_code}")
                print(f"   Response: {order_response.text}")
                return None
        else:
            print(f"❌ Payment Intent Creation Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_webhook_simulation():
    """Test webhook simulation"""
    print("🧪 Testing Webhook Simulation")
    print("=" * 50)
    
    try:
        # Get a recent payment intent
        payment_intents = stripe.PaymentIntent.list(limit=1)
        if not payment_intents.data:
            print("❌ No payment intents found")
            return None
            
        payment_intent = payment_intents.data[0]
        print(f"🔄 Using Payment Intent: {payment_intent.id}")
        
        # Simulate webhook data
        webhook_data = {
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': payment_intent.id,
                    'amount': payment_intent.amount,
                    'currency': payment_intent.currency,
                    'status': 'succeeded',
                    'metadata': {
                        'test': 'true'
                    }
                }
            }
        }
        
        print("✅ Webhook Data Prepared:")
        print(json.dumps(webhook_data, indent=2))
        print()
        
        # Test webhook endpoint
        import requests
        
        webhook_response = requests.post(
            'http://127.0.0.1:8001/api/public/stripe/webhook/',
            json=webhook_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"✅ Webhook Response: {webhook_response.status_code}")
        print(f"   Response: {webhook_response.text}")
        
        return webhook_response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🚀 Starting Stripe Integration Tests")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔑 Using Stripe Key: {stripe.api_key[:12]}...{stripe.api_key[-4:]}")
    print()
    
    # Test 1: Payment Intent Creation
    payment_intent = test_payment_intent_creation()
    
    # Test 2: Frontend Integration
    frontend_result = test_frontend_integration()
    
    # Test 3: Webhook Simulation
    webhook_result = test_webhook_simulation()
    
    # Summary
    print("=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"✅ Payment Intent Creation: {'PASSED' if payment_intent else 'FAILED'}")
    print(f"✅ Frontend Integration: {'PASSED' if frontend_result else 'FAILED'}")
    print(f"✅ Webhook Simulation: {'PASSED' if webhook_result else 'FAILED'}")
    print()
    
    if payment_intent and frontend_result and webhook_result:
        print("🎉 ALL TESTS PASSED! Stripe integration is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    print("\n💡 To test actual card payments, use the frontend test page:")
    print("   Open Frontend/stripe_test.html in your browser")
    print("   Use test card: 4242 4242 4242 4242")

if __name__ == "__main__":
    main()




