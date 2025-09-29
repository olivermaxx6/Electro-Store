"""
SPPIX Configuration File
Comprehensive configuration settings for the SPPIX project
"""

import os
from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(__file__).resolve().parent

# =============================================================================
# STRIPE CONFIGURATION
# =============================================================================
STRIPE_CONFIG = {
    # Live Stripe Keys (Production)
    "SECRET_KEY": "sk_live_your_live_stripe_secret_key_here",
    "PUBLISHABLE_KEY": "pk_live_your_live_stripe_publishable_key_here",
    
    # Test Stripe Keys (Development)
    "TEST_SECRET_KEY": "sk_test_your_test_secret_key_here",
    "TEST_PUBLISHABLE_KEY": "pk_test_your_test_publishable_key_here",
    
    # Webhook Configuration
    "WEBHOOK_SECRET": "whsec_your_webhook_secret_here",
    
    # Stripe Settings
    "CURRENCY": "usd",
    "COUNTRY": "US",
    "ENABLE_STRIPE": True,
    "USE_LIVE_KEYS": True,  # Set to False for development
}

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_CONFIG = {
    # MySQL Configuration (Production)
    "MYSQL": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "sppix_store",
        "USER": "sppix_user",
        "PASSWORD": "SppixStore2024!",
        "HOST": "localhost",
        "PORT": "3306",
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES', character_set_connection=utf8mb4, collation_connection=utf8mb4_unicode_ci",
            "charset": "utf8mb4",
            "use_unicode": True,
            "connect_timeout": 30,
        },
        "CONN_MAX_AGE": 300,
        "TIME_ZONE": "UTC",
    },
    
    # Default database to use
    "DEFAULT": "MYSQL",
}

# =============================================================================
# DJANGO CONFIGURATION
# =============================================================================
DJANGO_CONFIG = {
    # Security
    "SECRET_KEY": "dev-secret-key-change-in-prod",
    "DEBUG": True,
    "ALLOWED_HOSTS": ["*", "localhost", "127.0.0.1", "::1", "testserver"],
    
    # Server Configuration
    "RUNSERVER_PORT": "8001",
    "RUNSERVER_HOST": "127.0.0.1",
    
    # Site Information
    "SITE_NAME": "SPPIX",
    "SITE_DESCRIPTION": "Your one-stop electronics store",
    "SITE_URL": "http://localhost:8001",
    
    # Language and Timezone
    "LANGUAGE_CODE": "en-us",
    "TIME_ZONE": "UTC",
    "USE_I18N": True,
    "USE_TZ": True,
}

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================
FRONTEND_CONFIG = {
    # API Configuration
    "API_BASE_URL": "http://127.0.0.1:8001",
    "API_TIMEOUT": 30000,
    
    # App Configuration
    "APP_NAME": "SPPIX Ecommerce",
    "APP_VERSION": "1.0.0",
    
    # Development Settings
    "DEV_MODE": True,
    "DEBUG": True,
    
    # Ports for different frontend applications
    "PORTS": {
        "STOREFRONT": 5173,
        "ADMIN": 5174,
        "MAIN": 3000,
    },
    
    # Feature Flags
    "FEATURES": {
        "ENABLE_CHAT": True,
        "ENABLE_REVIEWS": True,
        "ENABLE_WISHLIST": True,
        "ENABLE_DARK_MODE": True,
    },
    
    # Theme Configuration
    "DEFAULT_THEME": "light",
    "ENABLE_DARK_MODE": True,
}

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_CONFIG = {
    "ALLOWED_ORIGINS": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",    # Storefront
        "http://127.0.0.1:5173",   # Storefront
        "http://localhost:5174",    # Admin
        "http://127.0.0.1:5174",   # Admin
        "http://localhost:8001",    # Django dev server
        "http://127.0.0.1:8001",    # Django dev server
    ],
    "ALLOW_CREDENTIALS": True,
    "ALLOW_ALL_ORIGINS": True,  # Development only - set to False in production
    "ALLOWED_HEADERS": [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
        'cache-control',
        'pragma',
        'expires',
        'if-none-match',
        'if-modified-since',
    ],
    "ALLOWED_METHODS": [
        'DELETE',
        'GET',
        'OPTIONS',
        'PATCH',
        'POST',
        'PUT',
    ],
}

