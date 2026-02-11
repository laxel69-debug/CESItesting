from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "section",
        "grade_level",
        "status",
        "academic_year",
        "enrolled_at",
    )
    list_filter = ("grade_level", "status", "academic_year", "enrolled_at")
    search_fields = ("student__username", "student__email", "section__name")
    readonly_fields = ("created_at", "updated_at", "enrolled_at")
    
    fieldsets = (
        ("Enrollment Information", {
            "fields": ("student", "section", "grade_level", "academic_year")
        }),
        ("Status", {
            "fields": ("status", "enrolled_at", "completed_at")
        }),
        ("Notes", {
            "fields": ("remarks",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
