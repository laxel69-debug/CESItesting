from rest_framework import serializers
from .models import Schedule


class ScheduleReadSerializer(serializers.ModelSerializer):
    """Read-only schedule with nested human-readable names."""
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)
    section_name = serializers.CharField(source="section.name", read_only=True)
    grade_level = serializers.IntegerField(source="section.grade_level", read_only=True)

    class Meta:
        model = Schedule
        fields = [
            "id", "teacher", "teacher_name",
            "subject", "subject_name", "subject_code",
            "section", "section_name", "grade_level",
            "day_of_week", "start_time", "end_time", "room",
        ]


class ScheduleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = [
            "id", "teacher", "subject", "section",
            "day_of_week", "start_time", "end_time", "room",
        ]

    def validate(self, data):
        start = data.get("start_time") or (self.instance and self.instance.start_time)
        end = data.get("end_time") or (self.instance and self.instance.end_time)
        if start and end and start >= end:
            raise serializers.ValidationError("end_time must be after start_time")
        return data
