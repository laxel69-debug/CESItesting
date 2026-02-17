from rest_framework import serializers
from .models import User, UserProfile, TeacherProfile, AdminProfile, Section, Subject


# ── Read-only serializers ──────────────────────────────

class SubjectTeacherSerializer(serializers.Serializer):
    """Lightweight teacher info nested inside a subject."""
    id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    employee_id = serializers.CharField()


class SubjectSerializer(serializers.ModelSerializer):
    teachers = SubjectTeacherSerializer(many=True, read_only=True)
    assigned_teacher = serializers.IntegerField(
        write_only=True, required=False, allow_null=True,
    )

    class Meta:
        model = Subject
        fields = ["id", "name", "code", "teachers", "assigned_teacher"]


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "name", "grade_level"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "status", "created_at"]


class TeacherProfileReadSerializer(serializers.ModelSerializer):
    """Nested read-only representation returned inside UserDetailSerializer."""
    subject = SubjectSerializer(read_only=True)
    section = SectionSerializer(read_only=True)

    class Meta:
        model = TeacherProfile
        fields = ["id", "employee_id", "subject", "section"]


class UserProfileReadSerializer(serializers.ModelSerializer):
    section = SectionSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "student_first_name", "student_middle_name", "student_last_name",
            "grade_level", "section",
            
             # ✅ add these
            "lrn",
            "student_number",
            "payment_mode",
            "parent_first_name", "parent_middle_name", "parent_last_name",
            "contact_number", "address",
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user + nested profile (teacher or parent)."""
    teacher_profile = TeacherProfileReadSerializer(read_only=True)
    profile = UserProfileReadSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "status", "created_at", "teacher_profile", "profile"]


# ── Write serializers ──────────────────────────────────

class TeacherAssignmentSerializer(serializers.Serializer):
    """Update a teacher's subject / section assignment."""
    subject = serializers.IntegerField(required=False, allow_null=True)
    section = serializers.IntegerField(required=False, allow_null=True)
    employee_id = serializers.CharField(required=False, allow_blank=True)

    def validate_subject(self, value):
        if value is not None:
            if not Subject.objects.filter(id=value).exists():
                raise serializers.ValidationError("Subject not found")
        return value

    def validate_section(self, value):
        if value is not None:
            if not Section.objects.filter(id=value).exists():
                raise serializers.ValidationError("Section not found")
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class CreateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=["ADMIN", "TEACHER", "PARENT_STUDENT"])
    status = serializers.ChoiceField(
        choices=["ACTIVE", "INACTIVE", "SUSPENDED"],
        required=False,
    )

    # Parent/Student profile fields (required when role == PARENT_STUDENT)
    student_first_name = serializers.CharField(max_length=50, required=False)
    student_middle_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    student_last_name = serializers.CharField(max_length=50, required=False)
    grade_level = serializers.IntegerField(required=False)
    section = serializers.IntegerField(required=False)

    parent_first_name = serializers.CharField(max_length=50, required=False)
    parent_middle_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    parent_last_name = serializers.CharField(max_length=50, required=False)
    contact_number = serializers.CharField(max_length=20, required=False)
    address = serializers.CharField(required=False)

    # Teacher profile fields (optional when role == TEACHER)
    subject = serializers.IntegerField(required=False)
    section_teacher = serializers.IntegerField(required=False)
    employee_id = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate(self, attrs):
        role = attrs.get("role")
        
        if role == "PARENT_STUDENT":
            required = [
                "student_first_name",
                "student_last_name",
                "grade_level",
                "parent_first_name",
                "parent_last_name",
                "contact_number",
                "address",
            ]
            missing = [f for f in required if not attrs.get(f)]
            if missing:
                raise serializers.ValidationError({"detail": f"Missing profile fields: {', '.join(missing)}"})

            # If section provided, ensure it exists
            section_id = attrs.get("section")
            if section_id:
                try:
                    Section.objects.get(id=section_id)
                except Section.DoesNotExist:
                    raise serializers.ValidationError({"section": "Section not found"})

        elif role == "TEACHER":
            # For teachers: subject and section are optional but if provided, validate
            subject_id = attrs.get("subject")
            if subject_id:
                try:
                    Subject.objects.get(id=subject_id)
                except Subject.DoesNotExist:
                    raise serializers.ValidationError({"subject": "Subject not found"})

            section_id = attrs.get("section_teacher")
            if section_id:
                try:
                    Section.objects.get(id=section_id)
                except Section.DoesNotExist:
                    raise serializers.ValidationError({"section_teacher": "Section not found"})

        return attrs

    def create(self, validated_data):
        status_value = validated_data.pop("status", "ACTIVE")
        password = validated_data.pop("password")

        # Extract profile data if present
        parent_profile_data = {}
        teacher_profile_data = {}

        if validated_data.get("role") == "PARENT_STUDENT":
            profile_fields = [
                "student_first_name",
                "student_middle_name",
                "student_last_name",
                "grade_level",
                "section",
                "parent_first_name",
                "parent_middle_name",
                "parent_last_name",
                "contact_number",
                "address",
            ]
            for f in profile_fields:
                if f in validated_data:
                    parent_profile_data[f] = validated_data.pop(f)

        elif validated_data.get("role") == "TEACHER":
            teacher_fields = ["subject", "section_teacher", "employee_id"]
            for f in teacher_fields:
                if f in validated_data:
                    teacher_profile_data[f] = validated_data.pop(f)

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        user.status = status_value
        user.save()

        # Create parent profile if role is PARENT_STUDENT
        if user.role == "PARENT_STUDENT":
            section_obj = None
            if parent_profile_data.get("section"):
                section_obj = Section.objects.get(id=parent_profile_data.get("section"))

            UserProfile.objects.create(
                user=user,
                student_first_name=parent_profile_data.get("student_first_name"),
                student_middle_name=parent_profile_data.get("student_middle_name", ""),
                student_last_name=parent_profile_data.get("student_last_name"),
                grade_level=parent_profile_data.get("grade_level"),
                section=section_obj,
                parent_first_name=parent_profile_data.get("parent_first_name"),
                parent_middle_name=parent_profile_data.get("parent_middle_name", ""),
                parent_last_name=parent_profile_data.get("parent_last_name"),
                contact_number=parent_profile_data.get("contact_number"),
                address=parent_profile_data.get("address"),
            )

        # Create teacher profile if role is TEACHER
        elif user.role == "TEACHER":
            subject_obj = None
            if teacher_profile_data.get("subject"):
                subject_obj = Subject.objects.get(id=teacher_profile_data.get("subject"))

            section_obj = None
            if teacher_profile_data.get("section_teacher"):
                section_obj = Section.objects.get(id=teacher_profile_data.get("section_teacher"))

            TeacherProfile.objects.create(
                user=user,
                subject=subject_obj,
                section=section_obj,
                employee_id=teacher_profile_data.get("employee_id", ""),
            )

        return user
