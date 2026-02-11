from rest_framework import serializers
from .models import GradeWeight, GradeItem, StudentScore, ClassStanding
from accounts.models import Subject


# ─── Weight Config ───
class GradeWeightSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.code", read_only=True)

    class Meta:
        model = GradeWeight
        fields = [
            "id", "subject", "subject_name", "subject_code",
            "activity_weight", "quiz_weight", "exam_weight",
            "class_standing_weight",
        ]


# ─── Grade Items (Activity / Quiz / Exam) ───
class GradeItemSerializer(serializers.ModelSerializer):
    date_given = serializers.DateField(format="%Y-%m-%d", required=False, allow_null=True)
    due_date = serializers.DateField(format="%Y-%m-%d", required=False, allow_null=True)

    class Meta:
        model = GradeItem
        fields = [
            "id", "teacher", "subject", "grade_level", "quarter",
            "category", "title", "description",
            "date_given", "due_date", "total_score", "order",
            "created_at",
        ]
        read_only_fields = ["teacher", "created_at"]


# ─── Student Scores ───
class StudentScoreSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    grade_item_title = serializers.CharField(source="grade_item.title", read_only=True)
    total_score = serializers.IntegerField(source="grade_item.total_score", read_only=True)

    class Meta:
        model = StudentScore
        fields = [
            "id", "student", "student_name", "grade_item",
            "grade_item_title", "score", "total_score",
        ]

    def get_student_name(self, obj):
        try:
            p = obj.student.profile
            return f"{p.student_first_name} {p.student_last_name}"
        except Exception:
            return obj.student.username


# ─── Class Standing ───
class ClassStandingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = ClassStanding
        fields = ["id", "student", "student_name", "subject", "quarter", "score"]

    def get_student_name(self, obj):
        try:
            p = obj.student.profile
            return f"{p.student_first_name} {p.student_last_name}"
        except Exception:
            return obj.student.username


# ─── Lightweight student list serializer ───
class StudentListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    student_name = serializers.CharField()
    grade_level = serializers.IntegerField()
