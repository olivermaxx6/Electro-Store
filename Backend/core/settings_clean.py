from pathlib import Path
from datetime import timedelta
import os
import warnings
from dotenv import load_dotenv
import pymysql

# Configure PyMySQL to work with Django
pymysql.install_as_MySQLdb()

# Suppress pkg_resources deprecation warnings
warnings.filterwarnings("ignore", message="pkg_resources is deprecated")

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-in-prod")

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY = "pk_live_51S9uLKEWDiIf4tSOX9zbIjLue5hh3oqUUkt6yTekNDg6wJ7bF4BlfUSREciifffNH4lfbuXPuIyRBCZs2pazIPxj00ZTkmPTT8"
STRIPE_SECRET_KEY = "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"

DEBUG = False
DEBUG_PROPAGATE_EXCEPTIONS = False

ALLOWED_HOSTS = [
    "sppix.com", 
    "www.sppix.com", 
    "90.249.95.206",
    "localhost", 
    "127.0.0.1", 
    "::1", 
    "testserver"
]

INSTALLED_APPS = [
    # Django apps...
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "channels",
    
    # Local apps
    "accounts",
    "adminpanel",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "adminpanel.middleware.CustomCorsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

# Database
# MySQL configuration (active - production setup)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "electro_store",  # Using the newly created database
        "USER": "electro_user",  # Using the newly created user
        "PASSWORD": "ElectroStore2024!",  # Using the correct password
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
    }
}


# Authentication backends
AUTHENTICATION_BACKENDS = [
    'accounts.authentication.EmailOrUsernameModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# MySQL Optimizations (when using MySQL)
DJANGO_MYSQL_REWRITE_QUERIES = True

# Development server configuration
RUNSERVER_PORT = '82'
RUNSERVER_HOST = '127.0.0.1'

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 250,  # Increased to accommodate 100-200+ categories on a single page
}

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=24),  # Increased from 60 minutes to 24 hours for development
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}

# CORS settings - Enhanced for production setup
CORS_ALLOWED_ORIGINS = [
    "https://sppix.com",
    "https://www.sppix.com",
    "http://sppix.com",
    "http://www.sppix.com",
    "http://90.249.95.206",
    "https://90.249.95.206",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",    # Storefront
    "http://127.0.0.1:5173",   # Storefront
    "http://localhost:5174",   # Admin
    "http://127.0.0.1:5174",   # Admin
    "http://localhost:8001",   # Django dev server
    "http://127.0.0.1:8001",   # Django dev server
]

CORS_ALLOW_CREDENTIALS = True

# Production - set to False for security
CORS_ALLOW_ALL_ORIGINS = False

# Additional CORS settings for better frontend integration
CORS_ALLOW_HEADERS = [
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
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# CSRF trusted origins for production setup
CSRF_TRUSTED_ORIGINS = [
    "https://sppix.com",
    "https://www.sppix.com",
    "http://sppix.com",
    "http://www.sppix.com",
    "http://90.249.95.206",
    "https://90.249.95.206",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Channels
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "logs" / "django.log",
            "formatter": "verbose",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# Email settings (for development)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Security settings (for development)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Custom settings
CUSTOM_SETTINGS = {
    "SITE_NAME": "SPPIX",
    "SITE_DESCRIPTION": "Your one-stop electronics store",
    "SITE_URL": "https://sppix.com",
    "SITE_DOMAIN": "sppix.com",
}
