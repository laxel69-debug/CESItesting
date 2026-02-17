from django.contrib import admin
from .models import Schedule


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("id", "teacher", "subject", "section", "day_of_week", "start_time", "end_time", "room")
    list_filter = ("day_of_week", "section", "subject")
    search_fields = ("teacher__username", "subject__name", "section__name")
    ordering = ("section", "day_of_week", "start_time")
