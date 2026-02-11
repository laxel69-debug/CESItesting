from django.db import models
from django.conf import settings


# ═══════════════════════════════════════════════
# Grade Category Weights  (editable by teacher)
# ═══════════════════════════════════════════════
class GradeWeight(models.Model):
    """
    Per-subject weight configuration.
    One row per subject — shared across all grade levels.
    Teachers can adjust on a whim from the UI.
    """
    subject = models.OneToOneField(
        "accounts.Subject",
        on_delete=models.CASCADE,
        related_name="grade_weights",
    )
    activity_weight = models.IntegerField(default=40, help_text="% for Activities")
    quiz_weight = models.IntegerField(default=20, help_text="% for Quizzes")
    exam_weight = models.IntegerField(default=20, help_text="% for Exams")
    class_standing_weight = models.IntegerField(default=20, help_text="% for Class Standing")

    def __str__(self):
        return f"Weights({self.subject}): A{self.activity_weight} Q{self.quiz_weight} E{self.exam_weight} CS{self.class_standing_weight}"

    def total(self):
        return self.activity_weight + self.quiz_weight + self.exam_weight + self.class_standing_weight


# ═══════════════════════════════════════════════
# Grade Item  (Activity / Quiz / Exam)
# ═══════════════════════════════════════════════
class GradeItem(models.Model):
    """
    A single gradeable item created by the teacher.
    Can be an Activity, Quiz, or Exam — any number per quarter.
    """
    CATEGORY_CHOICES = [
        ("ACTIVITY", "Activity"),
        ("QUIZ", "Quiz"),
        ("EXAM", "Exam"),
    ]
    QUARTER_CHOICES = [(1, "Q1"), (2, "Q2"), (3, "Q3"), (4, "Q4")]

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="grade_items",
        limit_choices_to={"role": "TEACHER"},
    )
    subject = models.ForeignKey(
        "accounts.Subject",
        on_delete=models.CASCADE,
        related_name="grade_items",
    )
    grade_level = models.IntegerField(help_text="0=Kinder, 1-6=Grade 1-6")
    quarter = models.IntegerField(choices=QUARTER_CHOICES)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=150, help_text="e.g. Activity 1, Quiz 3")
    description = models.TextField(blank=True, default="")
    date_given = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    total_score = models.IntegerField(default=100, help_text="Max possible score")
    order = models.IntegerField(default=0, help_text="Display order within category")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["quarter", "category", "order", "id"]

    def __str__(self):
        return f"{self.get_category_display()} — {self.title} (Q{self.quarter}, G{self.grade_level})"


# ═══════════════════════════════════════════════
# Student Score  (one per student per GradeItem)
# ═══════════════════════════════════════════════
class StudentScore(models.Model):
    """
    The score a specific student received for a GradeItem.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="scores",
        limit_choices_to={"role": "PARENT_STUDENT"},
    )
    grade_item = models.ForeignKey(
        GradeItem,
        on_delete=models.CASCADE,
        related_name="scores",
    )
    score = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "grade_item")

    def __str__(self):
        return f"{self.student.username} → {self.grade_item.title}: {self.score}/{self.grade_item.total_score}"


# ═══════════════════════════════════════════════
# Class Standing  (one per student per quarter)
# ═══════════════════════════════════════════════
class ClassStanding(models.Model):
    """
    Single class-standing score per student per subject per quarter.
    """
    QUARTER_CHOICES = [(1, "Q1"), (2, "Q2"), (3, "Q3"), (4, "Q4")]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="class_standings",
        limit_choices_to={"role": "PARENT_STUDENT"},
    )
    subject = models.ForeignKey(
        "accounts.Subject",
        on_delete=models.CASCADE,
        related_name="class_standings",
    )
    quarter = models.IntegerField(choices=QUARTER_CHOICES)
    score = models.DecimalField(max_digits=5, decimal_places=2, help_text="Score out of 100")

    class Meta:
        unique_together = ("student", "subject", "quarter")

    def __str__(self):
        return f"CS: {self.student.username} Q{self.quarter} {self.subject}: {self.score}"
