"""
Public API URLs for storefront consumption.
These endpoints don't require authentication.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from .views_public import (
    PublicBrandViewSet, PublicCategoryViewSet, PublicProductViewSet,
    PublicServiceViewSet, PublicServiceCategoryViewSet, PublicServiceReviewViewSet, PublicReviewViewSet, PublicWebsiteContentViewSet, PublicStoreSettingsViewSet,
    PublicContactViewSet, PublicServiceQueryViewSet, PublicOrderCreateViewSet, PublicOrderTrackingViewSet,
    PaymentIntentViewSet, StripeCheckoutViewSet, StripeCheckoutSessionViewSet,
    CreateOrderAndCheckoutViewSet, PublicOrderDetailViewSet
)
from .views_stripe import stripe_webhook, get_payment_intent

router = DefaultRouter()

# Public endpoints for storefront
router.register(r"brands", PublicBrandViewSet, basename="public-brand")
router.register(r"categories", PublicCategoryViewSet, basename="public-category")
router.register(r"products", PublicProductViewSet, basename="public-product")
router.register(r"service-categories", PublicServiceCategoryViewSet, basename="public-servicecategory")
router.register(r"services", PublicServiceViewSet, basename="public-service")
router.register(r"service-reviews", PublicServiceReviewViewSet, basename="public-servicereview")
router.register(r"reviews", PublicReviewViewSet, basename="public-review")
router.register(r"website-content", PublicWebsiteContentViewSet, basename="public-websitecontent")
router.register(r"store-settings", PublicStoreSettingsViewSet, basename="public-storesettings")
# Chat system temporarily disabled to reduce log noise
# router.register(r"chat-rooms", PublicChatRoomViewSet, basename="public-chatroom")
# router.register(r"chat-messages", PublicChatMessageViewSet, basename="public-chatmessage")
router.register(r"contacts", PublicContactViewSet, basename="public-contact")
router.register(r"service-queries", PublicServiceQueryViewSet, basename="public-servicequery")
router.register(r"orders", PublicOrderCreateViewSet, basename="public-order")
router.register(r"track-order", PublicOrderTrackingViewSet, basename="public-order-tracking")
router.register(r"create-payment-intent", PaymentIntentViewSet, basename="payment-intent")
router.register(r"create-checkout-session", StripeCheckoutViewSet, basename="stripe-checkout")
router.register(r"checkout-session", StripeCheckoutSessionViewSet, basename="checkout-session")
router.register(r"create-order-checkout", CreateOrderAndCheckoutViewSet, basename="create-order-checkout")
router.register(r"order-details", PublicOrderDetailViewSet, basename="public-order-detail")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", lambda r: JsonResponse({"status": "ok"}), name="public-health"),
    path("stripe/webhook/", stripe_webhook, name="stripe-webhook"),
    path("payment-intent/<str:payment_intent_id>/", get_payment_intent, name="get-payment-intent"),
    path("debug/test-webhook/", lambda r: JsonResponse({"message": "Use POST with session_data"}), name="test-webhook-debug"),
    path("orders/<str:order_number>/", PublicOrderDetailViewSet.as_view({'get': 'retrieve'}), name="public-order-detail-by-number"),
    path("orders/by-number/<str:order_id>/", PublicOrderDetailViewSet.as_view({'get': 'retrieve_by_id', 'patch': 'update_payment_status'}), name="public-order-detail-by-id"),
]
