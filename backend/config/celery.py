"""Celery application for Acadrix.

The Celery app is created here, configured from Django settings (CELERY_* keys),
and instructed to autodiscover tasks across all installed apps.

Usage:
    Worker:    celery -A config worker -l info
    Beat:      celery -A config beat -l info        (when periodic tasks are added)
"""
import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('acadrix')

# Pull all CELERY_* keys from Django settings.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Find tasks.py inside every installed app.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Trivial task to verify the worker is reachable: `app.send_task('config.celery.debug_task')`"""
    print(f'Celery debug task running. Request: {self.request!r}')
