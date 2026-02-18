from django.db import models
from django.contrib.auth.models import BaseUserManager, PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils import timezone

# =========================
# User Manager
# =========================
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, role="PARENT_STUDENT", **extra_fields):
        if not username:
            raise ValueError("Username required")
        if not email:
            raise ValueError("Email required")

        email = self.normalize_email(email)

        user = self.model(
            username=username,
            email=email,
            role=role,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        user = self.create_user(
            username=username,
            email=email,
            password=password,
            role="ADMIN",
            **extra_fields
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user


# =========================
# Base User
# =========================
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("TEACHER", "Teacher"),
        ("PARENT_STUDENT", "Parent & Student"),
    )

    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
        ("SUSPENDED", "Suspended"),
    )

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)  # keep unique (good for real systems)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="PARENT_STUDENT")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ACTIVE")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)  # avoids prompt on existing rows
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username


# =========================
# Subject & Section
# =========================
class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Section(models.Model):
    name = models.CharField(max_length=50)
    grade_level = models.IntegerField()

    # Adviser is a teacher profile (optional) — give related_name to avoid clashes
    adviser = models.OneToOneField(
        "TeacherProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="adviser_of_section",
    )

    def __str__(self):
        return f"G{self.grade_level}-{self.name}"


# =========================
# Common Profile (Parent+Student)
# =========================
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
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
    # Student Info
    student_first_name = models.CharField(max_length=50)
    student_middle_name = models.CharField(max_length=50, blank=True, null=True)
    student_last_name = models.CharField(max_length=50)
    grade_level = models.CharField(max_length=20, choices=GRADE_LEVEL_CHOICES)
    lrn = models.CharField(max_length=20, blank=True, null=True)
    student_number = models.CharField(max_length=20, blank=True, null=True)
    payment_mode = models.CharField(max_length=20, blank=True, null=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True, related_name="students")

    # Parent Info
    parent_first_name = models.CharField(max_length=50)
    parent_middle_name = models.CharField(max_length=50, blank=True, null=True)
    parent_last_name = models.CharField(max_length=50)

    contact_number = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return f"{self.student_first_name} {self.student_last_name} / Parent: {self.parent_last_name}"


# =========================
# Admin Profile
# =========================
class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")
    permissions_level = models.CharField(max_length=50, blank=True, default="")

    def __str__(self):
        return f"AdminProfile({self.user.username})"


# =========================
# Teacher Profile
# =========================
class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher_profile")

    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name="teachers")

    # teacher assigned to a section (NOT adviser); avoid clash with Section.adviser reverse name
    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_teachers",
    )

    employee_id = models.CharField(max_length=50, blank=True, default="")

    def __str__(self):
        return f"TeacherProfile({self.user.username})"
