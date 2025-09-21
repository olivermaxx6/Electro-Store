#!/usr/bin/env python3
"""
Script to cancel incomplete payment intents in Stripe
This will clean up the incomplete payments showing in your dashboard
"""

import os
import sys
import django
import stripe
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def cancel_incomplete_payments():
    """Cancel all incomplete payment intents"""
    print("🧹 Canceling Incomplete Payment Intents")
    print("=" * 50)
    
    try:
        # Get payment intents from the last 24 hours
        yesterday = datetime.now() - timedelta(days=1)
        timestamp = int(yesterday.timestamp())
        
        print(f"📅 Looking for payment intents created after: {yesterday.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # List payment intents
        payment_intents = stripe.PaymentIntent.list(
            limit=100,
            created={'gte': timestamp}
        )
        
        print(f"📊 Found {len(payment_intents.data)} payment intents")
        print()
        
        cancelled_count = 0
        skipped_count = 0
        
        for pi in payment_intents.data:
            print(f"🔄 Processing: {pi.id}")
            print(f"   Amount: £{pi.amount/100:.2f} {pi.currency.upper()}")
            print(f"   Status: {pi.status}")
            print(f"   Created: {datetime.fromtimestamp(pi.created).strftime('%Y-%m-%d %H:%M:%S')}")
            
            if pi.status == 'requires_payment_method':
                try:
                    cancelled = stripe.PaymentIntent.cancel(pi.id)
                    print(f"   ✅ Cancelled successfully")
                    cancelled_count += 1
                except Exception as e:
                    print(f"   ❌ Failed to cancel: {str(e)}")
            else:
                print(f"   ⏭️ Skipped (status: {pi.status})")
                skipped_count += 1
            
            print()
        
        print("📊 SUMMARY")
        print("=" * 50)
        print(f"Total Payment Intents: {len(payment_intents.data)}")
        print(f"Cancelled: {cancelled_count}")
        print(f"Skipped: {skipped_count}")
        print()
        
        if cancelled_count > 0:
            print("✅ Incomplete payments have been cancelled")
            print("💡 Your Stripe dashboard should now be cleaner")
        else:
            print("ℹ️ No incomplete payments found to cancel")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Incomplete Payment Cleanup")
    print(f"📅 Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    cancel_incomplete_payments()
    
    print("\n🎯 Cleanup completed!")
    print("💡 Now use the complete_payment_test.html to create successful payments")
