from django.contrib import admin
from .models import AttendanceRecord


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ["student", "section", "date", "status", "marked_by", "updated_at"]
    list_filter = ["status", "section", "date"]
    search_fields = ["student__username", "student__profile__first_name", "student__profile__last_name"]
    ordering = ["-date", "section"]
    date_hierarchy = "date"
