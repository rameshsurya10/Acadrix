import environ
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / '.env')

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    # Local apps (one per role/domain)
    'apps.accounts',
    'apps.super_admin',
    'apps.admin_panel',
    'apps.academics',
    'apps.principal',
    'apps.teacher',
    'apps.student',
    # parent endpoints merged into apps.student
    'apps.shared',
    'apps.leave',
    'apps.hr',
    'apps.udise',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env.int('DB_PORT', default=5432),
        'NAME': env('DB_NAME', default='postgres'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default=''),
        'OPTIONS': {
            # SSL is required in production, disabled for local dev/docker.
            # Override per environment via DB_SSLMODE (require | prefer | disable).
            'sslmode': env('DB_SSLMODE', default='prefer'),
        },
    }
}

AUTH_USER_MODEL = 'accounts.User'

AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.MultiMethodAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── File Storage ────────────────────────────────────────────────────────────
# Toggle with USE_S3_STORAGE=True. When False (default), uploads go to local
# disk under MEDIA_ROOT. When True, uploads go to an S3-compatible bucket.
# Works with AWS S3, Cloudflare R2, Backblaze B2, and MinIO - set
# AWS_S3_ENDPOINT_URL accordingly.
USE_S3_STORAGE = env.bool('USE_S3_STORAGE', default=False)

if USE_S3_STORAGE:
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID', default='')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY', default='')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME', default='')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='ap-south-1')
    AWS_S3_ENDPOINT_URL = env('AWS_S3_ENDPOINT_URL', default='')  # blank = real AWS
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default='')  # CDN host, e.g. files.acadrix.com
    AWS_S3_ADDRESSING_STYLE = env('AWS_S3_ADDRESSING_STYLE', default='virtual')
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None  # let bucket policy decide, don't ACL each object
    AWS_QUERYSTRING_AUTH = env.bool('AWS_QUERYSTRING_AUTH', default=True)  # signed URLs for private files
    AWS_QUERYSTRING_EXPIRE = env.int('AWS_QUERYSTRING_EXPIRE', default=3600)  # 1 hour
    AWS_S3_FILE_OVERWRITE = False  # never clobber existing files; suffix instead
    AWS_LOCATION = env('AWS_LOCATION', default='media')  # bucket subfolder

    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3.S3Storage',
            'OPTIONS': {
                'bucket_name': AWS_STORAGE_BUCKET_NAME,
                'access_key': AWS_ACCESS_KEY_ID,
                'secret_key': AWS_SECRET_ACCESS_KEY,
                'region_name': AWS_S3_REGION_NAME,
                'endpoint_url': AWS_S3_ENDPOINT_URL or None,
                'custom_domain': AWS_S3_CUSTOM_DOMAIN or None,
                'addressing_style': AWS_S3_ADDRESSING_STYLE,
                'signature_version': AWS_S3_SIGNATURE_VERSION,
                'default_acl': AWS_DEFAULT_ACL,
                'querystring_auth': AWS_QUERYSTRING_AUTH,
                'querystring_expire': AWS_QUERYSTRING_EXPIRE,
                'file_overwrite': AWS_S3_FILE_OVERWRITE,
                'location': AWS_LOCATION,
            },
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }

# ─── DRF ─────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
        'user': '60/minute',
        'login': '5/minute',
        'identify': '10/minute',
        'otp': '5/minute',
        'forgot_password': '3/minute',
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ─── JWT ─────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=env.int('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', default=60)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env.int('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=7)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:5173'])

# ─── Email / SMTP ───────────────────────────────────────────────────────────
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='Acadrix <noreply@acadrix.com>')

# ─── Google OAuth2 ──────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID = env('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = env('GOOGLE_CLIENT_SECRET', default='')
GOOGLE_REDIRECT_URI = env('GOOGLE_REDIRECT_URI', default='http://localhost:3000/auth/google/callback')

# ─── SMS Provider (MSG91) ───────────────────────────────────────────────────
# When MSG91_AUTH_KEY is empty, send_otp_sms() falls back to console logging
# (dev mode). Setting it activates real SMS dispatch.
#
# Setup: register a DLT template at https://msg91.com -> get template_id +
# auth key. The template MUST contain ##OTP## as the placeholder for the code.
MSG91_AUTH_KEY = env('MSG91_AUTH_KEY', default='')
MSG91_OTP_TEMPLATE_ID = env('MSG91_OTP_TEMPLATE_ID', default='')
MSG91_SENDER_ID = env('MSG91_SENDER_ID', default='ACDRIX')
MSG91_COUNTRY_CODE = env('MSG91_COUNTRY_CODE', default='91')

# ─── AI / LLM (Anthropic Claude) ────────────────────────────────────────────
# Used by the principal's AI question generator (Phase 3.1).
# Leave ANTHROPIC_API_KEY empty to disable: the service will return a clear
# error and the upload endpoint will skip the LLM call.
ANTHROPIC_API_KEY = env('ANTHROPIC_API_KEY', default='')
ANTHROPIC_MODEL = env('ANTHROPIC_MODEL', default='claude-sonnet-4-5')
# Hard cap on PDF text extracted to avoid burning tokens on huge textbooks.
# 40000 chars ≈ 10 pages of dense text — enough for one chapter.
ANTHROPIC_MAX_INPUT_CHARS = env.int('ANTHROPIC_MAX_INPUT_CHARS', default=40000)

# ─── Payment Gateway (Razorpay) ─────────────────────────────────────────────
# Test credentials start with `rzp_test_`, live credentials with `rzp_live_`.
# Leave RAZORPAY_KEY_ID empty to disable online payments (the PayFees page
# will show a "gateway not configured" message).
RAZORPAY_KEY_ID = env('RAZORPAY_KEY_ID', default='')
RAZORPAY_KEY_SECRET = env('RAZORPAY_KEY_SECRET', default='')
RAZORPAY_WEBHOOK_SECRET = env('RAZORPAY_WEBHOOK_SECRET', default='')
RAZORPAY_CURRENCY = env('RAZORPAY_CURRENCY', default='INR')

# ─── API Docs ────────────────────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'Scholar Metric API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAdminUser'],
}

# ─── Redis Cache ─────────────────────────────────────────────────────────────
REDIS_URL = env('REDIS_URL', default='redis://localhost:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'IGNORE_EXCEPTIONS': True,  # don't crash if Redis is down
        },
        'KEY_PREFIX': 'acadrix',
    }
}
DJANGO_REDIS_IGNORE_EXCEPTIONS = True

# ─── Celery (background jobs) ────────────────────────────────────────────────
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default=REDIS_URL)
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default=REDIS_URL)
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 5 * 60          # hard kill after 5 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 4 * 60     # raise SoftTimeLimitExceeded at 4 min
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_TASK_ACKS_LATE = True             # re-deliver if worker dies mid-task
CELERY_WORKER_PREFETCH_MULTIPLIER = 1    # fair scheduling for slow tasks

# ─── Production Security (active when DEBUG=False) ──────────────────────────
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    X_FRAME_OPTIONS = 'DENY'
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True

# ─── Logging ────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
