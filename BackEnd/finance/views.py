from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Sum

from .models import Transaction
from .serializers import (
    TransactionSerializer,
    TransactionCreateSerializer,
    ParentDropdownSerializer,
)
from accounts.models import User


# ──────────────────────────────────────────────
# ADMIN — list all transactions + create new
# ──────────────────────────────────────────────
class TransactionListCreate(generics.ListCreateAPIView):
    """
    GET  → list every transaction (admin panel)
    POST → create a new transaction from admin panel
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Transaction.objects.select_related('parent').all()
        # optional filters via query params
        search = self.request.query_params.get('search', '')
        status_filter = self.request.query_params.get('status', '')
        if search:
            qs = qs.filter(
                Q(student_name__icontains=search)
                | Q(reference_number__icontains=search)
                | Q(parent__username__icontains=search)
            )
        if status_filter and status_filter.upper() in ['PAID', 'PENDING', 'OVERDUE']:
            qs = qs.filter(status=status_filter.upper())
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        return TransactionSerializer

    def create(self, request, *args, **kwargs):
        # Only admins may create
        if getattr(request.user, 'role', None) != 'ADMIN':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        # Return the read-friendly representation
        out = TransactionSerializer(transaction).data
        return Response(out, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# ADMIN — detail / update / delete
# ──────────────────────────────────────────────
class TransactionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.select_related('parent').all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return TransactionCreateSerializer
        return TransactionSerializer

    def update(self, request, *args, **kwargs):
        # Only admins may update
        if getattr(request.user, 'role', None) != 'ADMIN':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return the read-friendly representation
        out = TransactionSerializer(instance).data
        return Response(out)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'ADMIN':
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


# ──────────────────────────────────────────────
# ADMIN — financial summary stats
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_stats(request):
    if getattr(request.user, 'role', None) != 'ADMIN':
        return Response({'detail': 'Forbidden'}, status=403)

    total = Transaction.objects.aggregate(total=Sum('amount'))['total'] or 0
    collected = Transaction.objects.filter(status='PAID').aggregate(s=Sum('amount'))['s'] or 0
    pending = Transaction.objects.filter(status__in=['PENDING', 'OVERDUE']).aggregate(s=Sum('amount'))['s'] or 0
    return Response({
        'totalRevenue': float(total),
        'collected': float(collected),
        'pending': float(pending),
    })


# ──────────────────────────────────────────────
# ADMIN — parent search / dropdown list
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_list(request):
    """Return all PARENT_STUDENT users for the admin dropdown."""
    if getattr(request.user, 'role', None) != 'ADMIN':
        return Response({'detail': 'Forbidden'}, status=403)

    search = request.query_params.get('search', '')
    qs = User.objects.filter(role='PARENT_STUDENT')
    if search:
        qs = qs.filter(
            Q(username__icontains=search)
            | Q(email__icontains=search)
            | Q(profile__student_first_name__icontains=search)
            | Q(profile__student_last_name__icontains=search)
            | Q(profile__parent_first_name__icontains=search)
            | Q(profile__parent_last_name__icontains=search)
        )
    # Prefetch profiles to avoid N+1 and handle missing profiles
    qs = qs.select_related('profile')
    serializer = ParentDropdownSerializer(qs.distinct()[:50], many=True)
    return Response(serializer.data)


# ──────────────────────────────────────────────
# ADMIN — students belonging to a parent account
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_students(request, parent_id):
    """Return the student(s) enrolled under a parent account."""
    if getattr(request.user, 'role', None) != 'ADMIN':
        return Response({'detail': 'Forbidden'}, status=403)

    try:
        parent = User.objects.get(pk=parent_id, role='PARENT_STUDENT')
    except User.DoesNotExist:
        return Response({'detail': 'Parent not found'}, status=404)

    from accounts.models import UserProfile
    profiles = UserProfile.objects.filter(user=parent).select_related('section')
    students = []
    for p in profiles:
        students.append({
            'student_name': f"{p.student_first_name} {p.student_middle_name or ''} {p.student_last_name}".replace('  ', ' ').strip(),
            'grade_level': p.grade_level,
            'section': str(p.section) if p.section else '—',
            'parent_name': f"{p.parent_first_name} {p.parent_last_name}",
            'contact_number': p.contact_number,
        })
    return Response(students)


# ──────────────────────────────────────────────
# PARENT — own transactions only
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    """Return transactions belonging to the currently logged-in parent."""
    if getattr(request.user, 'role', None) != 'PARENT_STUDENT':
        return Response({'detail': 'Forbidden'}, status=403)

    qs = Transaction.objects.filter(parent=request.user).order_by('-date_created')
    serializer = TransactionSerializer(qs, many=True)
    return Response(serializer.data)
