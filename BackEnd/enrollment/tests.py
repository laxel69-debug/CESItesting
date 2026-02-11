from django.test import TestCase
from accounts.models import User, Section
from .models import Enrollment


class EnrollmentModelTest(TestCase):
    def setUp(self):
        # Create a test student
        self.student = User.objects.create_user(
            username="student1",
            email="student1@test.com",
            password="testpass123",
            role="PARENT_STUDENT"
        )
        
        # Create a test section
        self.section = Section.objects.create(
            name="Section A",
            grade_level=1
        )
    
    def test_create_enrollment(self):
        """Test creating an enrollment"""
        enrollment = Enrollment.objects.create(
            student=self.student,
            section=self.section,
            grade_level=1,
            status="ACTIVE"
        )
        self.assertEqual(enrollment.student, self.student)
        self.assertEqual(enrollment.section, self.section)
        self.assertEqual(enrollment.status, "ACTIVE")
    
    def test_enrollment_string_representation(self):
        """Test string representation of enrollment"""
        enrollment = Enrollment.objects.create(
            student=self.student,
            section=self.section,
            grade_level=1,
            status="ACTIVE"
        )
        expected_str = f"{self.student.username} - Grade 1 ({self.section.name}) - 2024-2025"
        self.assertEqual(str(enrollment), expected_str)
