from rest_framework import serializers
from .models import AttendanceRecord
from accounts.models import Section


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    section_name = serializers.CharField(source="section.name", read_only=True)
    marked_by_name = serializers.CharField(source="marked_by.username", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "student",
            "student_name",
            "section",
            "section_name",
            "date",
            "status",
            "marked_by",
            "marked_by_name",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "marked_by"]

    def get_student_name(self, obj):
        if hasattr(obj.student, "profile") and obj.student.profile:
            p = obj.student.profile
            if p.student_first_name and p.student_last_name:
                return f"{p.student_first_name} {p.student_last_name}"
        return obj.student.username


class BulkAttendanceSerializer(serializers.Serializer):
    """
    For bulk creating/updating attendance records.
    """
    section = serializers.IntegerField()
    date = serializers.DateField()
    records = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(allow_blank=True),
        )
    )

    def validate_records(self, data):
        for record in data:
            if "student_id" not in record:
                raise serializers.ValidationError("Each record must have a student_id")
            if "status" not in record:
                raise serializers.ValidationError("Each record must have a status")
            if record["status"] not in ["PRESENT", "ABSENT", "LATE", "EXCUSED"]:
                raise serializers.ValidationError(f"Invalid status: {record['status']}")
        return data


class SectionSimpleSerializer(serializers.ModelSerializer):
    """Simple serializer for sections the teacher teaches."""
    grade_level = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ["id", "name", "grade_level"]

    def get_grade_level(self, obj):
        """Convert grade_level integer to readable name."""
        gl = obj.grade_level
        if gl == 0:
            return "Kinder"
        return f"Grade {gl}"


class StudentAttendanceStatsSerializer(serializers.Serializer):
    """For returning attendance statistics."""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    total = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    excused = serializers.IntegerField()
    attended = serializers.IntegerField()
    percentage = serializers.FloatField(allow_null=True)
