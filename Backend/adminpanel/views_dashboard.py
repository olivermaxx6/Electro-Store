from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
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

        # Totals
        agg_totals = Order.objects.aggregate(
            revenue=Sum("total_price"), orders=Count("id")
        )
        revenue = float(agg_totals["revenue"] or 0)
        orders_count = agg_totals["orders"] or 0
        avg_order_value = (revenue / orders_count) if orders_count else 0

        customers = (
            Order.objects.filter(user__isnull=False).values("user").distinct().count()
        )

        # Sales by day (last 30)
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

        # Top products (last 30)
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
        by_category_qs = Product.objects.values("category").annotate(count=Count("id")).order_by("-count")
        inventory_by_category = [{"category": b["category"] or "Uncategorized", "count": b["count"]} for b in by_category_qs]

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
