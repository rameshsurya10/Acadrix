from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'full_name', 'avatar_url']
        read_only_fields = fields

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class IdentifySerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=120)


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=120)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            identifier=attrs['identifier'],
            password=attrs['password'],
        )
        if not user or not user.is_active:
            raise serializers.ValidationError('Invalid credentials.')
        attrs['user'] = user
        return attrs


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class SetPasswordSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=120)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class TourProgressSerializer(serializers.Serializer):
    tour_key = serializers.CharField(max_length=60)
