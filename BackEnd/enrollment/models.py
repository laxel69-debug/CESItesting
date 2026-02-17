# enrollment/models.py
from django.conf import settings
from django.db import models
from django.utils import timezone
from accounts.models import Section  # keep if your Section is in accounts


class Enrollment(models.Model):
    """
    Enrollment model tracks which students are enrolled.
    Includes all student info from the enrollment form.
    """
    
    GRADE_LEVEL_CHOICES = [
        ("prek", "Pre-Kinder"),
        ("kinder", "Kinder"),
        ("grade1", "Grade 1"),
        ("grade2", "Grade 2"),
        ("grade3", "Grade 3"),
        ("grade4", "Grade 4"),
        ("grade5", "Grade 5"),
        ("grade6", "Grade 6"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("DROPPED", "Dropped"),
    ]

    PAYMENT_MODE_CHOICES = [
        ("cash", "Cash"),
        ("installment", "Installment"),
    ]

    STUDENT_TYPE_CHOICES = [
        ("new", "New / Transferee"),
        ("old", "Old Student"),
    ]

    EDUCATION_LEVEL_CHOICES = [
        ("preschool", "Preschool"),
        ("elementary", "Elementary"),
    ]

    # ✅ Parent portal account (ALLOW multiple enrollments / kids per parent)
    parent_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="parent_enrollments",
    )

    # ✅ Student user (you set this to public_user during public create)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )

    # ✅ Safer: do not delete enrollment if section is deleted
    section = models.ForeignKey(
        Section,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="enrollments",
    )

    # Academic
    grade_level = models.CharField(max_length=20, choices=GRADE_LEVEL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    academic_year = models.CharField(max_length=10, default="2024-2025")

    student_type = models.CharField(
        max_length=10, choices=STUDENT_TYPE_CHOICES, blank=True, null=True
    )
    education_level = models.CharField(
        max_length=20, choices=EDUCATION_LEVEL_CHOICES, blank=True, null=True
    )

    # Student Info
    lrn = models.CharField(max_length=20, blank=True, null=True)
    student_number = models.CharField(max_length=20,blank=True,null=True,unique=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)

    # Contact Info
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    religion = models.CharField(max_length=50, blank=True, null=True)
    telephone_number = models.CharField(max_length=20, blank=True, null=True)
    mobile_number = models.CharField(max_length=20, blank=True, null=True)
    parent_facebook = models.CharField(max_length=100, blank=True, null=True)

    # Payment / Tracking
    payment_mode = models.CharField(
        max_length=20, choices=PAYMENT_MODE_CHOICES, blank=True, null=True
    )
    enrolled_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-enrolled_at"]
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.grade_level}"


class ParentInfo(models.Model):
    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="parent_info",
    )

    father_name = models.CharField(max_length=100, blank=True, null=True)
    father_contact = models.CharField(max_length=20, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)

    mother_name = models.CharField(max_length=100, blank=True, null=True)
    mother_contact = models.CharField(max_length=20, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)

    guardian_name = models.CharField(max_length=100, blank=True, null=True)
    guardian_contact = models.CharField(max_length=20, blank=True, null=True)
    guardian_relationship = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Parent Info - {self.enrollment}"
    
    
    
# from django.db.models import Count
# from enrollment.models import Enrollment

# dups = (Enrollment.objects.exclude(student_number__isnull=True).exclude(student_number__exact="").values("student_number").annotate(c=Count("id")).filter(c__gt=1))

# for row in dups:
#     sn = row["student_number"]
#     qs = Enrollment.objects.filter(student_number=sn).order_by("id")
#     first = qs.first()               # keep this one
#     for e in qs.exclude(id=first.id):  # clear others
#         e.student_number = None
#         e.save(update_fields=["student_number"])

# print("done fixing duplicates:", dups.count())