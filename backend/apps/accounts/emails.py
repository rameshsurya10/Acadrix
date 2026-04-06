from django.conf import settings
from django.core.mail import send_mail


def send_welcome_email(email: str, first_name: str, role: str, generated_id: str) -> bool:
    """Send welcome email with login ID to newly enrolled user."""
    login_url = settings.CORS_ALLOWED_ORIGINS[0] + '/login'
    subject = 'Welcome to Acadrix — Your Account is Ready'
    message = (
        f'Hello {first_name},\n\n'
        f'You have been enrolled in Acadrix as a {role}.\n\n'
        f'Your login ID: {generated_id}\n\n'
        f'To get started:\n'
        f'1. Go to {login_url}\n'
        f'2. Enter your ID: {generated_id}\n'
        f'3. Set your password on first login\n\n'
        f'If you have any questions, contact your administrator.\n\n'
        f'— Acadrix Team'
    )
    try:
        send_mail(subject=subject, message=message, from_email=settings.DEFAULT_FROM_EMAIL,
                  recipient_list=[email], fail_silently=False)
        return True
    except Exception:
        return False
