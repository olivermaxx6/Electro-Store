from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login with {"username": "...", "password": "..."}
    returns {access, refresh, user}
    """
    def post(self, request, *args, **kwargs):
        resp = super().post(request, *args, **kwargs)
        if resp.status_code == 200:
            user = User.objects.get(username=request.data.get("username"))
            data = resp.data
            data["user"] = UserSerializer(user).data
            return Response(data)
        return resp

class RefreshView(TokenRefreshView):
    pass

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"user": UserSerializer(request.user).data})
