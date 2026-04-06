from rest_framework import serializers

from .models import (
    Conversation,
    Course,
    Department,
    Grade,
    Message,
    ScheduleSlot,
    Section,
    Subject,
)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'department', 'department_name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'level', 'label', 'created_at']
        read_only_fields = ['id', 'created_at']


class SectionSerializer(serializers.ModelSerializer):
    grade_label = serializers.CharField(source='grade.label', read_only=True)
    display_name = serializers.CharField(source='__str__', read_only=True)

    class Meta:
        model = Section
        fields = [
            'id', 'grade', 'grade_label', 'name', 'display_name',
            'capacity', 'academic_year', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_display = serializers.CharField(source='section.__str__', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True, default=None)

    class Meta:
        model = Course
        fields = [
            'id', 'subject', 'subject_name', 'section', 'section_display',
            'teacher', 'teacher_name', 'academic_year', 'location',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ScheduleSlotSerializer(serializers.ModelSerializer):
    course_display = serializers.CharField(source='course.__str__', read_only=True)
    day_display = serializers.CharField(source='get_day_display', read_only=True)

    class Meta:
        model = ScheduleSlot
        fields = [
            'id', 'course', 'course_display', 'day', 'day_display',
            'start_time', 'end_time', 'location',
        ]
        read_only_fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name',
            'body', 'is_read', 'attachment', 'created_at',
        ]
        read_only_fields = ['id', 'sender', 'created_at']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    participants_info = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'participants_info', 'category',
            'subject', 'last_message', 'unread_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_participants_info(self, obj):
        return [
            {'id': u.id, 'name': u.full_name, 'role': u.role}
            for u in obj.participants.all()
        ]

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg is None:
            return None
        return {
            'id': msg.id,
            'sender_name': msg.sender.full_name,
            'body': msg.body[:120],
            'created_at': msg.created_at,
            'is_read': msg.is_read,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
