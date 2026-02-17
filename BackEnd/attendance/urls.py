from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceRecordViewSet, TeacherSectionsView

router = DefaultRouter()
router.register(r"records", AttendanceRecordViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
    path("my-sections/", TeacherSectionsView.as_view(), name="teacher-sections"),
]
