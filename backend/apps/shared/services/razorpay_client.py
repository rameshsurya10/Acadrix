"""Razorpay service layer.

Thin wrapper around the official `razorpay` SDK. Isolates gateway calls so:
  - Views never touch the SDK directly
  - Tests can mock this module cleanly
  - Swapping providers later (Stripe/PayU) means changing one file

Three public helpers:
  - create_order(amount_rupees, receipt_id, notes)   -> dict
  - verify_payment_signature(order_id, payment_id, signature)  -> bool
  - verify_webhook_signature(raw_body, signature)    -> bool
"""
import hmac
import hashlib
import logging
from decimal import Decimal
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)


class RazorpayNotConfigured(RuntimeError):
    """Raised when Razorpay is accessed but no key/secret is set."""


class RazorpayError(RuntimeError):
    """Raised when Razorpay returns an error or signature fails."""


def _client():
    """Return an authenticated razorpay.Client, or raise RazorpayNotConfigured."""
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise RazorpayNotConfigured(
            'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
        )
    import razorpay  # local import so tests can mock without razorpay installed
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(amount_rupees: Decimal | float | int, receipt_id: str, notes: dict[str, Any] | None = None) -> dict:
    """Create a Razorpay order. Amount is given in rupees; Razorpay expects paise.

    Returns the raw order dict from Razorpay which includes 'id', 'amount',
    'currency', 'status' and other fields.
    """
    amount_paise = int(Decimal(str(amount_rupees)) * 100)
    if amount_paise <= 0:
        raise RazorpayError('Order amount must be positive.')

    client = _client()
    try:
        order = client.order.create({
            'amount': amount_paise,
            'currency': settings.RAZORPAY_CURRENCY,
            'receipt': receipt_id,
            'notes': notes or {},
            'payment_capture': 1,  # auto-capture on successful payment
        })
    except Exception as exc:
        logger.error('Razorpay order creation failed: %s', exc)
        raise RazorpayError(f'Razorpay order creation failed: {exc}') from exc

    logger.info('Razorpay order created: %s (amount_paise=%s)', order.get('id'), amount_paise)
    return order


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify the signature Razorpay sends in the checkout success handler.

    Formula: HMAC-SHA256(order_id|payment_id, key_secret) == signature

    Returns True if valid, False otherwise. Never raises — the caller decides
    what to do with an invalid signature (usually a 400 response).
    """
    if not (order_id and payment_id and signature):
        return False
    if not settings.RAZORPAY_KEY_SECRET:
        return False

    expected = hmac.new(
        key=settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
        msg=f'{order_id}|{payment_id}'.encode('utf-8'),
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """Verify the X-Razorpay-Signature header on an incoming webhook.

    Formula: HMAC-SHA256(raw_request_body, webhook_secret) == signature
    Note: the webhook secret is SEPARATE from the API key secret.
    """
    if not signature or not settings.RAZORPAY_WEBHOOK_SECRET:
        return False

    expected = hmac.new(
        key=settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
        msg=raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)
