#!/usr/bin/env python3
"""
Comprehensive test script for all Stripe test cards
Tests payment integration with various card types and scenarios
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

# Test card configurations
TEST_CARDS = {
    'successful': [
        {'number': '4242424242424242', 'brand': 'Visa', 'type': 'Successful'},
        {'number': '4000056655665556', 'brand': 'Visa (Debit)', 'type': 'Successful'},
        {'number': '5555555555554444', 'brand': 'Mastercard', 'type': 'Successful'},
        {'number': '2223003122003222', 'brand': 'Mastercard (2-series)', 'type': 'Successful'},
        {'number': '5200828282828210', 'brand': 'Mastercard (Debit)', 'type': 'Successful'},
        {'number': '5105105105105100', 'brand': 'Mastercard (Prepaid)', 'type': 'Successful'},
        {'number': '378282246310005', 'brand': 'American Express', 'type': 'Successful'},
        {'number': '371449635398431', 'brand': 'American Express', 'type': 'Successful'},
        {'number': '6011111111111117', 'brand': 'Discover', 'type': 'Successful'},
        {'number': '6011000990139424', 'brand': 'Discover', 'type': 'Successful'},
        {'number': '6011981111111113', 'brand': 'Discover (Debit)', 'type': 'Successful'},
        {'number': '3056930009020004', 'brand': 'Diners Club', 'type': 'Successful'},
        {'number': '36227206271667', 'brand': 'Diners Club (14-digit)', 'type': 'Successful'},
        {'number': '6555900000604105', 'brand': 'BCcard and DinaCard', 'type': 'Successful'},
        {'number': '3566002020360505', 'brand': 'JCB', 'type': 'Successful'},
        {'number': '6200000000000005', 'brand': 'UnionPay', 'type': 'Successful'},
        {'number': '6200000000000047', 'brand': 'UnionPay (Debit)', 'type': 'Successful'},
        {'number': '6205500000000000004', 'brand': 'UnionPay (19-digit)', 'type': 'Successful'},
    ],
    'declined': [
        {'number': '4000000000000002', 'brand': 'Generic Decline', 'type': 'Declined'},
        {'number': '4000000000009995', 'brand': 'Insufficient Funds', 'type': 'Declined'},
        {'number': '4000000000009987', 'brand': 'Lost Card', 'type': 'Declined'},
        {'number': '4000000000009979', 'brand': 'Stolen Card', 'type': 'Declined'},
        {'number': '4000000000000069', 'brand': 'Expired Card', 'type': 'Declined'},
        {'number': '4000000000000127', 'brand': 'Incorrect CVC', 'type': 'Declined'},
        {'number': '4000000000000119', 'brand': 'Processing Error', 'type': 'Declined'},
    ],
    '3d_secure': [
        {'number': '4000002500003155', 'brand': '3D Secure Required', 'type': '3D Secure'},
        {'number': '4000008400001629', 'brand': '3D Secure Auth Failed', 'type': '3D Secure'},
    ]
}

def test_card_payment(card_info, amount=2500, currency='gbp'):
    """Test payment with a specific card"""
    print(f"\n🧪 Testing {card_info['brand']} - {card_info['number'][:4]} **** **** {card_info['number'][-4:]}")
    print("-" * 60)
    
    try:
        # Step 1: Create Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'test_card': card_info['number'],
                'card_brand': card_info['brand'],
                'test_type': card_info['type'],
                'customer_email': 'test@example.com',
                'customer_name': 'Test Customer'
            }
        )
        
        print(f"✅ Payment Intent Created: {payment_intent.id}")
        
        # Step 2: Create Payment Method
        payment_method = stripe.PaymentMethod.create(
            type='card',
            card={
                'number': card_info['number'],
                'exp_month': 12,
                'exp_year': 2025,
                'cvc': '123'
            },
            billing_details={
                'name': 'Test Customer',
                'email': 'test@example.com'
            }
        )
        
        print(f"✅ Payment Method Created: {payment_method.id}")
        print(f"   Brand: {payment_method.card.brand}")
        print(f"   Last4: {payment_method.card.last4}")
        
        # Step 3: Confirm Payment
        confirmed_payment = stripe.PaymentIntent.confirm(
            payment_intent.id,
            payment_method=payment_method.id
        )
        
        print(f"✅ Payment Confirmed: {confirmed_payment.status}")
        print(f"   Amount: {confirmed_payment.amount} {confirmed_payment.currency.upper()}")
        
        if confirmed_payment.charges and confirmed_payment.charges.data:
            charge = confirmed_payment.charges.data[0]
            print(f"   Charge ID: {charge.id}")
            print(f"   Receipt URL: {charge.receipt_url}")
        
        return {
            'success': True,
            'card': card_info,
            'payment_intent': confirmed_payment,
            'payment_method': payment_method,
            'status': confirmed_payment.status
        }
        
    except stripe.error.CardError as e:
        print(f"❌ Card Error: {e.user_message}")
        print(f"   Code: {e.code}")
        print(f"   Decline Code: {e.decline_code}")
        return {
            'success': False,
            'card': card_info,
            'error': str(e),
            'error_type': 'card_error',
            'decline_code': e.decline_code
        }
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe Error: {str(e)}")
        return {
            'success': False,
            'card': card_info,
            'error': str(e),
            'error_type': 'stripe_error'
        }
        
    except Exception as e:
        print(f"❌ General Error: {str(e)}")
        return {
            'success': False,
            'card': card_info,
            'error': str(e),
            'error_type': 'general_error'
        }

def test_order_creation(payment_result):
    """Test order creation with payment result"""
    if not payment_result['success']:
        return None
    
    try:
        print("🔄 Creating Order...")
        
        order = Order.objects.create(
            user=None,
            tracking_id=generate_unique_tracking_id(),
            payment_id=payment_result['payment_intent'].id,
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
        
        print(f"✅ Order Created: {order.tracking_id}")
        
        # Create Payment Record
        payment_record = Payment.objects.create(
            order=order,
            stripe_payment_intent_id=payment_result['payment_intent'].id,
            amount=25.00,
            currency='GBP',
            status='completed'
        )
        
        print(f"✅ Payment Record Created: {payment_record.id}")
        
        return {
            'order': order,
            'payment_record': payment_record
        }
        
    except Exception as e:
        print(f"❌ Order Creation Error: {str(e)}")
        return None

def run_comprehensive_tests():
    """Run comprehensive tests for all card types"""
    print("🚀 Starting Comprehensive Stripe Card Tests")
    print("=" * 80)
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"💰 Test Amount: £25.00 GBP")
    print()
    
    results = {
        'successful': [],
        'declined': [],
        '3d_secure': [],
        'summary': {
            'total_tests': 0,
            'successful': 0,
            'failed': 0,
            'declined': 0
        }
    }
    
    # Test successful cards
    print("🟢 TESTING SUCCESSFUL PAYMENTS")
    print("=" * 50)
    for card in TEST_CARDS['successful']:
        result = test_card_payment(card)
        results['successful'].append(result)
        results['summary']['total_tests'] += 1
        
        if result['success']:
            results['summary']['successful'] += 1
            # Test order creation for successful payments
            order_result = test_order_creation(result)
            if order_result:
                result['order'] = order_result['order']
                result['payment_record'] = order_result['payment_record']
        else:
            results['summary']['failed'] += 1
    
    # Test declined cards
    print("\n🔴 TESTING DECLINED PAYMENTS")
    print("=" * 50)
    for card in TEST_CARDS['declined']:
        result = test_card_payment(card)
        results['declined'].append(result)
        results['summary']['total_tests'] += 1
        
        if result['success']:
            results['summary']['successful'] += 1
        else:
            results['summary']['declined'] += 1
    
    # Test 3D Secure cards
    print("\n🔐 TESTING 3D SECURE PAYMENTS")
    print("=" * 50)
    for card in TEST_CARDS['3d_secure']:
        result = test_card_payment(card)
        results['3d_secure'].append(result)
        results['summary']['total_tests'] += 1
        
        if result['success']:
            results['summary']['successful'] += 1
        else:
            results['summary']['failed'] += 1
    
    # Print summary
    print("\n📊 TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {results['summary']['total_tests']}")
    print(f"Successful: {results['summary']['successful']}")
    print(f"Declined (Expected): {results['summary']['declined']}")
    print(f"Failed: {results['summary']['failed']}")
    print()
    
    # Detailed results
    print("📋 DETAILED RESULTS")
    print("=" * 80)
    
    print("\n✅ SUCCESSFUL PAYMENTS:")
    for result in results['successful']:
        if result['success']:
            print(f"  {result['card']['brand']}: {result['status']}")
        else:
            print(f"  {result['card']['brand']}: FAILED - {result['error']}")
    
    print("\n❌ DECLINED PAYMENTS:")
    for result in results['declined']:
        if not result['success']:
            print(f"  {result['card']['brand']}: DECLINED - {result.get('decline_code', 'Unknown')}")
        else:
            print(f"  {result['card']['brand']}: UNEXPECTED SUCCESS")
    
    print("\n🔐 3D SECURE PAYMENTS:")
    for result in results['3d_secure']:
        if result['success']:
            print(f"  {result['card']['brand']}: {result['status']}")
        else:
            print(f"  {result['card']['brand']}: FAILED - {result['error']}")
    
    # Save results to file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'stripe_test_results_{timestamp}.json'
    
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to: {filename}")
    print("\n🎯 All tests completed!")
    
    return results

if __name__ == "__main__":
    results = run_comprehensive_tests()
