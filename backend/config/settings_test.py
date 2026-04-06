"""Test settings - uses SQLite to avoid remote DB dependency."""
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
