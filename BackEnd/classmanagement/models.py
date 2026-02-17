from django.db import models
from django.conf import settings


class Schedule(models.Model):
    """
    A single timetable entry: one teacher teaches one subject
    in one section on a given day / time-slot.
    """
    DAY_CHOICES = [
        ("MON", "Monday"),
        ("TUE", "Tuesday"),
        ("WED", "Wednesday"),
        ("THU", "Thursday"),
        ("FRI", "Friday"),
    ]

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="schedules",
        limit_choices_to={"role": "TEACHER"},
    )
    subject = models.ForeignKey(
        "accounts.Subject",
        on_delete=models.CASCADE,
        related_name="schedules",
    )
    section = models.ForeignKey(
        "accounts.Section",
        on_delete=models.CASCADE,
        related_name="schedules",
    )
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        ordering = ["section", "day_of_week", "start_time"]

    def __str__(self):
        return (
            f"{self.teacher.username} — {self.subject.name} "
            f"@ {self.section.name} ({self.get_day_of_week_display()} "
            f"{self.start_time:%H:%M}–{self.end_time:%H:%M})"
        )
