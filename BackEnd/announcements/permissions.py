# announcements/permissions.py
from rest_framework.permissions import BasePermission

class IsTeacherOrAdmin(BasePermission):
    message = "Only teachers or admins can post announcements."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # admin = staff or superuser
        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return True

        # teacher role (based on your login structure)
        return getattr(user, "role", None) == "teachers" or getattr(user, "role", None) == "teacher"
