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
# ══════════════════════════════════════════════════════

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def auto_generate_schedules(request):
    """
    Auto-generate schedules for empty slots.
    Body: { "section": <id> (optional — all sections if omitted) }
    Fills Mon-Fri 8 AM – 3 PM in 1-hour blocks.
    """
    if request.user.role != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)

    section_id = request.data.get("section")
    sections = Section.objects.all()
    if section_id:
        sections = sections.filter(pk=section_id)
    if not sections.exists():
        return Response({"detail": "No sections found"}, status=404)

    subjects = list(Subject.objects.all())
    if not subjects:
        return Response({"detail": "No subjects to schedule"}, status=400)

    # Map subject_id → [User teacher, …]
    teacher_map = {}
    for tp in TeacherProfile.objects.select_related("user", "subject").filter(subject__isnull=False):
        teacher_map.setdefault(tp.subject_id, []).append(tp.user)

    days = ["MON", "TUE", "WED", "THU", "FRI"]
    start_hour = 8
    end_hour = 15  # 3 PM

    created = []

    for section in sections:
        for day in days:
            for hour in range(start_hour, end_hour):
                slot_start = datetime.time(hour, 0)
                slot_end = datetime.time(hour + 1, 0)

                # Skip if slot already occupied
                if Schedule.objects.filter(
                    section=section, day_of_week=day,
                    start_time__lt=slot_end, end_time__gt=slot_start,
                ).exists():
                    continue

                placed = False
                for subj in subjects:
                    # Cap at ~5 slots per week per section per subject
                    if Schedule.objects.filter(section=section, subject=subj).count() >= 5:
                        continue

                    for teacher in teacher_map.get(subj.id, []):
                        if Schedule.objects.filter(
                            teacher=teacher, day_of_week=day,
                            start_time__lt=slot_end, end_time__gt=slot_start,
                        ).exists():
                            continue

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
                    if placed:
                        break

    return Response({"created_count": len(created), "schedule_ids": created}, status=201)


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
