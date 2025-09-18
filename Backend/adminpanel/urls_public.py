"""
Public API URLs for storefront consumption.
These endpoints don't require authentication.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from .views_public import (
    PublicBrandViewSet, PublicCategoryViewSet, PublicProductViewSet,
    PublicServiceViewSet, PublicWebsiteContentViewSet, PublicStoreSettingsViewSet,
    PublicChatRoomViewSet, PublicChatMessageViewSet
)

router = DefaultRouter()

# Public endpoints for storefront
router.register(r"brands", PublicBrandViewSet, basename="public-brand")
router.register(r"categories", PublicCategoryViewSet, basename="public-category")
router.register(r"products", PublicProductViewSet, basename="public-product")
router.register(r"services", PublicServiceViewSet, basename="public-service")
router.register(r"website-content", PublicWebsiteContentViewSet, basename="public-websitecontent")
router.register(r"store-settings", PublicStoreSettingsViewSet, basename="public-storesettings")
router.register(r"chat-rooms", PublicChatRoomViewSet, basename="public-chatroom")
router.register(r"chat-messages", PublicChatMessageViewSet, basename="public-chatmessage")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", lambda r: JsonResponse({"status": "ok"}), name="public-health"),
]
