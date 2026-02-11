from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Enrollment
from .serializers import (
    EnrollmentSerializer,
    EnrollmentDetailedSerializer,
    EnrollmentCreateSerializer,
)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student enrollments.
    Supports CRUD operations and filtering by student, section, grade, and status.
    """
    queryset = Enrollment.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == "create" or self.action == "update" or self.action == "partial_update":
            return EnrollmentCreateSerializer
        elif self.action == "retrieve":
            return EnrollmentDetailedSerializer
        return EnrollmentSerializer
    
    def get_queryset(self):
        """Filter enrollments based on query parameters"""
        queryset = Enrollment.objects.all()
        
        # Filter by student
        student_id = self.request.query_params.get("student_id", None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by section
        section_id = self.request.query_params.get("section_id", None)
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        
        # Filter by grade level
        grade_level = self.request.query_params.get("grade_level", None)
        if grade_level:
            queryset = queryset.filter(grade_level=grade_level)
        
        # Filter by status
        status_filter = self.request.query_params.get("status", None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by academic year
        academic_year = self.request.query_params.get("academic_year", None)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        
        return queryset
    
    @action(detail=False, methods=["get"])
    def by_student(self, request):
        """Get all enrollments for a specific student"""
        student_id = request.query_params.get("student_id")
        if not student_id:
            return Response(
                {"error": "student_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollments = Enrollment.objects.filter(student_id=student_id)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def by_section(self, request):
        """Get all enrollments for a specific section"""
        section_id = request.query_params.get("section_id")
        if not section_id:
            return Response(
                {"error": "section_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollments = Enrollment.objects.filter(section_id=section_id)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def by_grade(self, request):
        """Get all enrollments for a specific grade level"""
        grade_level = request.query_params.get("grade_level")
        if not grade_level:
            return Response(
                {"error": "grade_level query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollments = Enrollment.objects.filter(grade_level=grade_level)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def mark_completed(self, request, pk=None):
        """Mark an enrollment as completed"""
        enrollment = self.get_object()
        enrollment.status = "COMPLETED"
        enrollment.completed_at = timezone.now()
        enrollment.save()
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def mark_dropped(self, request, pk=None):
        """Mark an enrollment as dropped"""
        enrollment = self.get_object()
        enrollment.status = "DROPPED"
        enrollment.completed_at = timezone.now()
        enrollment.save()
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def mark_active(self, request, pk=None):
        """Mark an enrollment as active"""
        enrollment = self.get_object()
        enrollment.status = "ACTIVE"
        enrollment.save()
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def active_enrollments(self, request):
        """Get all active enrollments"""
        enrollments = Enrollment.objects.filter(status="ACTIVE")
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get enrollment statistics"""
        total_enrollments = Enrollment.objects.count()
        active_enrollments = Enrollment.objects.filter(status="ACTIVE").count()
        completed_enrollments = Enrollment.objects.filter(status="COMPLETED").count()
        dropped_enrollments = Enrollment.objects.filter(status="DROPPED").count()
        pending_enrollments = Enrollment.objects.filter(status="PENDING").count()
        
        by_grade = {}
        for grade in range(1, 7):
            by_grade[f"Grade {grade}"] = Enrollment.objects.filter(
                grade_level=grade
            ).count()
        
        return Response({
            "total_enrollments": total_enrollments,
            "active_enrollments": active_enrollments,
            "completed_enrollments": completed_enrollments,
            "dropped_enrollments": dropped_enrollments,
            "pending_enrollments": pending_enrollments,
            "by_grade": by_grade,
        })


from django.utils import timezone
