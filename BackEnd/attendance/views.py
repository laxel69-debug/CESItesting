from datetime import date
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q

from .models import AttendanceRecord
from .serializers import (
    AttendanceRecordSerializer,
    BulkAttendanceSerializer,
    SectionSimpleSerializer,
)
from accounts.models import Section, User


class TeacherSectionsView(APIView):
    """
    Get sections that the current teacher teaches.
    Based on class schedules assigned to them.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "TEACHER":
            return Response(
                {"error": "Only teachers can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get sections from teacher's schedules
        from classmanagement.models import ClassSchedule
        schedule_section_ids = ClassSchedule.objects.filter(
            teacher=user
        ).values_list("section_id", flat=True).distinct()

        sections = Section.objects.filter(id__in=schedule_section_ids).select_related("grade_level")
        serializer = SectionSimpleSerializer(sections, many=True)
        return Response(serializer.data)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for attendance records.
    """
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = AttendanceRecord.objects.select_related(
            "student", "student__profile", "section", "marked_by"
        )

        # Filter by section if provided
        section_id = self.request.query_params.get("section")
        if section_id:
            queryset = queryset.filter(section_id=section_id)

        # Filter by date if provided
        date_param = self.request.query_params.get("date")
        if date_param:
            queryset = queryset.filter(date=date_param)

        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=["post"])
    def bulk_upsert(self, request):
        """
        Create or update attendance records in bulk.
        Expected payload:
        {
            "section": 1,
            "date": "2025-01-15",
            "records": [
                {"student_id": 10, "status": "PRESENT", "notes": ""},
                {"student_id": 11, "status": "ABSENT", "notes": "Sick"},
            ]
        }
        """
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_id = serializer.validated_data["section"]
        record_date = serializer.validated_data["date"]
        records = serializer.validated_data["records"]

        created_count = 0
        updated_count = 0

        for record_data in records:
            student_id = record_data["student_id"]
            status_value = record_data["status"]
            notes = record_data.get("notes", "")

            obj, created = AttendanceRecord.objects.update_or_create(
                student_id=student_id,
                date=record_date,
                defaults={
                    "section_id": section_id,
                    "status": status_value,
                    "notes": notes,
                    "marked_by": request.user,
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        return Response({
            "message": f"Attendance saved: {created_count} created, {updated_count} updated",
            "created": created_count,
            "updated": updated_count,
        })

    @action(detail=False, methods=["get"])
    def section_students(self, request):
        """
        Get all students enrolled in a section.
        Used to populate the attendance list.
        """
        section_id = request.query_params.get("section")
        if not section_id:
            return Response(
                {"error": "section parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get students enrolled in this section
        from enrollment.models import Enrollment
        enrollments = Enrollment.objects.filter(
            section_id=section_id,
            status__in=["ENROLLED", "APPROVED"],
        ).select_related("student", "student__profile")

        students = []
        for enrollment in enrollments:
            student = enrollment.student
            name = student.username
            if hasattr(student, "profile") and student.profile:
                name = f"{student.profile.first_name} {student.profile.last_name}"
            students.append({
                "id": student.id,
                "username": student.username,
                "name": name,
            })

        return Response(students)

    @action(detail=False, methods=["get"])
    def history(self, request):
        """
        Get attendance history for a section, grouped by date.
        """
        section_id = request.query_params.get("section")
        if not section_id:
            return Response(
                {"error": "section parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get unique dates with attendance
        records = AttendanceRecord.objects.filter(
            section_id=section_id
        ).order_by("-date")

        # Group by date
        dates = records.values_list("date", flat=True).distinct()

        history = []
        for record_date in dates:
            day_records = records.filter(date=record_date)
            present = day_records.filter(status="PRESENT").count()
            absent = day_records.filter(status="ABSENT").count()
            late = day_records.filter(status="LATE").count()
            excused = day_records.filter(status="EXCUSED").count()
            total = day_records.count()

            history.append({
                "date": record_date,
                "total": total,
                "present": present,
                "absent": absent,
                "late": late,
                "excused": excused,
            })

        return Response(history)
