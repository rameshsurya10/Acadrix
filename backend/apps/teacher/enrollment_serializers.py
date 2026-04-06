from rest_framework import serializers
from apps.shared.models import Course


class TeacherEnrollStudentSerializer(serializers.Serializer):
    section = serializers.IntegerField()

    def validate_section(self, value):
        teacher_user = self.context['request'].user
        teacher_sections = (
            Course.objects
            .filter(teacher=teacher_user, academic_year__is_current=True)
            .values_list('section_id', flat=True)
            .distinct()
        )
        if value not in teacher_sections:
            raise serializers.ValidationError(
                'You can only enroll students in your assigned sections.'
            )
        return value
