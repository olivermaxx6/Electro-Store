#!/usr/bin/env python3
"""
Script to fix existing orders that have Stripe session IDs but show 'unpaid' status.
These orders should have 'paid' status since they have session IDs (meaning payment was successful).
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from adminpanel.models import Order

def fix_existing_orders():
    """Fix existing orders with Stripe session IDs to have 'paid' status"""
    print("🔧 Fixing existing orders with Stripe session IDs...")
    
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

def verify_fix():
    """Verify that the fix worked"""
    print("\n🔍 Verifying the fix...")
    
    # Check for any remaining orders with Stripe session IDs that are still unpaid
    remaining_unpaid = Order.objects.filter(
        tracking_id__startswith='cs_',
        payment_status='unpaid'
    ).count()
    
    if remaining_unpaid == 0:
        print("✅ All orders with Stripe session IDs now have 'paid' status!")
    else:
        print(f"⚠️  {remaining_unpaid} orders still have 'unpaid' status despite having Stripe session IDs")
    
    # Show summary of all orders with Stripe session IDs
    paid_orders = Order.objects.filter(
        tracking_id__startswith='cs_',
        payment_status='paid'
    ).count()
    
    print(f"📊 Summary:")
    print(f"   Orders with Stripe session IDs and 'paid' status: {paid_orders}")
    print(f"   Orders with Stripe session IDs and 'unpaid' status: {remaining_unpaid}")
    
    return remaining_unpaid == 0

def main():
    """Run the fix"""
    print("🚀 Starting existing orders payment status fix...")
    print("=" * 60)
    
    # Fix existing orders
    fix_success = fix_existing_orders()
    
    # Verify the fix
    verify_success = verify_fix()
    
    print("\n" + "=" * 60)
    print("📊 Fix Results:")
    print(f"   Fix Applied: {'✅ SUCCESS' if fix_success else '❌ FAILED'}")
    print(f"   Verification: {'✅ PASS' if verify_success else '❌ FAIL'}")
    
    if fix_success and verify_success:
        print("\n🎉 All existing orders are now fixed!")
        print("   ✅ Admin orders page will show correct 'Paid' status")
        print("   ✅ No more confusion about payment status")
        return 0
    else:
        print("\n❌ Some issues remain. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
