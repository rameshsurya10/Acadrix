from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('identify/', views.IdentifyView.as_view(), name='identify'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('set-password/', views.SetPasswordView.as_view(), name='set-password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('me/', views.MeView.as_view(), name='me'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', views.RefreshTokenView.as_view(), name='token-refresh'),
    path('google/url/', views.GoogleOAuthURLView.as_view(), name='google-oauth-url'),
    path('google/callback/', views.GoogleOAuthCallbackView.as_view(), name='google-oauth-callback'),
    path('tour-progress/', views.TourProgressView.as_view(), name='tour-progress'),
]
