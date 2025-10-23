from django.contrib.auth.models import User
from rest_framework import serializers
from django.db import IntegrityError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "is_superuser"]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]
    
    def validate_username(self, value):
        """Check if username already exists"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists. Please choose a different username.")
        return value
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email address already exists. Please use a different email or try signing in.")
        return value
    
    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )
            return user
        except IntegrityError as e:
            # Handle any remaining integrity errors
            if 'username' in str(e):
                raise serializers.ValidationError({"username": "A user with this username already exists. Please choose a different username."})
            elif 'email' in str(e):
                raise serializers.ValidationError({"email": "A user with this email address already exists. Please use a different email or try signing in."})
            else:
                raise serializers.ValidationError("Registration failed due to a database constraint. Please check your information and try again.")