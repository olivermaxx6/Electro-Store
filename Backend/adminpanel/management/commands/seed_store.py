import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.models import User
from adminpanel.models import Product, Order, OrderItem, Brand, Category, Service, ServiceInquiry, Review, WebsiteContent, StoreSettings

BRANDS = ["Acme", "VoltX", "ZenTech", "Nova", "HyperCore"]
CATS = ["Laptops", "Phones", "Accessories", "Monitors", "Storage"]

class Command(BaseCommand):
    help = "Seed products and orders for dashboard demo"

    def handle(self, *args, **opts):
        if Product.objects.count() < 30:
            for i in range(30):
                Product.objects.create(
                    name=f"Product {i+1}",
                    brand=random.choice(BRANDS),
                    category=random.choice(CATS),
                    price=random.randint(20, 2000),
                    stock=random.randint(0, 50),
                )
            self.stdout.write(self.style.SUCCESS("Seeded products"))
        else:
            self.stdout.write("Products already exist")

        # ensure a demo user (non-admin customer)
        cust, _ = User.objects.get_or_create(username="customer_demo", defaults={"email":"cust@example.com"})
        if not cust.password:
            cust.set_password("demo12345"); cust.save()

        # orders in last 90 days
        if Order.objects.count() < 120:
            products = list(Product.objects.all())
            now = timezone.now()
            for _ in range(120):
                days_ago = random.randint(0, 90)
                created = now - timedelta(days=days_ago, hours=random.randint(0,23))
                status = random.choice(["pending","processing","shipped","delivered"])
                order = Order.objects.create(
                    user=cust,
                    total_price=0,
                    status=status,
                    created_at=created,
                    shipping_name=random.choice(["Alex Doe","Jamie Lee","Taylor Kim","Sam Patel"]),
                )
                items_n = random.randint(1, 4)
                total = 0
                for __ in range(items_n):
                    p = random.choice(products)
                    q = random.randint(1,3)
                    OrderItem.objects.create(order=order, product=p, quantity=q, unit_price=p.price)
                    total += float(p.price) * q
                order.total_price = total
                order.save(update_fields=["total_price"])
            self.stdout.write(self.style.SUCCESS("Seeded orders"))
        else:
            self.stdout.write("Orders already exist")

        # create brands/categories if none
        if Brand.objects.count() == 0:
            for n in ["Acme","VoltX","ZenTech","Nova","HyperCore"]:
                Brand.objects.create(name=n)
        if Category.objects.count() == 0:
            cat_map = {}
            for n in ["Laptops","Phones","Accessories","Monitors","Storage"]:
                cat_map[n] = Category.objects.create(name=n)

        # assign random brand/category to products created earlier
        brands = list(Brand.objects.all())
        cats = list(Category.objects.all())
        for p in Product.objects.all():
            if not p.brand: p.brand = random.choice(brands)
            if not p.category: p.category = random.choice(cats)
            if not p.technical_specs: p.technical_specs = {"processor":"Intel i5","ram":"8GB"}
            p.save()

        # services
        if Service.objects.count() == 0:
            s1 = Service.objects.create(
                name="Laptop Repair",
                description="Diagnostics, parts replacement, optimization",
                price=49,
                form_fields=[{"label":"What is the issue?","type":"textarea"},{"label":"Device Model","type":"text"}],
            )
            s2 = Service.objects.create(
                name="Phone Screen Replacement",
                description="OEM-quality screen replacement",
                price=89,
                form_fields=[{"label":"Device Model","type":"text"},{"label":"Color Preference","type":"text"}],
            )

        # inquiries
        if ServiceInquiry.objects.count() == 0:
            s = Service.objects.first()
            for who in ["Alex Doe","Jamie Lee","Taylor Kim"]:
                ServiceInquiry.objects.create(
                    service=s,
                    customer_name=who,
                    customer_email=f"{who.split()[0].lower()}@example.com",
                    customer_phone="000-000-0000",
                    inquiry_details={"notes":"Example inquiry"},
                    status="pending",
                )

        # reviews
        if Review.objects.count() == 0:
            for p in Product.objects.all()[:10]:
                Review.objects.create(product=p, user=cust, rating=random.randint(3,5), comment="Great product!")

        # content & settings singletons
        WebsiteContent.objects.get_or_create(id=1, defaults={
            "banner_text":"Welcome to the store!",
            "banner_link":"https://example.com",
            "phone_number":"+1 555-1234",
            "address":"123 Market St, City",
        })
        StoreSettings.objects.get_or_create(id=1, defaults={"currency":"USD","tax_rate":7.50,"shipping_rate":9.99})
