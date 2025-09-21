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
    PublicChatRoomViewSet, PublicChatMessageViewSet, PublicContactViewSet, PublicServiceQueryViewSet, PublicOrderCreateViewSet, PublicOrderTrackingViewSet,
    PaymentIntentViewSet
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
router.register(r"chat-rooms", PublicChatRoomViewSet, basename="public-chatroom")
router.register(r"chat-messages", PublicChatMessageViewSet, basename="public-chatmessage")
router.register(r"contacts", PublicContactViewSet, basename="public-contact")
router.register(r"service-queries", PublicServiceQueryViewSet, basename="public-servicequery")
router.register(r"orders", PublicOrderCreateViewSet, basename="public-order")
router.register(r"track-order", PublicOrderTrackingViewSet, basename="public-order-tracking")
router.register(r"create-payment-intent", PaymentIntentViewSet, basename="payment-intent")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", lambda r: JsonResponse({"status": "ok"}), name="public-health"),
    path("stripe/webhook/", stripe_webhook, name="stripe-webhook"),
    path("payment-intent/<str:payment_intent_id>/", get_payment_intent, name="get-payment-intent"),
]
