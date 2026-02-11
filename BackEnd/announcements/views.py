# announcements/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Announcement, AnnouncementMedia
from .serializers import AnnouncementSerializer
from .permissions import IsTeacherOrAdmin


class AnnouncementListCreate(APIView):
    """
    GET: List all announcements (public)
    POST: Create a new announcement (teachers/admin only)
    """

    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "GET":
            return []  # public access
        return [IsAuthenticated(), IsTeacherOrAdmin()]

    def get(self, request):
        announcements = Announcement.objects.order_by("-publish_date")
        serializer = AnnouncementSerializer(
            announcements,
            many=True,
            context={"request": request},  # ✅ REQUIRED for file_url
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = AnnouncementSerializer(
            data=request.data,
            context={"request": request},  # ✅ REQUIRED for file_url
        )
        serializer.is_valid(raise_exception=True)

        # Save announcement with creator
        announcement = serializer.save(created_by=request.user)

        # Handle uploaded media files
        for f in request.FILES.getlist("files"):
            AnnouncementMedia.objects.create(
                announcement=announcement,
                file=f,
            )

        # Return full object with media + absolute URLs
        return Response(
            AnnouncementSerializer(
                announcement,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )
