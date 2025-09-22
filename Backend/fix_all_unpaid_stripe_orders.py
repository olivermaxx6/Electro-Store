#!/usr/bin/env python3
"""
Fix all orders that have Stripe session IDs but are marked as unpaid.
This ensures consistency between confirmation page and admin orders page.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order

def fix_all_unpaid_stripe_orders():
    """Fix all orders with Stripe session IDs that are marked as unpaid"""
    print("🔧 Fixing all orders with Stripe session IDs marked as unpaid...")
    
    # Find orders that have Stripe session IDs but are marked as unpaid
    orders_to_fix = Order.objects.filter(
        tracking_id__startswith='cs_',  # Has Stripe session ID
        payment_status='unpaid'  # But marked as unpaid
    ).order_by('-created_at')
    
    print(f"📋 Found {orders_to_fix.count()} orders to fix:")
    
    if orders_to_fix.count() == 0:
        print("✅ No orders need fixing!")
        return True
    
    fixed_count = 0
    for order in orders_to_fix:
        print(f"\n   Order #{order.id}:")
        print(f"     Tracking ID: {order.tracking_id}")
        print(f"     Current Payment Status: '{order.payment_status}'")
        print(f"     Customer Email: {order.customer_email}")
        print(f"     Customer Phone: '{order.customer_phone}'")
        print(f"     Created: {order.created_at}")
        
        # Update the payment status to 'paid'
        order.payment_status = 'paid'
        order.save()
        
        print(f"     ✅ Updated payment status to: 'paid'")
        fixed_count += 1
    
    print(f"\n🎉 Successfully fixed {fixed_count} orders!")
    print(f"   These orders now show 'Paid' status in admin panel")
    print(f"   Admin orders page at http://localhost:5174/admin/orders will now show correct status")
    
    return True

def verify_all_orders():
    """Verify that all orders with Stripe session IDs have paid status"""
    print("\n🔍 Verifying all orders...")
    
    # Check for any remaining orders with Stripe session IDs that are still unpaid
    remaining_unpaid = Order.objects.filter(
        tracking_id__startswith='cs_',
        payment_status='unpaid'
    ).count()
    
    # Count orders with Stripe session IDs that are paid
    paid_orders = Order.objects.filter(
        tracking_id__startswith='cs_',
        payment_status='paid'
    ).count()
    
    print(f"📊 Summary:")
    print(f"   Orders with Stripe session IDs and 'paid' status: {paid_orders}")
    print(f"   Orders with Stripe session IDs and 'unpaid' status: {remaining_unpaid}")
    
    if remaining_unpaid == 0:
        print("✅ All orders with Stripe session IDs now have 'paid' status!")
        print("   ✅ Confirmation page and admin orders page will show consistent status")
        return True
    else:
        print(f"⚠️  {remaining_unpaid} orders still have 'unpaid' status despite having Stripe session IDs")
        return False

def main():
    """Run the comprehensive fix"""
    print("🚀 Starting comprehensive fix for all unpaid Stripe orders...")
    print("=" * 60)
    
    # Fix all unpaid Stripe orders
    fix_success = fix_all_unpaid_stripe_orders()
    
    # Verify the fix
    verify_success = verify_all_orders()
    
    print("\n" + "=" * 60)
    print("📊 Comprehensive Fix Results:")
    print(f"   Fix Applied: {'✅ SUCCESS' if fix_success else '❌ FAILED'}")
    print(f"   Verification: {'✅ PASS' if verify_success else '❌ FAIL'}")
    
    if fix_success and verify_success:
        print("\n🎉 All orders are now consistent!")
        print("   ✅ Confirmation page shows 'Paid' status")
        print("   ✅ Admin orders page shows 'Paid' status")
        print("   ✅ No more confusion about payment status")
        return 0
    else:
        print("\n❌ Some issues remain. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
