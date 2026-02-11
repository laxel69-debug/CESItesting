from rest_framework import serializers
from .models import Transaction
from accounts.models import User, UserProfile


class TransactionSerializer(serializers.ModelSerializer):
    """
    Read serializer – returns full details including parent username
    and properly formatted dates for the React frontend.
    """
    parent_username = serializers.CharField(source='parent.username', read_only=True)
    date_created = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    due_date = serializers.DateField(format="%Y-%m-%d", required=False, allow_null=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'parent',
            'parent_username',
            'student_name',
            'transaction_type',
            'amount',
            'description',
            'payment_method',
            'reference_number',
            'due_date',
            'date_created',
            'status',
        ]


class TransactionCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer – used when admins create or update a transaction.
    Accepts parent (user id), auto-fills student_name from profile if blank.
    """
    due_date = serializers.DateField(required=False, allow_null=True)
    student_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Transaction
        fields = [
            'parent',
            'student_name',
            'transaction_type',
            'amount',
            'description',
            'payment_method',
            'due_date',
            'status',
        ]

    def validate_parent(self, value):
        if value.role != 'PARENT_STUDENT':
            raise serializers.ValidationError("Selected user is not a Parent/Student account.")
        return value

    def _auto_fill_student_name(self, validated_data):
        """Auto-fill student_name from the parent's profile if left blank."""
        if not validated_data.get('student_name'):
            try:
                profile = validated_data['parent'].profile
                validated_data['student_name'] = (
                    f"{profile.student_first_name} {profile.student_last_name}"
                )
            except UserProfile.DoesNotExist:
                validated_data['student_name'] = validated_data['parent'].username

    def create(self, validated_data):
        self._auto_fill_student_name(validated_data)

        # Auto-generate school-side reference number (CESI-YYYY-NNNNN)
        if not validated_data.get('reference_number'):
            from django.utils import timezone
            year = timezone.now().year
            last = Transaction.objects.order_by('-id').first()
            seq = (last.id + 1) if last else 1
            validated_data['reference_number'] = f"CESI-{year}-{seq:05d}"

        return super().create(validated_data)

    def update(self, instance, validated_data):
        self._auto_fill_student_name(validated_data)
        return super().update(instance, validated_data)


class ParentDropdownSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the parent search/dropdown in admin UI.
    """
    student_name = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'student_name', 'parent_name']

    def get_student_name(self, obj):
        try:
            p = obj.profile
            name = f"{p.student_first_name} {p.student_last_name}".strip()
            return name if name else ""
        except (UserProfile.DoesNotExist, AttributeError):
            return ""

    def get_parent_name(self, obj):
        try:
            p = obj.profile
            name = f"{p.parent_first_name} {p.parent_last_name}".strip()
            return name if name else ""
        except (UserProfile.DoesNotExist, AttributeError):
            return ""
