# announcements/admin.py
from django.contrib import admin

from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Announcement, AnnouncementMedia



class AnnouncementMediaInline(admin.TabularInline):
    model = AnnouncementMedia
    extra = 1
    fields = ("file", "preview", "caption", "uploaded_at")
    readonly_fields = ("preview", "uploaded_at")

    def preview(self, obj):
        if not obj or not obj.file:
            return "-"

        url = obj.file.url
        name = str(obj.file.name).lower()

        # Image preview
        if name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
            return format_html(
                '<a href="{0}" target="_blank">'
                '<img src="{0}" style="max-height:120px; max-width:180px; border-radius:8px;" />'
                "</a>",
                url,
            )

        # Video preview
        if name.endswith((".mp4", ".webm", ".ogg", ".mov")):
            return format_html(
                '<video controls style="max-height:140px; max-width:220px; border-radius:8px;">'
                '<source src="{0}">'
                "Your browser does not support the video tag."
                "</video>",
                url,
            )

        # Fallback: file link
        return format_html('<a href="{0}" target="_blank">Open file</a>', url)

    preview.short_description = "Preview"

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    inlines = [AnnouncementMediaInline]

    list_display = (
        "id",
        "title",
        "target_role",
        "publish_date",
        "is_active",
        "media_count",   # 👈 media count column
        "created_by",
        "created_at",
    )

    list_filter = ("target_role", "is_active")
    search_fields = ("title", "content")
    ordering = ("-publish_date",)

    exclude = ("created_by",)
    readonly_fields = ("created_at",)

    def media_count(self, obj):
        return obj.media.count()

    media_count.short_description = "Media"

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
