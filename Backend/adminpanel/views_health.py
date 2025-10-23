"""
Health and diagnostic endpoints for the admin panel.

This module provides endpoints for:
- Health checks and system status monitoring
- Request debugging and diagnostics
- System information and configuration details
"""

from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
import os
import logging
import platform
import sys

logger = logging.getLogger(__name__)


def health_ping(request):
    """
    Health check endpoint for monitoring system status.
    
    Returns basic system information and status indicators.
    Used by load balancers, monitoring systems, and frontend health checks.
    """
    return JsonResponse({
        "status": "healthy",
        "message": "Admin panel is running",
        "version": "1.0.0",
        "environment": getattr(settings, "ENVIRONMENT", "development"),
        "debug": settings.DEBUG,
        "timestamp": timezone.now().isoformat(),
        "python_version": sys.version,
        "platform": platform.platform(),
        "django_version": getattr(settings, "DJANGO_VERSION", "unknown"),
    })


def request_echo(request):
    """
    Debug endpoint to echo request information for troubleshooting.
    
    Returns detailed information about the incoming request including
    headers, user authentication status, and request metadata.
    Useful for debugging authentication, CORS, and request handling issues.
    """
    return JsonResponse({
        "method": request.method,
        "path": request.path,
        "full_path": request.get_full_path(),
        "headers": dict(request.headers),
        "user": {
            "username": str(request.user) if hasattr(request, 'user') else "Anonymous",
            "is_authenticated": request.user.is_authenticated if hasattr(request, 'user') else False,
            "is_staff": request.user.is_staff if hasattr(request, 'user') and request.user.is_authenticated else False,
        },
        "content_type": request.content_type,
        "remote_addr": request.META.get('REMOTE_ADDR', 'unknown'),
        "user_agent": request.META.get('HTTP_USER_AGENT', 'unknown'),
        "referer": request.META.get('HTTP_REFERER', 'none'),
        "host": request.META.get('HTTP_HOST', 'unknown'),
        "timestamp": timezone.now().isoformat(),
    })
