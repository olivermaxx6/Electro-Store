import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json

log = logging.getLogger("adminpanel")

@csrf_exempt
@require_http_methods(["GET", "POST"])
def health_ping(request):
    """
    Simple health check endpoint for monitoring and debugging.
    Returns basic system status information.
    """
    try:
        response_data = {
            "status": "healthy",
            "message": "Electro-Store Admin API is running",
            "method": request.method,
            "timestamp": request.META.get('HTTP_DATE', 'N/A'),
            "user_agent": request.META.get('HTTP_USER_AGENT', 'N/A'),
            "remote_addr": request.META.get('REMOTE_ADDR', 'N/A'),
        }
        
        log.info("Health ping requested from %s", request.META.get('REMOTE_ADDR', 'unknown'))
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        log.error("Health ping error: %s", str(e))
        return JsonResponse({
            "status": "error",
            "message": "Health check failed",
            "error": str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
def request_echo(request):
    """
    Debug endpoint that echoes back request information.
    Useful for testing API connectivity and request handling.
    """
    try:
        # Get request data based on method
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if request.content_type == 'application/json':
                    request_data = json.loads(request.body.decode('utf-8'))
                else:
                    request_data = request.POST.dict()
            except (json.JSONDecodeError, UnicodeDecodeError):
                request_data = "Unable to parse request data"
        else:
            request_data = request.GET.dict()
        
        response_data = {
            "status": "success",
            "message": "Request echo successful",
            "request_info": {
                "method": request.method,
                "path": request.path,
                "query_params": request.GET.dict(),
                "headers": dict(request.META),
                "content_type": request.content_type,
                "data": request_data,
                "remote_addr": request.META.get('REMOTE_ADDR', 'N/A'),
                "user_agent": request.META.get('HTTP_USER_AGENT', 'N/A'),
            }
        }
        
        log.info("Request echo from %s: %s %s", 
                request.META.get('REMOTE_ADDR', 'unknown'), 
                request.method, 
                request.path)
        
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        log.error("Request echo error: %s", str(e))
        return JsonResponse({
            "status": "error",
            "message": "Request echo failed",
            "error": str(e)
        }, status=500)
