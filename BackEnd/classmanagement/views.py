import datetime

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User, Subject, Section, TeacherProfile, UserProfile
from .models import Schedule
from .serializers import ScheduleReadSerializer, ScheduleWriteSerializer


# ══════════════════════════════════════════════════════
# SCHEDULE CRUD
# ══════════════════════════════════════════════════════

class ScheduleListCreate(generics.ListCreateAPIView):
    """
    GET  — list schedules (filterable by ?section=, ?teacher=, ?subject=, ?day=)
    POST — create a single schedule entry (admin only)
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ScheduleWriteSerializer
        return ScheduleReadSerializer

    def get_queryset(self):
        qs = Schedule.objects.select_related("teacher", "subject", "section").all()
        section = self.request.query_params.get("section")
        teacher = self.request.query_params.get("teacher")
        subject = self.request.query_params.get("subject")
        day = self.request.query_params.get("day")
        if section:
            qs = qs.filter(section_id=section)
        if teacher:
            qs = qs.filter(teacher_id=teacher)
        if subject:
            qs = qs.filter(subject_id=subject)
        if day:
            qs = qs.filter(day_of_week=day.upper())
        return qs

    def create(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        ser = ScheduleWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        conflict = self._check_conflicts(ser.validated_data)
        if conflict:
            return Response({"detail": conflict}, status=400)
        self.perform_create(ser)
        obj = Schedule.objects.select_related("teacher", "subject", "section").get(pk=ser.instance.pk)
        return Response(ScheduleReadSerializer(obj).data, status=201)

    @staticmethod
    def _check_conflicts(data, exclude_id=None):
        """Check for teacher or section time overlaps on the same day."""
        day = data["day_of_week"]
        start = data["start_time"]
        end = data["end_time"]

        base = Schedule.objects.filter(day_of_week=day, start_time__lt=end, end_time__gt=start)
        if exclude_id:
            base = base.exclude(pk=exclude_id)

        teacher_conflict = base.filter(teacher=data["teacher"]).first()
        if teacher_conflict:
            return (
                f"Teacher {data['teacher'].username} already has "
                f"{teacher_conflict.subject.name} at "
                f"{teacher_conflict.start_time:%H:%M}\u2013{teacher_conflict.end_time:%H:%M} "
                f"on {teacher_conflict.get_day_of_week_display()}"
            )

        section_conflict = base.filter(section=data["section"]).first()
        if section_conflict:
            return (
                f"Section {data['section'].name} already has "
                f"{section_conflict.subject.name} at "
                f"{section_conflict.start_time:%H:%M}\u2013{section_conflict.end_time:%H:%M} "
                f"on {section_conflict.get_day_of_week_display()}"
            )
        return None


class ScheduleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.select_related("teacher", "subject", "section").all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ScheduleWriteSerializer
        return ScheduleReadSerializer

    def update(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        ser = ScheduleWriteSerializer(instance, data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        merged = {
            **{f: getattr(instance, f) for f in ("teacher", "subject", "section", "day_of_week", "start_time", "end_time")},
            **ser.validated_data,
        }
        if isinstance(merged.get("teacher"), int):
            merged["teacher"] = User.objects.get(pk=merged["teacher"])
        if isinstance(merged.get("section"), int):
            merged["section"] = Section.objects.get(pk=merged["section"])
        conflict = ScheduleListCreate._check_conflicts(merged, exclude_id=instance.pk)
        if conflict:
            return Response({"detail": conflict}, status=400)
        ser.save()
        obj = Schedule.objects.select_related("teacher", "subject", "section").get(pk=instance.pk)
        return Response(ScheduleReadSerializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        return super().destroy(request, *args, **kwargs)


# ══════════════════════════════════════════════════════
# BULK DELETE SCHEDULES
# ══════════════════════════════════════════════════════

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_delete_schedules(request):
    """
    Delete multiple schedules at once.
    Body: { "ids": [1, 2, 3, ...] }
    """
    if request.user.role != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)

    ids = request.data.get("ids", [])
    if not isinstance(ids, list) or len(ids) == 0:
        return Response({"detail": "Provide a non-empty list of ids."}, status=400)

    deleted_count, _ = Schedule.objects.filter(pk__in=ids).delete()
    return Response({"deleted_count": deleted_count})


# ══════════════════════════════════════════════════════
# BULK UPDATE SCHEDULES
# ══════════════════════════════════════════════════════

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_update_schedules(request):
    """
    Update multiple schedules at once. Only the fields supplied will be changed.
    Body: { "ids": [1,2,3], "updates": { "teacher": 5, "day_of_week": "MON", "start_time": "08:00:00", "end_time": "09:00:00", "room": "Room 201" } }
    """
    if request.user.role != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)

    ids = request.data.get("ids", [])
    updates = request.data.get("updates", {})
    if not isinstance(ids, list) or len(ids) == 0:
        return Response({"detail": "Provide a non-empty list of ids."}, status=400)
    if not isinstance(updates, dict) or len(updates) == 0:
        return Response({"detail": "Provide at least one field to update."}, status=400)

    allowed_fields = {"teacher", "subject", "section", "day_of_week", "start_time", "end_time", "room"}
    clean = {}
    for k, v in updates.items():
        if k in allowed_fields and v not in (None, ""):
            if k in ("teacher", "subject", "section"):
                clean[k + "_id"] = int(v)
            else:
                clean[k] = v

    if not clean:
        return Response({"detail": "No valid fields to update."}, status=400)

    updated_count = Schedule.objects.filter(pk__in=ids).update(**clean)
    return Response({"updated_count": updated_count})


# ══════════════════════════════════════════════════════
# AUTO-GENERATE SCHEDULES
# Based on CESI's actual schedule patterns:
# - Kinder: 8:00-11:40 (no afternoon)
# - Grade 1-3: 7:30-3:20, Recess 9:30-9:50, Lunch 11:50-12:30
# - Grade 4-6: 7:30-4:30, Recess 9:30-9:50, Lunch varies
# ══════════════════════════════════════════════════════

def _get_schedule_template(grade_level):
    """
    Returns a list of time slots for a given grade level.
    Each slot is (start_time, end_time, slot_type) where slot_type is 'class', 'recess', or 'lunch'.
    """
    if grade_level == 0:  # Kinder / Preschool
        return [
            (datetime.time(8, 0), datetime.time(8, 45), 'class'),
            (datetime.time(8, 45), datetime.time(9, 30), 'class'),
            (datetime.time(9, 30), datetime.time(9, 50), 'recess'),
            (datetime.time(9, 50), datetime.time(10, 35), 'class'),
            (datetime.time(10, 35), datetime.time(11, 20), 'class'),
            (datetime.time(11, 20), datetime.time(11, 40), 'class'),  # Extension/closing
        ]
    elif grade_level in (1, 2, 3):  # Grade 1-3
        return [
            (datetime.time(7, 30), datetime.time(8, 30), 'class'),   # Period 1 (1 hour)
            (datetime.time(8, 30), datetime.time(9, 30), 'class'),   # Period 2 (1 hour)
            (datetime.time(9, 30), datetime.time(9, 50), 'recess'),  # Recess
            (datetime.time(9, 50), datetime.time(10, 50), 'class'),  # Period 3 (1 hour)
            (datetime.time(10, 50), datetime.time(11, 50), 'class'), # Period 4 (1 hour)
            (datetime.time(11, 50), datetime.time(12, 30), 'lunch'), # Lunch
            (datetime.time(12, 30), datetime.time(13, 10), 'class'), # Period 5 (40 min)
            (datetime.time(13, 10), datetime.time(13, 50), 'class'), # Period 6 (40 min)
            (datetime.time(13, 50), datetime.time(14, 50), 'class'), # Period 7 - Extension (1 hour)
            (datetime.time(14, 50), datetime.time(15, 20), 'class'), # Period 8 - NMP/NRP (30 min)
        ]
    else:  # Grade 4-6
        return [
            (datetime.time(7, 30), datetime.time(8, 30), 'class'),   # Period 1 (1 hour)
            (datetime.time(8, 30), datetime.time(9, 30), 'class'),   # Period 2 (1 hour)
            (datetime.time(9, 30), datetime.time(9, 50), 'recess'),  # Recess
            (datetime.time(9, 50), datetime.time(10, 50), 'class'),  # Period 3 (1 hour)
            (datetime.time(10, 50), datetime.time(12, 0), 'class'),  # Period 4 (1 hr 10 min)
            (datetime.time(12, 0), datetime.time(12, 30), 'lunch'),  # Lunch
            (datetime.time(12, 30), datetime.time(13, 30), 'class'), # Period 5 (1 hour)
            (datetime.time(13, 30), datetime.time(14, 30), 'class'), # Period 6 - Extension (1 hour)
            (datetime.time(14, 30), datetime.time(15, 30), 'class'), # Period 7 (1 hour)
            (datetime.time(15, 30), datetime.time(16, 10), 'class'), # Period 8 (40 min)
            (datetime.time(16, 10), datetime.time(16, 30), 'class'), # Period 9 - NMP/NRP (20 min)
        ]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def auto_generate_schedules(request):
    """
    Auto-generate schedules based on CESI's schedule template.
    Body: { "section": <id> (required) }
    """
    if request.user.role != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)

    section_id = request.data.get("section")
    if not section_id:
        return Response({"detail": "Section is required for auto-generate"}, status=400)

    try:
        section = Section.objects.get(pk=section_id)
    except Section.DoesNotExist:
        return Response({"detail": "Section not found"}, status=404)

    subjects = list(Subject.objects.all())
    if not subjects:
        return Response({"detail": "No subjects to schedule. Please add subjects first."}, status=400)

    # Map subject_id → [User teacher, …]
    teacher_map = {}
    for tp in TeacherProfile.objects.select_related("user", "subject").filter(subject__isnull=False):
        teacher_map.setdefault(tp.subject_id, []).append(tp.user)

    # Get schedule template for this grade level
    template = _get_schedule_template(section.grade_level)
    class_slots = [(start, end) for start, end, slot_type in template if slot_type == 'class']

    days = ["MON", "TUE", "WED", "THU", "FRI"]
    created = []
    subject_index = 0

    for day in days:
        for slot_start, slot_end in class_slots:
            # Skip if slot already occupied
            if Schedule.objects.filter(
                section=section, day_of_week=day,
                start_time__lt=slot_end, end_time__gt=slot_start,
            ).exists():
                continue

            # Find a subject and teacher for this slot
            placed = False
            attempts = 0
            while attempts < len(subjects) and not placed:
                subj = subjects[subject_index % len(subjects)]
                subject_index += 1
                attempts += 1

                # Try to find an available teacher for this subject
                for teacher in teacher_map.get(subj.id, []):
                    # Check if teacher is free at this time
                    if Schedule.objects.filter(
                        teacher=teacher, day_of_week=day,
                        start_time__lt=slot_end, end_time__gt=slot_start,
                    ).exists():
                        continue

                    # Create the schedule entry
                    sched = Schedule.objects.create(
                        teacher=teacher,
                        subject=subj,
                        section=section,
                        day_of_week=day,
                        start_time=slot_start,
                        end_time=slot_end,
                    )
                    created.append(sched.id)
                    placed = True
                    break

    return Response({
        "created_count": len(created),
        "schedule_ids": created,
        "message": f"Generated {len(created)} schedule entries for {section.name} ({len(class_slots)} slots × 5 days = {len(class_slots) * 5} possible slots)"
    }, status=201)


# ══════════════════════════════════════════════════════
# MY SCHEDULE  (teacher or parent/student)
# ══════════════════════════════════════════════════════

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_schedule(request):
    """
    Teachers → their teaching schedule.
    Parents/Students → schedules for their assigned section.
    """
    user = request.user

    if user.role == "TEACHER":
        qs = Schedule.objects.select_related("teacher", "subject", "section").filter(teacher=user)
    elif user.role == "PARENT_STUDENT":
        try:
            profile = user.profile
            if profile.section:
                qs = Schedule.objects.select_related("teacher", "subject", "section").filter(section=profile.section)
            else:
                return Response([])
        except UserProfile.DoesNotExist:
            return Response([])
    else:
        return Response({"detail": "Forbidden"}, status=403)

    return Response(ScheduleReadSerializer(qs, many=True).data)
