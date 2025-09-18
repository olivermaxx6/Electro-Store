from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

def _clean_raw_token(raw: str | None) -> str | None:
    if not raw:
        return None
    raw = raw.strip()
    if raw.lower().startswith("bearer "):
        raw = raw[7:].strip()
    return raw or None

class JWTAuthMiddleware(BaseMiddleware):
    """
    WebSocket query auth:
      - Accepts ?token= or ?access= (string JWT only, no 'Bearer ' prefix).
      - Validates JWT; REQUIRES token_type == 'access'.
      - On failure, leaves AnonymousUser. Consumers decide 4401/4403.
    """
    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get("query_string", b"").decode())
        raw = _clean_raw_token(
            query.get("token", [None])[0] or query.get("access", [None])[0]
        )

        user = scope.get("user") or AnonymousUser()

        if raw:
            try:
                jwt_auth = JWTAuthentication()
                validated = jwt_auth.get_validated_token(raw)
                # Enforce access token only
                token_type = getattr(validated, "token_type", None) or validated.get("token_type", None)
                if token_type != "access":
                    # Access only for WS auth
                    user = AnonymousUser()
                    scope["jwt_error"] = "non_access_token"
                else:
                    user = await sync_to_async(jwt_auth.get_user)(validated)
                    scope["jwt_error"] = None
            except (InvalidToken, AuthenticationFailed) as e:
                user = AnonymousUser()
                scope["jwt_error"] = f"invalid_token:{str(e)}"
            except Exception as e:
                user = AnonymousUser()
                scope["jwt_error"] = f"unexpected:{str(e)}"
        else:
            scope["jwt_error"] = "missing_token"

        scope["user"] = user
        return await super().__call__(scope, receive, send)
