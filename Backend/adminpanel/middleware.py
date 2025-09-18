import json
import logging
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    """
    JWT Authentication middleware for Django Channels WebSocket connections.
    This middleware extracts JWT tokens from query parameters and authenticates users.
    """
    
    def __init__(self, inner):
        super().__init__(inner)
    
    async def __call__(self, scope, receive, send):
        # Extract token from query parameters
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        
        # Look for token in query parameters
        token = None
        if "token" in query_params:
            token = query_params["token"][0]
        elif "access" in query_params:
            token = query_params["access"][0]
        
        # Authenticate user if token is provided
        if token:
            try:
                user = await self.get_user_from_token(token)
                if user:
                    scope["user"] = user
                    logger.info(f"JWT authentication successful for user: {user.username}")
                else:
                    scope["user"] = AnonymousUser()
                    logger.warning("JWT authentication failed: Invalid token")
            except Exception as e:
                logger.error(f"JWT authentication error: {e}")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()
            logger.info("No JWT token provided, using anonymous user")
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """
        Validate JWT token and return the associated user.
        """
        try:
            # Validate the token
            access_token = AccessToken(token)
            
            # Get user ID from token
            user_id = access_token.get("user_id")
            if not user_id:
                return None
            
            # Get user from database
            try:
                user = User.objects.get(id=user_id)
                return user
            except User.DoesNotExist:
                logger.error(f"User with ID {user_id} not found")
                return None
                
        except (InvalidToken, TokenError) as e:
            logger.error(f"Token validation failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during token validation: {e}")
            return None
