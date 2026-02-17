from django.db import models
from django.conf import settings


class AttendanceRecord(models.Model):
    """
    Daily attendance record for a student.
    One record per student per date.
    """
    STATUS_CHOICES = [
        ("PRESENT", "Present"),
        ("ABSENT", "Absent"),
        ("LATE", "Late"),
        ("EXCUSED", "Excused"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attendance_records",
        limit_choices_to={"role": "PARENT_STUDENT"},
    )
    section = models.ForeignKey(
        "accounts.Section",
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PRESENT")
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="attendance_marked",
        limit_choices_to={"role": "TEACHER"},
    )
    notes = models.TextField(blank=True, default="", help_text="Optional notes (e.g., reason for absence)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "date")
        ordering = ["-date", "student__username"]

    def __str__(self):
        return f"{self.student.username} - {self.date} - {self.status}"

    @classmethod
    def get_student_attendance_stats(cls, student_id, quarter_start, quarter_end):
        """
        Calculate attendance stats for a student within a date range.
        Returns dict with counts and percentage.
        """
        records = cls.objects.filter(
            student_id=student_id,
            date__gte=quarter_start,
            date__lte=quarter_end,
        )
        total = records.count()
        if total == 0:
            return {"total": 0, "present": 0, "absent": 0, "late": 0, "excused": 0, "percentage": None}

        present = records.filter(status="PRESENT").count()
        absent = records.filter(status="ABSENT").count()
        late = records.filter(status="LATE").count()
        excused = records.filter(status="EXCUSED").count()

        # For grade: Present + Late + Excused counts as "attended"
        attended = present + late + excused
        percentage = (attended / total) * 100 if total > 0 else 0

        return {
            "total": total,
            "present": present,
            "absent": absent,
            "late": late,
            "excused": excused,
            "attended": attended,
            "percentage": round(percentage, 2),
        }
