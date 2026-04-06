from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.permissions import IsTeacher
from apps.accounts.serializers import UserSerializer
from apps.admin_panel.enrollment_serializers import EnrollStudentSerializer

from .enrollment_serializers import TeacherEnrollStudentSerializer


class TeacherEnrollStudentView(GenericAPIView):
    permission_classes = [IsTeacher]
    serializer_class = EnrollStudentSerializer

    def post(self, request):
        section_id = request.data.get('section')
        if not section_id:
            return Response(
                {'success': False, 'error': 'Section is required for teacher enrollment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        scope_serializer = TeacherEnrollStudentSerializer(
            data={'section': section_id}, context={'request': request},
        )
        if not scope_serializer.is_valid():
            raise PermissionDenied(
                scope_serializer.errors.get('section', ['Access denied.'])[0]
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)

        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'student_id': result['student_id'],
                'email_sent': result['email_sent'],
            },
            'message': 'Student enrolled successfully.',
        }, status=status.HTTP_201_CREATED)
