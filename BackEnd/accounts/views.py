from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import CreateUserSerializer
from .models import User
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



# # {
#     "success": true,
#     "message": "User created successfully",
#     "user": {
#         "id": 5,
#         "username": "Vincy Gam",
#         "email": "VincyGam@gmail.com",
#         "role": "PARENT_STUDENT",
#         "status": "ACTIVE"
#     }http://127.0.0.1:8000/api/accounts/admin/create-user/

