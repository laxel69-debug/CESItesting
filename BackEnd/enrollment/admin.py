from django.contrib import admin
from .models import Enrollment, ParentInfo  # remove ParentInfo if you didn't create it


class ParentInfoInline(admin.StackedInline):
    model = ParentInfo
    extra = 0


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    inlines = [ParentInfoInline]

    list_display = (
        "id",
        "student",
        "full_name",
        "grade_level",
        "status",
        "academic_year",
        "payment_mode",
        "section",
        "enrolled_at",
    )

    list_filter = (
        "status",
        "grade_level",
        "academic_year",
        "payment_mode",
        "section",
    )

    search_fields = (
        "first_name",
        "last_name",
        "lrn",
        "student_number",
        "student__username",
        "student__email",
    )

    readonly_fields = ("created_at", "updated_at", "enrolled_at")

    @admin.display(description="Full name")
    def full_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip() or "(no name)"
    
    