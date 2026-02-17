import os
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTS = {".mp4", ".webm", ".ogg", ".mov"}  # browser-friendly

def validate_media_file_extension(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in (ALLOWED_IMAGE_EXTS | ALLOWED_VIDEO_EXTS):
        raise ValidationError(
            f"Unsupported file type: {ext}. "
            f"Allowed images: {', '.join(sorted(ALLOWED_IMAGE_EXTS))}. "
            f"Allowed videos: {', '.join(sorted(ALLOWED_VIDEO_EXTS))}."
        )

def validate_file_size(value):
    max_mb = 25  # change as you want
    if value.size > max_mb * 1024 * 1024:
        raise ValidationError(f"File too large. Max size is {max_mb}MB.")

class Announcement(models.Model):
    TARGET_CHOICES = [
        ("all", "Public (All)"),
        ("teachers", "Teachers"),
        ("parent_student", "Parent / Student"),
    ]

    title = models.CharField(max_length=255)
    content = models.TextField()

    target_role = models.CharField(
        max_length=20,
        choices=TARGET_CHOICES,
        default="all",
    )

    publish_date = models.DateTimeField()

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="announcements",
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class AnnouncementMedia(models.Model):
    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name="media"
    )
    file = models.FileField(
        upload_to="announcements/",
        validators=[validate_media_file_extension, validate_file_size]
    )
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Media for {self.announcement_id}"
