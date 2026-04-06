import secrets
from datetime import timedelta

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from apps.accounts.models import OTP
from apps.admin_panel.models import IDConfiguration


def generate_otp(email: str, purpose: str) -> OTP:
    """Generate a 6-digit OTP for the given email and purpose.
    Raises ValueError if rate limit exceeded (3 per 15 minutes).
    """
    window_start = timezone.now() - timedelta(minutes=15)
    recent_count = OTP.objects.filter(
        email=email, purpose=purpose, created_at__gte=window_start,
    ).count()

    if recent_count >= 3:
        raise ValueError('Too many OTP requests. Please wait before trying again.')

    OTP.objects.filter(email=email, purpose=purpose, is_used=False).update(is_used=True)

    code = ''.join(secrets.choice('0123456789') for _ in range(6))
    otp = OTP.objects.create(
        email=email, code=code, purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=5),
    )

    # Clean up expired OTPs older than 1 hour (lightweight, runs occasionally)
    OTP.objects.filter(expires_at__lt=timezone.now() - timedelta(hours=1)).delete()

    return otp


def send_otp_email(otp: OTP) -> None:
    """Send OTP code via email."""
    subject = 'Acadrix — Your verification code'
    message = (
        f'Your Acadrix verification code is: {otp.code}\n\n'
        f'This code expires in 5 minutes.\n'
        f'If you did not request this, please ignore this email.'
    )
    send_mail(
        subject=subject, message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[otp.email], fail_silently=False,
    )


def mask_email(email: str) -> str:
    """Mask email: 'ramesh@gmail.com' → 'r****h@gmail.com'"""
    local, domain = email.split('@')
    if len(local) <= 2:
        masked_local = local[0] + '*'
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    return f'{masked_local}@{domain}'


def generate_id(role: str, suffix: str | None = None) -> str:
    """Generate an ID for the given role using IDConfiguration.
    If suffix provided, uses it. Otherwise auto-increments.
    Raises ValueError if no IDConfiguration exists.
    """
    try:
        config = IDConfiguration.objects.get(role=role)
    except IDConfiguration.DoesNotExist:
        raise ValueError(f'No ID configuration found for role: {role}')

    full_prefix = config.full_prefix

    if suffix is not None:
        return f'{full_prefix}-{suffix}'

    from apps.teacher.models import TeacherProfile
    from apps.student.models import StudentProfile
    from apps.principal.models import PrincipalProfile

    model_map = {
        'teacher': (TeacherProfile, 'employee_id'),
        'student': (StudentProfile, 'student_id'),
        'principal': (PrincipalProfile, 'employee_id'),
    }

    model_class, id_field = model_map[role]
    filter_kwargs = {f'{id_field}__startswith': f'{full_prefix}-'}
    count = model_class.objects.filter(**filter_kwargs).count()
    next_num = count + 1

    # Verify uniqueness (handle gaps from deleted records)
    candidate = f'{full_prefix}-{next_num:02d}'
    while model_class.objects.filter(**{id_field: candidate}).exists():
        next_num += 1
        candidate = f'{full_prefix}-{next_num:02d}'

    return candidate
