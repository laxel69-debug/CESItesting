from rest_framework import serializers
from .models import Enrollment
from accounts.models import User, Section
from accounts.serializers import UserSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model"""
    student_username = serializers.CharField(source="student.username", read_only=True)
    student_email = serializers.CharField(source="student.email", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_username",
            "student_email",
            "section",
            "section_name",
            "grade_level",
            "status",
            "enrolled_at",
            "completed_at",
            "academic_year",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "enrolled_at"]


class EnrollmentDetailedSerializer(serializers.ModelSerializer):
    """Detailed enrollment serializer with full student and section info"""
    student = UserSerializer(read_only=True)
    section_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "section",
            "section_details",
            "grade_level",
            "status",
            "enrolled_at",
            "completed_at",
            "academic_year",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "enrolled_at"]
    
    def get_section_details(self, obj):
        return {
            "id": obj.section.id,
            "name": obj.section.name,
            "grade_level": obj.section.grade_level,
        }


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating enrollments"""
    class Meta:
        model = Enrollment
        fields = [
            "student",
            "section",
            "grade_level",
            "status",
            "academic_year",
            "remarks",
        ]
    
    def validate(self, data):
        """Validate that student has PARENT_STUDENT role"""
        student = data.get("student")
        if student and student.role != "PARENT_STUDENT":
            raise serializers.ValidationError("Only PARENT_STUDENT users can be enrolled.")
        return data
