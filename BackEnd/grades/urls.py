from django.urls import path
from . import views

urlpatterns = [
    # Teacher info
    path("teacher-info/", views.teacher_info, name="teacher-info"),

    # Weights
    path("weights/<int:subject_id>/", views.get_weights, name="grade-weights"),
    path("weights/<int:subject_id>/update/", views.update_weights, name="grade-weights-update"),

    # Grade Items (activities, quizzes, exams)
    path("items/", views.GradeItemListCreate.as_view(), name="grade-item-list"),
    path("items/<int:pk>/", views.GradeItemDetail.as_view(), name="grade-item-detail"),

    # Student scores
    path("scores/", views.StudentScoreListCreate.as_view(), name="score-list"),
    path("scores/upsert/", views.upsert_score, name="score-upsert"),

    # Class standing
    path("class-standing/", views.list_class_standings, name="class-standing-list"),
    path("class-standing/upsert/", views.upsert_class_standing, name="class-standing-upsert"),

    # Students by grade
    path("students/<int:grade_level>/", views.students_by_grade, name="students-by-grade"),

    # Computed grades
    path("compute/<int:student_id>/<int:subject_id>/", views.student_quarter_grades, name="student-quarter-grades"),

    # Parent — my child's report card
    path("my-grades/", views.my_grades, name="my-grades"),
]