# =============================================================================
# JWT CONFIGURATION
# =============================================================================
JWT_CONFIG = {
    "ACCESS_TOKEN_LIFETIME": 24 * 60 * 60,  # 24 hours in seconds
    "REFRESH_TOKEN_LIFETIME": 7 * 24 * 60 * 60,  # 7 days in seconds
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_CONFIG = {
    "BACKEND": "django.core.mail.backends.console.EmailBackend",  # Development
    "HOST": "smtp.gmail.com",
    "PORT": 587,
    "USE_TLS": True,
    "HOST_USER": "your-email@gmail.com",
    "HOST_PASSWORD": "your-app-password",
    "FROM_EMAIL": "noreply@sppix.com",
    "ADMIN_EMAIL": "admin@sppix.com",
}

# =============================================================================
# FILE UPLOAD CONFIGURATION
# =============================================================================
FILE_CONFIG = {
    "MEDIA_URL": "/media/",
    "MEDIA_ROOT": PROJECT_ROOT / "Backend" / "media",
    "STATIC_URL": "/static/",
    "STATIC_ROOT": PROJECT_ROOT / "Backend" / "staticfiles",
    "STATICFILES_DIRS": [
        PROJECT_ROOT / "Backend" / "static",
    ],
    "MAX_UPLOAD_SIZE": 10 * 1024 * 1024,  # 10MB
    "ALLOWED_FILE_TYPES": [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
    ],
}

# =============================================================================
# REDIS CONFIGURATION (Optional)
# =============================================================================
REDIS_CONFIG = {
    "URL": "redis://localhost:6379/0",
    "ENABLED": False,  # Set to True if using Redis
    "CHANNEL_LAYERS": {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        },
    },
}

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOGGING_CONFIG = {
    "VERSION": 1,
    "DISABLE_EXISTING_LOGGERS": False,
    "FORMATTERS": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "HANDLERS": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": PROJECT_ROOT / "Backend" / "logs" / "django.log",
            "formatter": "verbose",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "ROOT": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "LOGGERS": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
SECURITY_CONFIG = {
    "SECURE_BROWSER_XSS_FILTER": True,
    "SECURE_CONTENT_TYPE_NOSNIFF": True,
    "X_FRAME_OPTIONS": "DENY",
    "SECURE_SSL_REDIRECT": False,  # Set to True in production with HTTPS
    "SESSION_COOKIE_SECURE": False,  # Set to True in production with HTTPS
    "CSRF_COOKIE_SECURE": False,  # Set to True in production with HTTPS
    "CSRF_TRUSTED_ORIGINS": [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sppix.com",
        "https://www.sppix.com",
    ],
}

# =============================================================================
# ADMIN CONFIGURATION
# =============================================================================
ADMIN_CONFIG = {
    "ADMIN_USER": "admin",
    "ADMIN_EMAIL": "admin@sppix.com",
    "ADMIN_PASSWORD": "admin123",  # Change this in production
    "ADMIN_FIRST_NAME": "SPPIX",
    "ADMIN_LAST_NAME": "Admin",
}

# =============================================================================
# PAYMENT CONFIGURATION
# =============================================================================
PAYMENT_CONFIG = {
    "STRIPE": STRIPE_CONFIG,
    "CURRENCY": "usd",
    "ENABLE_PAYMENTS": True,
    "PAYMENT_METHODS": ["card", "bank_transfer"],
    "REFUND_POLICY_DAYS": 30,
    "SHIPPING_COST": 9.99,
    "FREE_SHIPPING_THRESHOLD": 50.00,
}

# =============================================================================
# BUSINESS CONFIGURATION
# =============================================================================
BUSINESS_CONFIG = {
    "COMPANY_NAME": "SPPIX",
    "COMPANY_ADDRESS": {
        "street": "123 Electronics Street",
        "city": "Tech City",
        "state": "CA",
        "zip_code": "12345",
        "country": "USA",
    },
    "CONTACT_INFO": {
        "phone": "+1-555-123-4567",
        "email": "support@sppix.com",
        "website": "https://sppix.com",
    },
    "BUSINESS_HOURS": {
        "monday": "9:00 AM - 6:00 PM",
        "tuesday": "9:00 AM - 6:00 PM",
        "wednesday": "9:00 AM - 6:00 PM",
        "thursday": "9:00 AM - 6:00 PM",
        "friday": "9:00 AM - 6:00 PM",
        "saturday": "10:00 AM - 4:00 PM",
        "sunday": "Closed",
    },
}

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================
DEV_CONFIG = {
    "ENABLE_DEBUG_TOOLBAR": True,
    "ENABLE_SQL_LOGGING": True,
    "ENABLE_CACHE": False,
    "ENABLE_COMPRESSION": False,
    "MOCK_EXTERNAL_APIS": True,
    "FAKE_DATA_GENERATION": True,
}

# =============================================================================
# PRODUCTION CONFIGURATION
# =============================================================================
PRODUCTION_CONFIG = {
    "DEBUG": False,
    "ALLOWED_HOSTS": ["sppix.com", "www.sppix.com"],
    "SECURE_SSL_REDIRECT": True,
    "SESSION_COOKIE_SECURE": True,
    "CSRF_COOKIE_SECURE": True,
    "SECURE_HSTS_SECONDS": 31536000,
    "SECURE_HSTS_INCLUDE_SUBDOMAINS": True,
    "SECURE_HSTS_PRELOAD": True,
    "ENABLE_CACHE": True,
    "ENABLE_COMPRESSION": True,
    "USE_LIVE_STRIPE_KEYS": True,
}

# =============================================================================
# ENVIRONMENT DETECTION
# =============================================================================
def get_environment():
    """Detect the current environment"""
    return os.getenv("ENVIRONMENT", "development")

def is_production():
    """Check if running in production"""
    return get_environment() == "production"

def is_development():
    """Check if running in development"""
    return get_environment() == "development"

# =============================================================================
# CONFIGURATION GETTERS
# =============================================================================
def get_database_config():
    """Get database configuration based on environment"""
    if is_production():
        return DATABASE_CONFIG["MYSQL"]
    else:
        return DATABASE_CONFIG[DATABASE_CONFIG["DEFAULT"]]

def get_stripe_config():
    """Get Stripe configuration based on environment"""
    config = STRIPE_CONFIG.copy()
    if is_production():
        config["USE_LIVE_KEYS"] = True
    else:
        config["USE_LIVE_KEYS"] = False
    return config

def get_cors_config():
    """Get CORS configuration based on environment"""
    config = CORS_CONFIG.copy()
    if is_production():
        config["ALLOW_ALL_ORIGINS"] = False
        config["ALLOWED_ORIGINS"] = [
            "https://sppix.com",
            "https://www.sppix.com",
        ]
    return config

# =============================================================================
# EXPORT CONFIGURATION
# =============================================================================
__all__ = [
    "STRIPE_CONFIG",
    "DATABASE_CONFIG", 
    "DJANGO_CONFIG",
    "FRONTEND_CONFIG",
    "CORS_CONFIG",
    "JWT_CONFIG",
    "EMAIL_CONFIG",
    "FILE_CONFIG",
    "REDIS_CONFIG",
    "LOGGING_CONFIG",
    "SECURITY_CONFIG",
    "ADMIN_CONFIG",
    "PAYMENT_CONFIG",
    "BUSINESS_CONFIG",
    "DEV_CONFIG",
    "PRODUCTION_CONFIG",
    "get_environment",
    "is_production",
    "is_development",
    "get_database_config",
    "get_stripe_config",
    "get_cors_config",
]
