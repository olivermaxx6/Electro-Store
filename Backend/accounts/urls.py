from django.urls import path
from .views import LoginView, RefreshView, me

urlpatterns = [
    path("login", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="token_refresh"),
    path("me", me, name="me"),
]
