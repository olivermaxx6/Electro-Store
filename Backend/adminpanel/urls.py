import logging
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views_auth import AdminLoginView, AdminRefreshView, MeView, AdminProfileUpdateView, AdminPasswordChangeView
from .views_debug import health_ping, request_echo  # same paths as before
from .views_dashboard import DashboardStatsView, ProfileView, ChangePasswordView

log = logging.getLogger("adminpanel")
router = DefaultRouter()

try:
    from .views import (
        ProductViewSet, BrandViewSet, CategoryViewSet, ProductImageDestroyView,
        ServiceViewSet, ServiceCategoryViewSet, ServiceImageDestroyView, ServiceInquiryViewSet,
        OrderViewSet, AdminUserViewSet, ReviewViewSet, ServiceReviewViewSet,
        WebsiteContentViewSet, StoreSettingsViewSet,
        ChatRoomViewSet, ChatMessageViewSet, ContactViewSet, ServiceQueryViewSet
    )
    # Product management
    router.register(r"admin/products", ProductViewSet, basename="product")
    router.register(r"admin/brands", BrandViewSet, basename="brand")
    router.register(r"admin/categories", CategoryViewSet, basename="category")
    router.register(r"admin/product-images", ProductImageDestroyView, basename="productimage")
    
    # Service management
    router.register(r"admin/service-categories", ServiceCategoryViewSet, basename="servicecategory")
    router.register(r"admin/services", ServiceViewSet, basename="service")
    router.register(r"admin/service-images", ServiceImageDestroyView, basename="serviceimage")
    router.register(r"admin/service-inquiries", ServiceInquiryViewSet, basename="serviceinquiry")
    
    # Order management
    router.register(r"admin/orders", OrderViewSet, basename="order")
    
    # User management
    router.register(r"admin/users", AdminUserViewSet, basename="adminuser")
    
    # Review management
    router.register(r"admin/reviews", ReviewViewSet, basename="review")
    router.register(r"admin/service-reviews", ServiceReviewViewSet, basename="servicereview")
    
    # Content & Settings (singleton endpoints)
    router.register(r"admin/website-content", WebsiteContentViewSet, basename="websitecontent")
    router.register(r"admin/store-settings", StoreSettingsViewSet, basename="storesettings")
    
    # Chat system
    router.register(r"admin/chat-rooms", ChatRoomViewSet, basename="chatroom")
    router.register(r"admin/chat-messages", ChatMessageViewSet, basename="chatmessage")
    
    # Contact management
    router.register(r"admin/contacts", ContactViewSet, basename="contact")
    router.register(r"admin/service-queries", ServiceQueryViewSet, basename="servicequery")
    
except Exception as e:
    log.exception("Router setup failed (views import error): %s", e)
    # router stays partially/empty, but debug and auth below still work

urlpatterns = [
    # keep ALL endpoints under /api/ via core include
    path("", include(router.urls)),

    # ---- AUTH (unchanged) ----
    path("auth/login/", AdminLoginView.as_view(), name="admin-login"),
    path("auth/refresh/", AdminRefreshView.as_view(), name="admin-refresh"),
    path("auth/me/", MeView.as_view(), name="admin-me"),
    path("auth/profile/", AdminProfileUpdateView.as_view(), name="admin-profile-update"),
    path("auth/password/", AdminPasswordChangeView.as_view(), name="admin-password-change"),

    # ---- DASHBOARD ----
    path("admin/dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("admin/profile/", ProfileView.as_view(), name="admin-profile"),
    path("admin/password/", ChangePasswordView.as_view(), name="admin-password"),

    # ---- DEBUG (unchanged paths) ----
    path("admin/health/ping/", health_ping),
    path("admin/debug/request-echo/", request_echo),
]