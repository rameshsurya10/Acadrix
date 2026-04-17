"""Ensure the Celery app is loaded when Django starts so @shared_task decorators
attach to the right app instance.
"""
from .celery import app as celery_app

__all__ = ('celery_app',)
