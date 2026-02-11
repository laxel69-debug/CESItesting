# announcements/urls.py
from django.urls import path
from .views import AnnouncementListCreate

urlpatterns = [
    path('', AnnouncementListCreate.as_view(), name='announcements'),
]
