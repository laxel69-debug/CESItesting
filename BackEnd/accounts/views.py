from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import User


from django.contrib.auth import authenticate, login, logout, logout as django_logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, status as http_status
from rest_framework.authtoken.models import Token
from .serializers import (
    CreateUserSerializer,
    SubjectSerializer,
    SectionSerializer,
    UserDetailSerializer,
    TeacherAssignmentSerializer,
)
from .models import User, Subject, Section, TeacherProfile


@method_decorator(csrf_exempt, name="dispatch")
class SetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # skip CSRF/session auth

    def post(self, request):
        uidb64 = request.data.get("uidb64", "")
        token = request.data.get("token", "")
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not uidb64 or not token:
            return Response({"detail": "Missing token."}, status=400)

        if not new_password or len(new_password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=400)

        if new_password != confirm_password:
            return Response({"detail": "Passwords do not match."}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid link."}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired link."}, status=400)

        user.set_password(new_password)
        user.status = "ACTIVE"   # if you use status field
        user.is_active = True
        user.save()

        # optional: auto-create token for SPA
        token_obj, _ = Token.objects.get_or_create(user=user)

        return Response({"success": True, "token": token_obj.key})

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
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_detail(request):
    """
    Returns full details of the currently logged-in user:
    - user fields
    - nested profile (UserProfile) for PARENT_STUDENT
    - nested teacher_profile for TEACHER
    """
    return Response(UserDetailSerializer(request.user).data)

# ✅ LOGOUT (CSRF exempt — cross-origin call)
@api_view(["POST"])
@permission_classes([IsAuthenticated])  # ✅ MUST be authenticated
def logout_view(request):
    # ✅ delete token (TokenAuthentication)
    Token.objects.filter(user=request.user).delete()

    # ✅ logout session (SessionAuthentication)
    django_logout(request)

    # ✅ ensure session cookie is invalidated
    if hasattr(request, "session"):
        request.session.flush()

    return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


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

# 
# SET USER PASSWORD
# 

class SetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # no auth needed

    def post(self, request, uidb64, token):
        password = (request.data.get("password") or "").strip()
        password2 = (request.data.get("password2") or "").strip()

        if not password or not password2:
            return Response({"detail": "Password and confirmation are required."}, status=status.HTTP_400_BAD_REQUEST)

        if password != password2:
            return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        # basic length rule (adjust as you want)
        if len(password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.is_active = True
        user.save()

        # optional: auto-create DRF token so they can login right away if you want
        drf_token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {"success": True, "message": "Password set successfully.", "token": drf_token.key},
            status=status.HTTP_200_OK
        )














#         "id": 5,
#         "username": "Vincy Gam",
#         "email": "VincyGam@gmail.com",
#         "role": "PARENT_STUDENT",
#         "status": "ACTIVE"
#     }http://127.0.0.1:8000/api/accounts/admin/create-user/

