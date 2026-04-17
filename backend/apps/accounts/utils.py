import logging
import secrets
from datetime import timedelta

import requests
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from apps.accounts.models import OTP
from apps.admin_panel.models import IDConfiguration

logger = logging.getLogger(__name__)

MSG91_FLOW_URL = 'https://control.msg91.com/api/v5/flow'
MSG91_TIMEOUT_SECONDS = 10


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


def generate_otp_for_phone(phone: str, purpose: str) -> OTP:
    """Generate a 6-digit OTP for the given phone (parent login).
    Same rate limit as email: 3 per 15 minutes.
    """
    window_start = timezone.now() - timedelta(minutes=15)
    recent_count = OTP.objects.filter(
        phone=phone, purpose=purpose, created_at__gte=window_start,
    ).count()

    if recent_count >= 3:
        raise ValueError('Too many OTP requests. Please wait before trying again.')

    OTP.objects.filter(phone=phone, purpose=purpose, is_used=False).update(is_used=True)

    code = ''.join(secrets.choice('0123456789') for _ in range(6))
    otp = OTP.objects.create(
        phone=phone, code=code, purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=5),
    )

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


def send_otp_sms(otp: OTP) -> None:
    """Send OTP code via SMS through MSG91.

    Behaviour:
      - If MSG91_AUTH_KEY is unset, falls back to console stub (dev mode).
      - Otherwise, posts to MSG91 Flow API v5 with the configured DLT template.
      - Raises on HTTP error or MSG91 error response so Celery can retry.
    """
    if not settings.MSG91_AUTH_KEY or not settings.MSG91_OTP_TEMPLATE_ID:
        msg = f'[SMS STUB] OTP {otp.code} -> +91{otp.phone} (expires in 5 min)'
        logger.warning(msg)
        print(msg)
        return

    payload = {
        'template_id': settings.MSG91_OTP_TEMPLATE_ID,
        'short_url': '0',
        'recipients': [
            {
                'mobiles': f'{settings.MSG91_COUNTRY_CODE}{otp.phone}',
                # ##OTP## is the convention MSG91 uses for the OTP placeholder
                # in DLT templates. Add other variables here if your template
                # has more (e.g. brand name, expiry minutes).
                'OTP': otp.code,
            }
        ],
    }

    try:
        response = requests.post(
            MSG91_FLOW_URL,
            json=payload,
            headers={
                'authkey': settings.MSG91_AUTH_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            timeout=MSG91_TIMEOUT_SECONDS,
        )
    except requests.exceptions.RequestException as exc:
        logger.error('MSG91 request failed for phone %s: %s', otp.phone, exc)
        raise

    if response.status_code >= 400:
        logger.error(
            'MSG91 returned HTTP %s for phone %s: %s',
            response.status_code, otp.phone, response.text[:500],
        )
        response.raise_for_status()

    try:
        body = response.json()
    except ValueError:
        logger.error('MSG91 returned non-JSON for phone %s: %s', otp.phone, response.text[:500])
        raise RuntimeError('MSG91 returned malformed response')

    # MSG91 success response: {"type": "success", "message": "..."}
    if body.get('type') != 'success':
        logger.error('MSG91 rejected request for phone %s: %s', otp.phone, body)
        raise RuntimeError(f'MSG91 error: {body.get("message", "unknown")}')

    logger.info('SMS dispatched via MSG91 to phone %s', otp.phone)


def normalize_phone(phone: str) -> str:
    """Strip everything except digits. Drops +91 country code if present.
    Returns the 10-digit Indian mobile number.
    """
    digits = ''.join(c for c in phone if c.isdigit())
    if len(digits) == 12 and digits.startswith('91'):
        digits = digits[2:]
    return digits


def mask_email(email: str) -> str:
    """Mask email: 'ramesh@gmail.com' → 'r****h@gmail.com'"""
    local, domain = email.split('@')
    if len(local) <= 2:
        masked_local = local[0] + '*'
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    return f'{masked_local}@{domain}'


def mask_phone(phone: str) -> str:
    """Mask phone: '9876543210' → '98****3210'"""
    if len(phone) < 6:
        return phone
    return phone[:2] + '*' * (len(phone) - 6) + phone[-4:]


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
