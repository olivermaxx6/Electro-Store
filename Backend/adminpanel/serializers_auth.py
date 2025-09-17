from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class MeSerializer(serializers.ModelSerializer):
    user_type = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "is_superuser", "user_type"]
    
    def get_user_type(self, obj):
        if obj.is_superuser:
            return "Admin"
        elif obj.is_staff:
            return "Admin"
        else:
            return "User"

class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]

class AdminPasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    
    def validate_new_password(self, value):
        # Add password strength validation if needed
        return value