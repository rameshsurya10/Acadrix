from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from apps.accounts.permissions import IsSuperAdmin, IsSuperAdminOrAdmin, IsAdminOrPrincipal
from apps.accounts.serializers import UserSerializer

from .enrollment_serializers import (
    EnrollAdminSerializer,
    EnrollPrincipalSerializer,
    EnrollStudentSerializer,
    EnrollTeacherSerializer,
)


class EnrollTeacherView(GenericAPIView):
    permission_classes = [IsAdminOrPrincipal]
    serializer_class = EnrollTeacherSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'employee_id': result['employee_id'],
                'email_sent': result['email_sent'],
            },
            'message': 'Teacher enrolled successfully.',
        }, status=status.HTTP_201_CREATED)


class EnrollStudentView(GenericAPIView):
    permission_classes = [IsAdminOrPrincipal]
    serializer_class = EnrollStudentSerializer

    def post(self, request):
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


class EnrollPrincipalView(GenericAPIView):
    permission_classes = [IsSuperAdminOrAdmin]
    serializer_class = EnrollPrincipalSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'employee_id': result['employee_id'],
                'email_sent': result['email_sent'],
            },
            'message': 'Principal enrolled successfully.',
        }, status=status.HTTP_201_CREATED)


class EnrollAdminView(GenericAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = EnrollAdminSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.create(serializer.validated_data)
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(result['user'], context={'request': request}).data,
                'email_sent': result['email_sent'],
            },
            'message': 'Admin enrolled successfully.',
        }, status=status.HTTP_201_CREATED)
