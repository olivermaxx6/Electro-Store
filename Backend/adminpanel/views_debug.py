# Backend/adminpanel/views_debug.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def health_ping(request):
    return JsonResponse({"ok": True, "message": "pong"})

@csrf_exempt
def request_echo(request):
    if request.method == "OPTIONS":
        return JsonResponse({"ok": True, "method": "OPTIONS"})
    if request.method == "POST":
        payload = request.body.decode("utf-8") if request.body else ""
        return JsonResponse({
            "ok": True,
            "method": "POST",
            "content_type": request.META.get("CONTENT_TYPE", ""),
            "raw": payload,
        })
    return JsonResponse({"detail": "Method not allowed."}, status=405)
