from django.contrib import admin
from .models import Announcement, AuditLog, SchoolSettings

admin.site.register(SchoolSettings)
admin.site.register(AuditLog)
admin.site.register(Announcement)
