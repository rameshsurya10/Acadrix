"""Celery tasks for the accounts app.

Pattern: views call `task.delay(otp_id)`. The task fetches the OTP from the DB
and calls the underlying utility function. This decouples sending from the
request thread so an SMTP/SMS hiccup never blocks the user.

All tasks auto-retry up to 3 times with exponential backoff.
"""
import logging

from celery import shared_task

from .models import OTP

logger = logging.getLogger(__name__)


@shared_task(
    name='accounts.send_otp_email',
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=3,
    ignore_result=True,
)
def send_otp_email_task(self, otp_id: int) -> None:
    """Fetch the OTP and dispatch via email. Retries on transient SMTP errors."""
    from .utils import send_otp_email

    otp = OTP.objects.filter(pk=otp_id).first()
    if not otp:
        logger.warning('send_otp_email_task: OTP %s not found (already deleted?)', otp_id)
        return
    if otp.is_used:
        logger.info('send_otp_email_task: OTP %s already used, skipping send', otp_id)
        return

    send_otp_email(otp)


@shared_task(
    name='accounts.send_otp_sms',
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=3,
    ignore_result=True,
)
def send_otp_sms_task(self, otp_id: int) -> None:
    """Fetch the OTP and dispatch via SMS (Phase 0 stub, Phase 1.2 real)."""
    from .utils import send_otp_sms

    otp = OTP.objects.filter(pk=otp_id).first()
    if not otp:
        logger.warning('send_otp_sms_task: OTP %s not found', otp_id)
        return
    if otp.is_used:
        logger.info('send_otp_sms_task: OTP %s already used, skipping send', otp_id)
        return

    send_otp_sms(otp)
