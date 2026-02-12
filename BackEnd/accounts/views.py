from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, status as http_status
from .serializers import (
    CreateUserSerializer,
    SubjectSerializer,
    SectionSerializer,
    UserDetailSerializer,
    TeacherAssignmentSerializer,
)
from .models import User, Subject, Section, TeacherProfile
from rest_framework.authtoken.models import Token

# ✅ LOGIN (creates session cookie — CSRF exempt because the frontend is cross-origin)
@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # skip SessionAuthentication CSRF check

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "").strip()

        # Case-insensitive username lookup
        try:
            actual_user = User.objects.get(username__iexact=username)
            username = actual_user.username  # use the DB-stored casing
        except User.DoesNotExist:
            pass  # let authenticate() handle the failure

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"success": False, "message": "Invalid credentials"}, status=400)

        login(request, user)  # ✅ important
         # ✅ Token for SPA
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "success": True,
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
            }
        })


# ✅ CURRENT USER
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({"id": u.id, "username": u.username, "role": u.role})


# ✅ LOGOUT (CSRF exempt — cross-origin call)
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response({"success": True})


# ✅ ROLE-PROTECTED TEST ENDPOINTS (keep these because urls.py expects them)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_data(request):
    if getattr(request.user, "role", None) != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)
    return Response({"ok": True, "role": "ADMIN"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_data(request):
    if getattr(request.user, "role", None) != "TEACHER":
        return Response({"detail": "Forbidden"}, status=403)
    return Response({"ok": True, "role": "TEACHER"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def parent_data(request):
    if getattr(request.user, "role", None) != "PARENT_STUDENT":
        return Response({"detail": "Forbidden"}, status=403)
    return Response({"ok": True, "role": "PARENT_STUDENT"})


# ✅ ADMIN CREATE USER
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    if getattr(request.user, "role", None) != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)

    serializer = CreateUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "success": True,
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "status": user.status
            }
        }, status=201)
    
    return Response({
        "success": False,
        "errors": serializer.errors
    }, status=400)


# ══════════════════════════════════════════════════════
# SUBJECT CRUD  (admin only)
# ══════════════════════════════════════════════════════
class SubjectListCreate(generics.ListCreateAPIView):
    queryset = Subject.objects.prefetch_related("teachers__user").all().order_by("name")
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        assigned_teacher = request.data.pop("assigned_teacher", None) if isinstance(request.data, dict) else None
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201 and assigned_teacher:
            self._assign_teacher(response.data["id"], assigned_teacher)
            # re-serialize to include the teacher
            subj = Subject.objects.prefetch_related("teachers__user").get(id=response.data["id"])
            response.data = SubjectSerializer(subj).data
        return response

    @staticmethod
    def _assign_teacher(subject_id, teacher_user_id):
        try:
            teacher_user = User.objects.get(id=teacher_user_id, role="TEACHER")
            tp, _ = TeacherProfile.objects.get_or_create(user=teacher_user)
            tp.subject_id = subject_id
            tp.save()
        except User.DoesNotExist:
            pass


class SubjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.prefetch_related("teachers__user").all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        assigned_teacher = request.data.pop("assigned_teacher", None) if isinstance(request.data, dict) else None
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200 and assigned_teacher is not None:
            # Unassign any prior teacher from this subject, then assign the new one
            subj = self.get_object()
            TeacherProfile.objects.filter(subject=subj).update(subject=None)
            if assigned_teacher:  # non-null / non-zero
                SubjectListCreate._assign_teacher(subj.id, assigned_teacher)
            subj.refresh_from_db()
            subj = Subject.objects.prefetch_related("teachers__user").get(id=subj.id)
            response.data = SubjectSerializer(subj).data
        return response

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        return super().destroy(request, *args, **kwargs)


# ══════════════════════════════════════════════════════
# SECTION CRUD  (admin only)
# ══════════════════════════════════════════════════════
class SectionListCreate(generics.ListCreateAPIView):
    queryset = Section.objects.all().order_by("grade_level", "name")
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        return super().create(request, *args, **kwargs)


class SectionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            return Response({"detail": "Forbidden"}, status=403)
        return super().destroy(request, *args, **kwargs)


# ══════════════════════════════════════════════════════
# USER LIST  (admin only — supports ?role=TEACHER filter)
# ══════════════════════════════════════════════════════
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request):
    if request.user.role != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)
    qs = User.objects.select_related("teacher_profile", "profile").all().order_by("-created_at")
    role = request.query_params.get("role")
    if role:
        qs = qs.filter(role=role.upper())
    search = request.query_params.get("search", "").strip()
    if search:
        from django.db.models import Q
        qs = qs.filter(Q(username__icontains=search) | Q(email__icontains=search))
    serializer = UserDetailSerializer(qs, many=True)
    return Response(serializer.data)


# ══════════════════════════════════════════════════════
# TEACHER ASSIGNMENT  (admin only — assign subject/section)
# ══════════════════════════════════════════════════════
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_teacher_assignment(request, user_id):
    """Assign or change a teacher's subject, section, or employee_id."""
    if request.user.role != "ADMIN":
        return Response({"detail": "Forbidden"}, status=403)
    try:
        teacher_user = User.objects.get(id=user_id, role="TEACHER")
    except User.DoesNotExist:
        return Response({"detail": "Teacher not found"}, status=404)

    # Ensure profile exists
    tp, _ = TeacherProfile.objects.get_or_create(user=teacher_user)

    ser = TeacherAssignmentSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    if "subject" in ser.validated_data:
        subj_id = ser.validated_data["subject"]
        tp.subject = Subject.objects.get(id=subj_id) if subj_id else None

    if "section" in ser.validated_data:
        sect_id = ser.validated_data["section"]
        tp.section = Section.objects.get(id=sect_id) if sect_id else None

    if "employee_id" in ser.validated_data:
        tp.employee_id = ser.validated_data["employee_id"]

    tp.save()

    # Return the updated user detail
    teacher_user.refresh_from_db()
    return Response(UserDetailSerializer(teacher_user).data)
#         "id": 5,
#         "username": "Vincy Gam",
#         "email": "VincyGam@gmail.com",
#         "role": "PARENT_STUDENT",
#         "status": "ACTIVE"
#     }http://127.0.0.1:8000/api/accounts/admin/create-user/

