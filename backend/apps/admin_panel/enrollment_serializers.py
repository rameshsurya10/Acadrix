from rest_framework import serializers
from django.db import transaction

from apps.accounts.models import User
from apps.accounts.utils import generate_id
from apps.accounts.emails import send_welcome_email
from apps.teacher.models import TeacherProfile
from apps.student.models import StudentProfile, Guardian
from apps.principal.models import PrincipalProfile


class GuardianInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    relationship = serializers.CharField(max_length=30, default='parent')
    phone = serializers.CharField(max_length=20, required=False, default='')
    email = serializers.EmailField(required=False, default='')
    is_primary = serializers.BooleanField(default=False)


class EnrollTeacherSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')
    department = serializers.IntegerField(required=False, allow_null=True, default=None)
    title = serializers.CharField(max_length=60, required=False, default='')
    qualification = serializers.CharField(max_length=200, required=False, default='')
    specialization = serializers.CharField(max_length=200, required=False, default='')
    date_joined = serializers.DateField(required=False, allow_null=True, default=None)
    employment_status = serializers.ChoiceField(
        choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract')],
        default='full_time',
    )
    employee_id = serializers.CharField(max_length=20, required=False, allow_null=True, default=None)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_employee_id(self, value):
        if value and TeacherProfile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError('This ID is already in use.')
        return value

    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id', None)
        department_id = validated_data.pop('department', None)
        if not employee_id:
            employee_id = generate_id('teacher')

        with transaction.atomic():
            user = User(
                username=validated_data['email'], email=validated_data['email'],
                first_name=validated_data['first_name'], last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''), role='teacher',
            )
            user.set_unusable_password()
            user.save()

            TeacherProfile.objects.create(
                user=user, employee_id=employee_id, department_id=department_id,
                title=validated_data.get('title', ''),
                qualification=validated_data.get('qualification', ''),
                specialization=validated_data.get('specialization', ''),
                date_joined=validated_data.get('date_joined'),
                employment_status=validated_data.get('employment_status', 'full_time'),
            )

        email_sent = send_welcome_email(
            email=user.email, first_name=user.first_name,
            role='teacher', generated_id=employee_id,
        )
        return {'user': user, 'employee_id': employee_id, 'email_sent': email_sent}


class EnrollStudentSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')
    date_of_birth = serializers.DateField(required=False, allow_null=True, default=None)
    address = serializers.CharField(required=False, default='')
    section = serializers.IntegerField(required=False, allow_null=True, default=None)
    house = serializers.CharField(max_length=40, required=False, default='')
    student_id = serializers.CharField(max_length=20, required=False, allow_null=True, default=None)
    guardians = GuardianInputSerializer(many=True, required=False, default=[])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_student_id(self, value):
        if value and StudentProfile.objects.filter(student_id=value).exists():
            raise serializers.ValidationError('This ID is already in use.')
        return value

    def create(self, validated_data):
        student_id = validated_data.pop('student_id', None)
        guardians_data = validated_data.pop('guardians', [])
        section_id = validated_data.pop('section', None)
        if not student_id:
            student_id = generate_id('student')

        with transaction.atomic():
            user = User(
                username=validated_data['email'], email=validated_data['email'],
                first_name=validated_data['first_name'], last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''), role='student',
            )
            user.set_unusable_password()
            user.save()

            profile = StudentProfile.objects.create(
                user=user, student_id=student_id, section_id=section_id,
                house=validated_data.get('house', ''),
                date_of_birth=validated_data.get('date_of_birth'),
                address=validated_data.get('address', ''),
            )

            if guardians_data:
                Guardian.objects.bulk_create([Guardian(student=profile, **g) for g in guardians_data])

        email_sent = send_welcome_email(
            email=user.email, first_name=user.first_name,
            role='student', generated_id=student_id,
        )
        return {'user': user, 'student_id': student_id, 'email_sent': email_sent}


class EnrollPrincipalSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')
    department = serializers.IntegerField(required=False, allow_null=True, default=None)
    title = serializers.CharField(max_length=60, required=False, default='')
    qualification = serializers.CharField(max_length=200, required=False, default='')
    specialization = serializers.CharField(max_length=200, required=False, default='')
    date_joined = serializers.DateField(required=False, allow_null=True, default=None)
    employment_status = serializers.ChoiceField(
        choices=[('full_time', 'Full-time'), ('part_time', 'Part-time'), ('contract', 'Contract')],
        default='full_time',
    )
    employee_id = serializers.CharField(max_length=20, required=False, allow_null=True, default=None)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_employee_id(self, value):
        if value and PrincipalProfile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError('This ID is already in use.')
        return value

    def create(self, validated_data):
        employee_id = validated_data.pop('employee_id', None)
        department_id = validated_data.pop('department', None)
        if not employee_id:
            employee_id = generate_id('principal')

        with transaction.atomic():
            user = User(
                username=validated_data['email'], email=validated_data['email'],
                first_name=validated_data['first_name'], last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''), role='principal',
            )
            user.set_unusable_password()
            user.save()

            PrincipalProfile.objects.create(
                user=user, employee_id=employee_id, department_id=department_id,
                title=validated_data.get('title', ''),
                qualification=validated_data.get('qualification', ''),
                specialization=validated_data.get('specialization', ''),
                date_joined=validated_data.get('date_joined'),
                employment_status=validated_data.get('employment_status', 'full_time'),
            )

        email_sent = send_welcome_email(
            email=user.email, first_name=user.first_name,
            role='principal', generated_id=employee_id,
        )
        return {'user': user, 'employee_id': employee_id, 'email_sent': email_sent}


class EnrollAdminSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        with transaction.atomic():
            user = User(
                username=validated_data['email'], email=validated_data['email'],
                first_name=validated_data['first_name'], last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''), role='admin',
            )
            user.set_unusable_password()
            user.save()

        email_sent = send_welcome_email(
            email=user.email, first_name=user.first_name,
            role='admin', generated_id=None,
        )
        return {'user': user, 'email_sent': email_sent}
