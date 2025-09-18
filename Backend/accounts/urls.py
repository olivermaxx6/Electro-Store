from django.urls import path
from .views import LoginView, RefreshView, me, register

urlpatterns = [
    path("login", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="token_refresh"),
    path("register", register, name="register"),
    path("me", me, name="me"),
]
