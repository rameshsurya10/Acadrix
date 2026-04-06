import requests as http_requests
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .backends import MultiMethodAuthBackend
from .models import User, OTP, UserTourProgress
from .serializers import (
    IdentifySerializer, LoginSerializer, UserSerializer,
    VerifyOTPSerializer, SetPasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    TourProgressSerializer,
)
from .utils import generate_otp, send_otp_email, mask_email


class LoginThrottle(AnonRateThrottle):
    scope = 'login'

class IdentifyThrottle(AnonRateThrottle):
    scope = 'identify'

class OTPThrottle(AnonRateThrottle):
    scope = 'otp'

class ForgotPasswordThrottle(AnonRateThrottle):
    scope = 'forgot_password'


def _token_response(user, request):
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user, context={'request': request}).data,
    })


class IdentifyView(GenericAPIView):
    """POST /api/v1/auth/identify/ — detect login method from identifier."""
    permission_classes = [AllowAny]
    throttle_classes = [IdentifyThrottle]
    serializer_class = IdentifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier'].strip()

        if '@' in identifier:
            return self._handle_email(identifier)
        return self._handle_id(identifier)

    def _handle_email(self, email):
        user = (
            User.objects
            .filter(email=email, is_active=True)
            .only('id', 'email', 'role', 'first_name', 'last_name')
            .first()
        )
        if not user:
            return Response(
                {'success': False, 'error': 'No account found with this email. Please use your ID to log in.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.role in ('admin', 'principal'):
            return Response({
                'success': True,
                'data': {'method': 'password', 'role': user.role, 'name': user.first_name},
            })

        try:
            otp = generate_otp(email, 'login')
            send_otp_email(otp)
        except ValueError as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return Response({
            'success': True,
            'data': {'method': 'otp', 'hint': mask_email(email), 'role': user.role, 'name': user.first_name},
        })

    def _handle_id(self, identifier):
        backend = MultiMethodAuthBackend()
        user = backend._resolve_user(identifier)

        if not user or not user.is_active:
            return Response(
                {'success': False, 'error': 'No account found with this ID. Contact your administrator.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        method = 'password' if user.has_usable_password() else 'set_password'

        return Response({
            'success': True,
            'data': {'method': method, 'role': user.role, 'name': user.first_name},
        })


class LoginView(GenericAPIView):
    """POST /api/v1/auth/login/ — identifier (email or ID) + password."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return _token_response(serializer.validated_data['user'], request)


class VerifyOTPView(GenericAPIView):
    """POST /api/v1/auth/verify-otp/ — verify email OTP and return tokens."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPThrottle]
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['otp']

        otp = (
            OTP.objects
            .filter(email=email, purpose='login', is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp or not otp.is_valid:
            return Response(
                {'success': False, 'error': 'OTP has expired or is invalid. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            remaining = 5 - otp.attempts
            if remaining <= 0:
                otp.is_used = True
                otp.save(update_fields=['is_used'])
                return Response(
                    {'success': False, 'error': 'Too many incorrect attempts. Please request a new OTP.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {'success': False, 'error': f'Incorrect OTP. {remaining} attempts remaining.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save(update_fields=['is_used'])

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response(
                {'success': False, 'error': 'Account not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return _token_response(user, request)


class SetPasswordView(GenericAPIView):
    """POST /api/v1/auth/set-password/ — first-time password setup via ID."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = SetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']
        password = serializer.validated_data['password']

        backend = MultiMethodAuthBackend()
        user = backend._resolve_user(identifier)

        if not user or not user.is_active:
            return Response(
                {'success': False, 'error': 'No account found with this ID.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.has_usable_password():
            return Response(
                {'success': False, 'error': 'Password is already set. Use login instead.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=['password'])

        return _token_response(user, request)


class ForgotPasswordView(GenericAPIView):
    """POST /api/v1/auth/forgot-password/ — send OTP for password reset."""
    permission_classes = [AllowAny]
    throttle_classes = [ForgotPasswordThrottle]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email, is_active=True).only('id').first()
        if not user:
            return Response(
                {'success': False, 'error': 'No account found with this email.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            otp = generate_otp(email, 'forgot_password')
            send_otp_email(otp)
        except ValueError as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return Response({
            'success': True,
            'message': 'OTP sent to your email.',
            'data': {'hint': mask_email(email)},
        })


class ResetPasswordView(GenericAPIView):
    """POST /api/v1/auth/reset-password/ — reset password with OTP."""
    permission_classes = [AllowAny]
    throttle_classes = [OTPThrottle]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        otp = (
            OTP.objects
            .filter(email=email, purpose='forgot_password', is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp or not otp.is_valid:
            return Response(
                {'success': False, 'error': 'OTP has expired or is invalid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            return Response(
                {'success': False, 'error': 'Incorrect OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save(update_fields=['is_used'])

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response(
                {'success': False, 'error': 'Account not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return _token_response(user, request)


class MeView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        return Response(self.get_serializer(request.user).data)


class LogoutView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class RefreshTokenView(TokenRefreshView):
    pass


class GoogleOAuthURLView(GenericAPIView):
    permission_classes = [AllowAny]
    GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

    def get(self, request):
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'select_account',
        }
        url = f"{self.GOOGLE_AUTH_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
        return Response({'url': url})


class GoogleOAuthCallbackView(GenericAPIView):
    """Google OAuth — only teacher/student. Admin/principal must use email+password."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {'success': False, 'error': 'Authorization code is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_email = self._get_google_email(code)
        if google_email is None:
            return Response(
                {'success': False, 'error': 'Failed to authenticate with Google.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = (
            User.objects
            .filter(email=google_email, is_active=True)
            .only('id', 'email', 'role', 'first_name', 'last_name', 'is_active')
            .first()
        )

        if not user:
            return Response(
                {'success': False, 'error': 'This Google account is not registered. Contact your administrator.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.role in ('admin', 'principal'):
            return Response(
                {'success': False, 'error': 'Google sign-in is not available for admin accounts. Please use email and password.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _token_response(user, request)

    def _get_google_email(self, code):
        token_response = http_requests.post(self.GOOGLE_TOKEN_URL, data={
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }, timeout=10)

        if token_response.status_code != 200:
            return None

        access_token = token_response.json().get('access_token')
        userinfo_response = http_requests.get(
            self.GOOGLE_USERINFO_URL,
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10,
        )

        if userinfo_response.status_code != 200:
            return None

        return userinfo_response.json().get('email')


class TourProgressView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TourProgressSerializer

    def get(self, request):
        completed = list(
            UserTourProgress.objects
            .filter(user=request.user)
            .values_list('tour_key', flat=True)
        )
        return Response({'success': True, 'data': completed})

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tour_key = serializer.validated_data['tour_key']
        _, created = UserTourProgress.objects.get_or_create(
            user=request.user, tour_key=tour_key,
        )
        return Response(
            {'success': True, 'message': f'Tour "{tour_key}" marked as completed.'},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
