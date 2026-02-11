from django.db import models
from accounts.models import User, Section
from django.utils import timezone


class Enrollment(models.Model):
    """
    Enrollment model tracks which students are enrolled in which sections/grades.
    Supports grades 1-6 for elementary school.
    """
    
    GRADE_CHOICES = (
        (1, "Grade 1"),
        (2, "Grade 2"),
        (3, "Grade 3"),
        (4, "Grade 4"),
        (5, "Grade 5"),
        (6, "Grade 6"),
    )
    
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("DROPPED", "Dropped"),
        ("PENDING", "Pending"),
    )
    
    # Link to student user
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments",
        limit_choices_to={"role": "PARENT_STUDENT"}
    )
    
    # Link to section
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    
    # Grade level (1-6)
    grade_level = models.IntegerField(choices=GRADE_CHOICES)
    
    # Enrollment status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    
    # Enrollment date
    enrolled_at = models.DateTimeField(default=timezone.now)
    
    # Completion/dropout date (optional)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Academic year (e.g., "2024-2025")
    academic_year = models.CharField(max_length=10, default="2024-2025")
    
    # Notes or remarks
    remarks = models.TextField(blank=True, null=True)
    
    # Track creation and updates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ("student", "section", "grade_level", "academic_year")
        ordering = ["-enrolled_at"]
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
    
    def __str__(self):
        return f"{self.student.username} - Grade {self.grade_level} ({self.section.name}) - {self.academic_year}"
