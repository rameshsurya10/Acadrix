from rest_framework import serializers

from .models import (
    AssessmentQuestion,
    GeneratedQuestion,
    InstitutionEvent,
    SourceDocument,
)


class SourceDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.full_name', read_only=True,
    )

    class Meta:
        model = SourceDocument
        fields = [
            'id', 'uploaded_by', 'uploaded_by_name', 'file', 'file_name',
            'file_size_bytes', 'subject_context', 'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size_bytes']

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        uploaded_file = validated_data.get('file')
        if uploaded_file:
            validated_data.setdefault('file_name', uploaded_file.name)
            validated_data['file_size_bytes'] = uploaded_file.size
        return super().create(validated_data)


class GeneratedQuestionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(
        source='subject.name', read_only=True,
    )
    source_document_name = serializers.CharField(
        source='source_document.file_name', read_only=True, default=None,
    )
    approved_by_name = serializers.CharField(
        source='approved_by.full_name', read_only=True, default=None,
    )

    class Meta:
        model = GeneratedQuestion
        fields = [
            'id', 'reference_id', 'question_text', 'key_answer', 'topic',
            'subject', 'subject_name', 'source_document', 'source_document_name',
            'marks', 'difficulty', 'grading_rubric', 'status',
            'approved_by', 'approved_by_name', 'approved_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_id', 'status', 'approved_by', 'approved_at',
            'created_at', 'updated_at',
        ]


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    question_detail = GeneratedQuestionSerializer(
        source='question', read_only=True,
    )

    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'assessment', 'question', 'question_detail', 'order']
        read_only_fields = ['id']


class InstitutionEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.full_name', read_only=True, default=None,
    )

    class Meta:
        model = InstitutionEvent
        fields = [
            'id', 'title', 'description', 'event_date', 'location',
            'photo', 'photo_count', 'created_by', 'created_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
