# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User,
    UserProfile,
    TeacherProfile,
    AdminProfile,
    Section,
    Subject,
)

# ---------- Inlines (shown inside User admin page) ----------
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    extra = 0
    can_delete = False
    fields = (
        "student_first_name", "student_middle_name", "student_last_name",
        "grade_level", "section",
        "lrn", "student_number", "payment_mode",   # ✅
        "parent_first_name", "parent_middle_name", "parent_last_name",
        "contact_number", "address",
    )


class TeacherProfileInline(admin.StackedInline):
    model = TeacherProfile
    extra = 0
    can_delete = False


class AdminProfileInline(admin.StackedInline):
    model = AdminProfile
    extra = 0
    can_delete = False


# ---------- Custom User Admin ----------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-created_at",)
    list_display = (
        "id",
        "username",
        "email",
        "role",
        "status",
        "is_active",
        "is_staff",
        "has_profile",
        "profile_lrn",          # ✅
        "profile_payment_mode", # ✅
        "created_at"
        )
    list_filter = ("role", "status", "is_active", "is_staff")
    search_fields = ("username", "email")
    readonly_fields = ("created_at", "updated_at", "last_login")
    
    def profile_lrn(self, obj):
    # Only meaningful for parent/student
        if obj.role != "PARENT_STUDENT":
            return ""
        prof = getattr(obj, "profile", None)
        return getattr(prof, "lrn", "") if prof else ""
    profile_lrn.short_description = "LRN"

    def profile_payment_mode(self, obj):
        if obj.role != "PARENT_STUDENT":
            return ""
        prof = getattr(obj, "profile", None)
        return getattr(prof, "payment_mode", "") if prof else ""
    profile_payment_mode.short_description = "Payment Mode"

    fieldsets = (
        ("Account", {"fields": ("username", "email", "password")}),
        ("Role / Status", {"fields": ("role", "status", "is_active", "is_staff", "is_superuser")}),
        ("Dates", {"fields": ("created_at", "updated_at", "last_login")}),
        # ("Permissions", {"fields": ("groups", "user_permissions")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "role", "status", "is_active", "is_staff"),
        }),
    )

    def get_inlines(self, request, obj=None):
        # Show only relevant inlines by role (cleaner)
        if not obj:
            return []
        if obj.role == "PARENT_STUDENT":
            return [UserProfileInline]
        if obj.role == "TEACHER":
            return [TeacherProfileInline]
        if obj.role == "ADMIN":
            return [AdminProfileInline]
        return []

    def has_profile(self, obj):
        # quick check for your issue: profile missing
        if obj.role == "PARENT_STUDENT":
            return hasattr(obj, "profile")
        if obj.role == "TEACHER":
            return hasattr(obj, "teacher_profile")
        if obj.role == "ADMIN":
            return hasattr(obj, "admin_profile")
        return False
    has_profile.boolean = True
    has_profile.short_description = "Profile?"


# ---------- Register other models for convenience ----------
@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "grade_level")
    search_fields = ("name",)
    list_filter = ("grade_level",)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name")
    search_fields = ("code", "name")


# Optional: manage profiles directly too
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "student_first_name", "student_last_name", "grade_level","lrn",           # ✅
    "payment_mode",  "section")
    search_fields = ("user__username", "user__email", "student_first_name", "student_last_name", "parent_last_name")
    list_filter = ("grade_level",)


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "employee_id", "subject", "section")
    search_fields = ("user__username", "user__email", "employee_id")