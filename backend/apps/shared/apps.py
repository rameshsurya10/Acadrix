from django.apps import AppConfig


class SharedConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.shared'
    label = 'shared'

    def ready(self):
        # Wire cache invalidation signals (Phase 1.6)
        from apps.shared import signals  # noqa: F401
        signals._connect_signals()
