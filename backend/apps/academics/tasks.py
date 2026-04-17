"""Celery tasks for the academics app.

PDF generation is expensive (1-3s per document). The HTTP endpoints render
synchronously to keep the UX simple, but bulk operations (e.g. "generate
report cards for all 40 students in Grade 5") should go through these tasks
to avoid tying up a request thread for minutes.

Usage from a bulk view:
    for rc_id in report_card_ids:
        generate_report_card_pdf_task.delay(rc_id)
"""
import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    name='academics.generate_report_card_pdf',
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=120,
    max_retries=3,
    ignore_result=True,
)
def generate_report_card_pdf_task(self, report_card_id: int) -> None:
    """Render a GeneratedReportCard to PDF bytes.

    Currently the PDF is generated and logged (for size/validation).
    In Phase 1.6+ we'll cache the bytes to S3 and store the URL on the model
    so repeat downloads don't re-render.
    """
    from apps.academics.models import GeneratedReportCard
    from apps.shared.services.pdf_generator import render_report_card_pdf

    report_card = (
        GeneratedReportCard.objects
        .select_related('student__user', 'template__grade', 'term', 'academic_year')
        .filter(pk=report_card_id)
        .first()
    )
    if not report_card:
        logger.warning('generate_report_card_pdf_task: id %s not found', report_card_id)
        return

    pdf_bytes = render_report_card_pdf(report_card)
    logger.info(
        'Generated report card PDF: id=%s student=%s bytes=%d',
        report_card_id, report_card.student.student_id, len(pdf_bytes),
    )


@shared_task(
    name='academics.generate_certificate_pdf',
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=120,
    max_retries=3,
    ignore_result=True,
)
def generate_certificate_pdf_task(self, certificate_id: int) -> None:
    """Render an IssuedCertificate to PDF bytes."""
    from apps.academics.models import IssuedCertificate
    from apps.shared.services.pdf_generator import render_certificate_pdf

    certificate = (
        IssuedCertificate.objects
        .select_related('student__user', 'template')
        .filter(pk=certificate_id)
        .first()
    )
    if not certificate:
        logger.warning('generate_certificate_pdf_task: id %s not found', certificate_id)
        return

    pdf_bytes = render_certificate_pdf(certificate)
    logger.info(
        'Generated certificate PDF: id=%s serial=%s bytes=%d',
        certificate_id, certificate.serial_number, len(pdf_bytes),
    )
