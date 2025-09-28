from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate, Extract
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Order, OrderItem
from .serializers import RecentOrderSerializer

class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        start_30 = now - timedelta(days=30)
        start_90 = now - timedelta(days=90)

        # Totals - Count all orders (not just shipped/delivered)
        all_orders = Order.objects.all()
        agg_totals = all_orders.aggregate(
            revenue=Sum("total_price"), orders=Count("id")
        )
        revenue = float(agg_totals["revenue"] or 0)
        orders_count = agg_totals["orders"] or 0
        avg_order_value = (revenue / orders_count) if orders_count else 0

        # Count all customers (including guest orders)
        customers = Order.objects.values("customer_email").distinct().count()

        # Sales by day (last 30) - All orders
        sales_qs = (
            Order.objects.filter(created_at__gte=start_30)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(revenue=Sum("total_price"), orders=Count("id"))
            .order_by("day")
        )
        sales_by_day = [
            {"date": s["day"].isoformat(), "revenue": float(s["revenue"] or 0), "orders": s["orders"]}
            for s in sales_qs
        ]

        # Top products (last 30) - All orders
        top_qs = (
            OrderItem.objects.filter(order__created_at__gte=start_30)
            .values(pid=F("product__id"), name=F("product__name"))
            .annotate(sold_qty=Sum("quantity"), revenue=Sum(F("quantity") * F("unit_price")))
            .order_by("-sold_qty")[:5]
        )
        top_products = [
            {
                "id": t["pid"],
                "name": t["name"],
                "sold_qty": int(t["sold_qty"] or 0),
                "revenue": float(t["revenue"] or 0),
            }
            for t in top_qs
        ]

        # Inventory snapshot
        total_products = Product.objects.count()
        low_stock_count = Product.objects.filter(stock__lte=5).count()
        
        # Get product inventory data for dashboard
        products_inventory = Product.objects.select_related('category').values(
            'id', 'name', 'stock', 'price', 'category__name'
        ).order_by('-stock')[:20]  # Top 20 products by stock
        
        inventory_by_category = [
            {
                "id": p["id"],
                "name": p["name"], 
                "stock": p["stock"],
                "price": float(p["price"]),
                "category": p["category__name"] or "Uncategorized"
            } 
            for p in products_inventory
        ]

        # Weekly sales distribution (last 30 days) - Simple approach
        weekly_sales = []
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        # Get all orders from last 30 days and group by day of week
        orders_last_30 = Order.objects.filter(created_at__gte=start_30)
        
        # Initialize all days with 0 values
        for i, day_name in enumerate(day_names):
            weekly_sales.append({
                "day": day_name,
                "day_num": i,
                "revenue": 0.0,
                "orders": 0
            })
        
        # Calculate sales for each day
        for order in orders_last_30:
            day_of_week = order.created_at.weekday()  # 0=Monday, 6=Sunday
            # Convert to Sunday=0 format
            day_index = (day_of_week + 1) % 7
            weekly_sales[day_index]["revenue"] += float(order.total_price)
            weekly_sales[day_index]["orders"] += 1

        # User registration analytics (last 30 days)
        user_registrations_qs = (
            User.objects.filter(date_joined__gte=start_30)
            .annotate(date=TruncDate('date_joined'))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )
        
        user_registrations = [
            {
                "date": item["date"].strftime("%Y-%m-%d"),
                "users": item["count"]
            }
            for item in user_registrations_qs
        ]
        
        # Fill in missing dates with 0 values
        current_date = start_30.date()
        end_date = timezone.now().date()
        filled_user_registrations = []
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            existing = next((item for item in user_registrations if item["date"] == date_str), None)
            filled_user_registrations.append({
                "date": date_str,
                "users": existing["users"] if existing else 0
            })
            current_date += timedelta(days=1)
        
        # Weekly user registrations (last 7 days)
        weekly_user_registrations = []
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        # Get all users from last 30 days and group by day of week
        users_last_30 = User.objects.filter(date_joined__gte=start_30)
        
        # Initialize all days with 0 values
        for i, day_name in enumerate(day_names):
            weekly_user_registrations.append({
                "day": day_name,
                "day_num": i,
                "users": 0
            })
        
        # Calculate registrations for each day
        for user in users_last_30:
            day_of_week = user.date_joined.weekday()  # 0=Monday, 6=Sunday
            # Convert to Sunday=0 format
            day_index = (day_of_week + 1) % 7
            weekly_user_registrations[day_index]["users"] += 1

        # Recent orders (10)
        recent = Order.objects.order_by("-created_at")[:10]
        recent_orders = RecentOrderSerializer(recent, many=True).data

        return Response({
            "totals": {
                "revenue": revenue,
                "orders": orders_count,
                "customers": customers,
                "avg_order_value": avg_order_value,
            },
            "sales_by_day": sales_by_day,
            "weekly_sales": weekly_sales,
            "user_registrations": filled_user_registrations,
            "weekly_user_registrations": weekly_user_registrations,
            "top_products": top_products,
            "inventory": {
                "total_products": total_products,
                "low_stock_count": low_stock_count,
                "by_category": inventory_by_category,
            },
            "recent_orders": recent_orders,
        })

class ProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        u = request.user
        return Response({
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
        })

    def put(self, request):
        u = request.user
        u.first_name = request.data.get("first_name", u.first_name)
        u.last_name = request.data.get("last_name", u.last_name)
        email = request.data.get("email")
        if email: 
            u.email = email
        u.save()
        return Response({"ok": True})

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request):
        current = request.data.get("current_password")
        new = request.data.get("new_password")
        if not current or not new:
            return Response({"detail":"current_password and new_password required"}, status=400)
        if not request.user.check_password(current):
            return Response({"detail":"Current password incorrect"}, status=400)
        request.user.set_password(new)
        request.user.save()
        return Response({"ok": True})
