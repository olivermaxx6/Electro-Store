# MySQL Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'myproject',
        'USER': 'django_user',
        'PASSWORD': 'DjangoPass123!',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {'charset': 'utf8mb4'},
    }
}

# CORS for React frontends
INSTALLED_APPS = [
    ...,
    'corsheaders',  # Add this
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add first
    ...,
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
