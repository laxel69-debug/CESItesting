# announcements/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from django.db.models import Q
from django.utils import timezone

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
            return [AllowAny()]
        return [IsAuthenticated(), IsTeacherOrAdmin()]


    def get(self, request):
        user = request.user if request.user.is_authenticated else None

        # base: only active
        qs = Announcement.objects.filter(is_active=True).order_by("-publish_date")

        # public (not logged in): only public + already published
        if not user:
            qs = qs.filter(target_role="all", publish_date__lte=timezone.now())
        else:
            role = str(getattr(user, "role", "")).upper()

            # admin: sees all active (including scheduled)
            if user.is_staff or user.is_superuser or "ADMIN" in role:
                pass

            elif "TEACHER" in role:
                qs = qs.filter(Q(target_role="teachers") | Q(target_role="all"))

            elif "PARENT_STUDENT" in role:
                qs = qs.filter(Q(target_role="parent_student") | Q(target_role="all"))

            else:
                qs = qs.filter(target_role="all", publish_date__lte=timezone.now())

        serializer = AnnouncementSerializer(
            qs,
            many=True,
            context={"request": request},
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
