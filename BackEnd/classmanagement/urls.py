from django.urls import path
from .views import (
    ScheduleListCreate,
    ScheduleDetail,
    auto_generate_schedules,
    bulk_delete_schedules,
    bulk_update_schedules,
    my_schedule,
)

urlpatterns = [
    path("schedules/", ScheduleListCreate.as_view(), name="schedule-list"),
    path("schedules/<int:pk>/", ScheduleDetail.as_view(), name="schedule-detail"),
    path("schedules/auto-generate/", auto_generate_schedules, name="schedule-auto-generate"),
    path("schedules/bulk-delete/", bulk_delete_schedules, name="schedule-bulk-delete"),
    path("schedules/bulk-update/", bulk_update_schedules, name="schedule-bulk-update"),
    path("schedules/my/", my_schedule, name="my-schedule"),
]
