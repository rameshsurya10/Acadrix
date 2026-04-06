from rest_framework import serializers

from apps.teacher.models import (
    Assessment,
    Assignment,
    GradeEntry,
    HealthObservation,
    TeacherProfile,
)


class TeacherProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(
        source='department.name', read_only=True, default=None,
    )

    class Meta:
        model = TeacherProfile
        fields = [
            'id',
            'full_name',
            'email',
            'employee_id',
            'department',
            'department_name',
            'title',
            'qualification',
            'specialization',
            'date_joined',
            'employment_status',
            'performance_score',
            'research_focus',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'employee_id',
            'performance_score',
            'is_active',
            'created_at',
            'updated_at',
        ]


class AssignmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(
        source='course.__str__', read_only=True,
    )

    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'course',
            'course_name',
            'teacher',
            'due_date',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'teacher', 'created_at', 'updated_at']

    def validate_course(self, value):
        request = self.context.get('request')
        if request and value.teacher != request.user:
            raise serializers.ValidationError('You can only create assignments for your own courses.')
        return value


class AssessmentListSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(
        source='course.__str__', read_only=True,
    )
    subject_name = serializers.CharField(
        source='subject.name', read_only=True,
    )

    class Meta:
        model = Assessment
        fields = [
            'id',
            'title',
            'course',
            'course_name',
            'subject',
            'subject_name',
            'total_marks',
            'scheduled_date',
            'duration_minutes',
            'status',
            'created_at',
        ]


class AssessmentDetailSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(
        source='course.__str__', read_only=True,
    )
    subject_name = serializers.CharField(
        source='subject.name', read_only=True,
    )

    class Meta:
        model = Assessment
        fields = [
            'id',
            'title',
            'description',
            'course',
            'course_name',
            'subject',
            'subject_name',
            'teacher',
            'total_marks',
            'scheduled_date',
            'duration_minutes',
            'status',
            'shuffle_questions',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'teacher', 'created_at', 'updated_at']

    def validate_course(self, value):
        request = self.context.get('request')
        if request and value.teacher != request.user:
            raise serializers.ValidationError('You can only create assessments for your own courses.')
        return value


class GradeEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.__str__', read_only=True,
    )

    class Meta:
        model = GradeEntry
        fields = [
            'id',
            'student',
            'student_name',
            'assessment',
            'marks_obtained',
            'letter_grade',
            'remarks',
            'graded_by',
            'graded_at',
        ]
        read_only_fields = ['id', 'graded_by', 'graded_at']

    def validate_marks_obtained(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Marks obtained cannot be negative.',
            )
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        assessment = attrs.get('assessment') or getattr(
            self.instance, 'assessment', None,
        )
        if assessment and request and assessment.teacher != request.user:
            raise serializers.ValidationError(
                {'assessment': 'You can only grade your own assessments.'},
            )
        marks = attrs.get('marks_obtained')
        if assessment and marks is not None and marks > assessment.total_marks:
            raise serializers.ValidationError(
                {
                    'marks_obtained': (
                        f'Marks cannot exceed total marks '
                        f'({assessment.total_marks}).'
                    ),
                },
            )
        return attrs


class HealthObservationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source='student.__str__', read_only=True,
    )
    teacher_name = serializers.CharField(
        source='teacher.full_name', read_only=True,
    )

    class Meta:
        model = HealthObservation
        fields = [
            'id',
            'student',
            'student_name',
            'teacher',
            'teacher_name',
            'observation',
            'created_at',
        ]
        read_only_fields = ['id', 'teacher', 'created_at']
