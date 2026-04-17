"""Test settings - SQLite, no remote services, eager Celery."""
from config.settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable throttling in tests by setting very high rates
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '1000/minute',
    'user': '1000/minute',
    'login': '1000/minute',
    'identify': '1000/minute',
    'otp': '1000/minute',
    'forgot_password': '1000/minute',
}

# Run Celery tasks synchronously inside the calling thread (no broker needed)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'

# In-memory cache so tests don't need Redis
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'acadrix-test',
    }
}
