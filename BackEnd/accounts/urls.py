from django.urls import path
from .views import (
    LoginView,
    admin_data,
    teacher_data,
    parent_data,
    admin_create_user,
    me,
    logout_view,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("admin-data/", admin_data, name="admin-data"),
    path("teacher-data/", teacher_data, name="teacher-data"),
    path("parent-data/", parent_data, name="parent-data"),
    path("admin/create-user/", admin_create_user, name="admin-create-user"),
    path("me/", me, name="me"),
    path("logout/", logout_view, name="logout"),
]
