from django.core.management.base import BaseCommand
from django.db.models import Avg, Min, Max
from adminpanel.models import Product, Category, Brand

class Command(BaseCommand):
    help = "Check product statistics and distribution"

    def handle(self, *args, **opts):
        self.stdout.write("=== PRODUCT STATISTICS ===")
        
        # Basic counts
        total_products = Product.objects.count()
        discounted = Product.objects.filter(discount_rate__gt=0)
        no_discount = Product.objects.filter(discount_rate=0)
        
        self.stdout.write(f"Total products: {total_products}")
        self.stdout.write(f"Products with discounts: {discounted.count()}")
        self.stdout.write(f"Products without discounts: {no_discount.count()}")
        
        if discounted.exists():
            avg_discount = discounted.aggregate(avg=Avg('discount_rate'))['avg']
            min_discount = discounted.aggregate(min=Min('discount_rate'))['min']
            max_discount = discounted.aggregate(max=Max('discount_rate'))['max']
            
            self.stdout.write(f"Average discount rate: {avg_discount:.1f}%")
            self.stdout.write(f"Discount range: {min_discount:.1f}% - {max_discount:.1f}%")
        
        # Category distribution
        self.stdout.write("\n=== CATEGORY DISTRIBUTION ===")
        for category in Category.objects.all():
            count = Product.objects.filter(category=category).count()
            if count > 0:
                self.stdout.write(f"  {category}: {count} products")
        
        # Brand distribution
        self.stdout.write("\n=== BRAND DISTRIBUTION ===")
        for brand in Brand.objects.all():
            count = Product.objects.filter(brand=brand).count()
            if count > 0:
                self.stdout.write(f"  {brand}: {count} products")
        
        # Price range
        self.stdout.write("\n=== PRICE STATISTICS ===")
        price_stats = Product.objects.aggregate(
            min_price=Min('price'),
            max_price=Max('price'),
            avg_price=Avg('price')
        )
        self.stdout.write(f"Price range: £{price_stats['min_price']:.2f} - £{price_stats['max_price']:.2f}")
        self.stdout.write(f"Average price: £{price_stats['avg_price']:.2f}")
        
        self.stdout.write("\n=== SUMMARY ===")
        self.stdout.write(f"✅ Total products: {total_products} (target: 80+)")
        self.stdout.write(f"✅ Categories covered: {Category.objects.count()}")
        self.stdout.write(f"✅ Brands covered: {Brand.objects.count()}")
        self.stdout.write(f"✅ Discounted products: {discounted.count()} (for 'Only discounted' filter)")
        
        if total_products >= 80:
            self.stdout.write(self.style.SUCCESS("🎉 SUCCESS: Target of 80+ products achieved!"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️  Target not met: {total_products}/80 products"))
