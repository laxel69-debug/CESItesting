from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Sum
from decimal import Decimal

from .models import GradeWeight, GradeItem, StudentScore, ClassStanding
from .serializers import (
    GradeWeightSerializer,
    GradeItemSerializer,
    StudentScoreSerializer,
    ClassStandingSerializer,
)
from accounts.models import User, UserProfile, Subject


# ══════════════════════════════════════════════════════
# WEIGHTS  —  get / update per subject
# ══════════════════════════════════════════════════════
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_weights(request, subject_id):
    """Return weights for a subject. Auto-creates defaults if missing."""
    try:
        subject = Subject.objects.get(pk=subject_id)
    except Subject.DoesNotExist:
        return Response({"detail": "Subject not found"}, status=404)
    weight, _ = GradeWeight.objects.get_or_create(subject=subject)
    return Response(GradeWeightSerializer(weight).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_weights(request, subject_id):
    """Teacher updates the weight percentages."""
    if getattr(request.user, "role", None) != "TEACHER":
        return Response({"detail": "Forbidden"}, status=403)
    try:
        subject = Subject.objects.get(pk=subject_id)
    except Subject.DoesNotExist:
        return Response({"detail": "Subject not found"}, status=404)
    weight, _ = GradeWeight.objects.get_or_create(subject=subject)
    ser = GradeWeightSerializer(weight, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(ser.data)


# ══════════════════════════════════════════════════════
# GRADE ITEMS  —  CRUD
# ══════════════════════════════════════════════════════
class GradeItemListCreate(generics.ListCreateAPIView):
    serializer_class = GradeItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = GradeItem.objects.all()
        subject = self.request.query_params.get("subject")
        grade_level = self.request.query_params.get("grade_level")
        quarter = self.request.query_params.get("quarter")
        category = self.request.query_params.get("category")
        if subject:
            qs = qs.filter(subject_id=subject)
        if grade_level is not None:
            qs = qs.filter(grade_level=grade_level)
        if quarter:
            qs = qs.filter(quarter=quarter)
        if category:
            qs = qs.filter(category=category.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class GradeItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = GradeItem.objects.all()
    serializer_class = GradeItemSerializer
    permission_classes = [IsAuthenticated]


# ══════════════════════════════════════════════════════
# STUDENT SCORES  —  CRUD + bulk upsert
# ══════════════════════════════════════════════════════
class StudentScoreListCreate(generics.ListCreateAPIView):
    serializer_class = StudentScoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = StudentScore.objects.select_related("student", "grade_item").all()
        grade_item = self.request.query_params.get("grade_item")
        student = self.request.query_params.get("student")
        # Filter by subject + grade_level + quarter (for fetching all scores for a view)
        subject = self.request.query_params.get("subject")
        grade_level = self.request.query_params.get("grade_level")
        quarter = self.request.query_params.get("quarter")
        if grade_item:
            qs = qs.filter(grade_item_id=grade_item)
        if student:
            qs = qs.filter(student_id=student)
        if subject:
            qs = qs.filter(grade_item__subject_id=subject)
        if grade_level is not None:
            qs = qs.filter(grade_item__grade_level=grade_level)
        if quarter:
            qs = qs.filter(grade_item__quarter=quarter)
        return qs


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upsert_score(request):
    """
    Create or update a single score.
    Body: { student, grade_item, score }
    """
    student_id = request.data.get("student")
    grade_item_id = request.data.get("grade_item")
    score_val = request.data.get("score")

    if not all([student_id, grade_item_id, score_val is not None]):
        return Response({"detail": "student, grade_item, score required"}, status=400)

    try:
        grade_item = GradeItem.objects.get(pk=grade_item_id)
    except GradeItem.DoesNotExist:
        return Response({"detail": "Grade item not found"}, status=404)

    obj, created = StudentScore.objects.update_or_create(
        student_id=student_id,
        grade_item=grade_item,
        defaults={"score": score_val},
    )
    return Response(StudentScoreSerializer(obj).data, status=status.HTTP_200_OK)


# ══════════════════════════════════════════════════════
# CLASS STANDING  —  upsert
# ══════════════════════════════════════════════════════
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upsert_class_standing(request):
    """
    Create or update class standing.
    Body: { student, subject, quarter, score }
    """
    student_id = request.data.get("student")
    subject_id = request.data.get("subject")
    quarter = request.data.get("quarter")
    score_val = request.data.get("score")

    if not all([student_id, subject_id, quarter, score_val is not None]):
        return Response({"detail": "student, subject, quarter, score required"}, status=400)

    obj, _ = ClassStanding.objects.update_or_create(
        student_id=student_id,
        subject_id=subject_id,
        quarter=quarter,
        defaults={"score": score_val},
    )
    return Response(ClassStandingSerializer(obj).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_class_standings(request):
    qs = ClassStanding.objects.all()
    subject = request.query_params.get("subject")
    quarter = request.query_params.get("quarter")
    student = request.query_params.get("student")
    if subject:
        qs = qs.filter(subject_id=subject)
    if quarter:
        qs = qs.filter(quarter=quarter)
    if student:
        qs = qs.filter(student_id=student)
    return Response(ClassStandingSerializer(qs, many=True).data)


# ══════════════════════════════════════════════════════
# STUDENTS LIST  —  by grade level
# ══════════════════════════════════════════════════════
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def students_by_grade(request, grade_level):
    """Return students enrolled in a given grade level."""
    profiles = UserProfile.objects.filter(
        grade_level=grade_level,
        user__role="PARENT_STUDENT",
    ).select_related("user")
    result = []
    for p in profiles:
        result.append({
            "id": p.user.id,
            "username": p.user.username,
            "student_name": f"{p.student_first_name} {p.student_last_name}",
            "grade_level": p.grade_level,
        })
    return Response(result)


# ══════════════════════════════════════════════════════
# COMPUTE QUARTER GRADE  (live computation)
# ══════════════════════════════════════════════════════
def _compute_quarter_grade(student_id, subject_id, quarter):
    """
    Compute the weighted quarter grade for one student.
    Returns dict with category averages + weighted total.
    """
    # Get weights
    try:
        w = GradeWeight.objects.get(subject_id=subject_id)
    except GradeWeight.DoesNotExist:
        w = None
    aw = w.activity_weight if w else 40
    qw = w.quiz_weight if w else 20
    ew = w.exam_weight if w else 20
    cw = w.class_standing_weight if w else 20

    def _avg(category):
        items = GradeItem.objects.filter(
            subject_id=subject_id, quarter=quarter, category=category
        )
        if not items.exists():
            return None
        scores = StudentScore.objects.filter(
            student_id=student_id, grade_item__in=items
        )
        if not scores.exists():
            return None
        # Weighted by each item's total_score:
        # percentage = sum(score) / sum(total_score) * 100
        total_earned = sum(s.score for s in scores)
        total_possible = sum(s.grade_item.total_score for s in scores.select_related("grade_item"))
        if total_possible == 0:
            return Decimal("0")
        return (Decimal(str(total_earned)) / Decimal(str(total_possible))) * 100

    act_avg = _avg("ACTIVITY")
    quiz_avg = _avg("QUIZ")
    exam_avg = _avg("EXAM")

    # Class standing
    try:
        cs = ClassStanding.objects.get(
            student_id=student_id, subject_id=subject_id, quarter=quarter
        )
        cs_score = cs.score
    except ClassStanding.DoesNotExist:
        cs_score = None

    # Weighted total (only include categories that have data)
    components = []
    if act_avg is not None:
        components.append((act_avg, aw))
    if quiz_avg is not None:
        components.append((quiz_avg, qw))
    if exam_avg is not None:
        components.append((exam_avg, ew))
    if cs_score is not None:
        components.append((Decimal(str(cs_score)), cw))

    if not components:
        weighted_total = None
    else:
        total_weight = sum(c[1] for c in components)
        if total_weight > 0:
            weighted_total = sum(val * wt for val, wt in components) / Decimal(str(total_weight)) * 100 / 100
        else:
            weighted_total = None

    return {
        "activity_avg": round(float(act_avg), 2) if act_avg is not None else None,
        "quiz_avg": round(float(quiz_avg), 2) if quiz_avg is not None else None,
        "exam_avg": round(float(exam_avg), 2) if exam_avg is not None else None,
        "class_standing": round(float(cs_score), 2) if cs_score is not None else None,
        "quarter_grade": round(float(weighted_total), 2) if weighted_total is not None else None,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_quarter_grades(request, student_id, subject_id):
    """
    Return computed grades for all 4 quarters + final average for one student.
    Used by both teacher and parent views.
    """
    quarters = {}
    final_parts = []
    for q in range(1, 5):
        data = _compute_quarter_grade(student_id, subject_id, q)
        quarters[f"q{q}"] = data
        if data["quarter_grade"] is not None:
            final_parts.append(data["quarter_grade"])

    final_grade = round(sum(final_parts) / len(final_parts), 2) if final_parts else None

    return Response({
        "student_id": student_id,
        "subject_id": subject_id,
        "quarters": quarters,
        "final_grade": final_grade,
        "remarks": "PASSED" if final_grade and final_grade >= 75 else ("FAILED" if final_grade else None),
    })


# ══════════════════════════════════════════════════════
# PARENT  —  my child's report card
# ══════════════════════════════════════════════════════
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_grades(request):
    """
    Parent sees their child's grades across ALL subjects.
    Returns a card-style payload: per subject → per quarter final + overall.
    """
    user = request.user
    if user.role != "PARENT_STUDENT":
        return Response({"detail": "Forbidden"}, status=403)

    subjects = Subject.objects.all()
    result = []
    for subj in subjects:
        quarters = {}
        parts = []
        for q in range(1, 5):
            data = _compute_quarter_grade(user.id, subj.id, q)
            quarters[f"q{q}"] = data["quarter_grade"]
            if data["quarter_grade"] is not None:
                parts.append(data["quarter_grade"])
        final = round(sum(parts) / len(parts), 2) if parts else None
        result.append({
            "subject_id": subj.id,
            "subject_name": subj.name,
            "subject_code": subj.code,
            "q1": quarters["q1"],
            "q2": quarters["q2"],
            "q3": quarters["q3"],
            "q4": quarters["q4"],
            "final_grade": final,
            "remarks": "PASSED" if final and final >= 75 else ("FAILED" if final else None),
        })
    return Response(result)


# ══════════════════════════════════════════════════════
# TEACHER  —  subject info for logged-in teacher
# ══════════════════════════════════════════════════════
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_info(request):
    """Return the teacher's assigned subject."""
    user = request.user
    if user.role != "TEACHER":
        return Response({"detail": "Forbidden"}, status=403)
    try:
        tp = user.teacher_profile
        if tp.subject:
            return Response({
                "subject_id": tp.subject.id,
                "subject_name": tp.subject.name,
                "subject_code": tp.subject.code,
            })
        return Response({"detail": "No subject assigned"}, status=404)
    except Exception:
        return Response({"detail": "Teacher profile not found"}, status=404)

