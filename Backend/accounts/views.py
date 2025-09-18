from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer, UserRegistrationSerializer

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

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register with {"username": "...", "email": "...", "password": "..."}
    Creates a new user account
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User created successfully",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
