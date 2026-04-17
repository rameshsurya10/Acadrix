"""Celery tasks for the principal app.

Generating questions is slow (5-30s per document including LLM latency),
so the HTTP endpoint dispatches this task and returns immediately. The
frontend polls the GeneratedQuestion list to show results as they arrive.

Retries on transient errors (network blip hitting Anthropic) but NOT on
LLMNotConfigured — that's a config problem that won't self-heal.
"""
import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    name='principal.generate_questions_from_document',
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=180,
    retry_jitter=True,
    max_retries=2,
    ignore_result=True,
)
def generate_questions_from_document_task(
    self,
    source_document_id: int,
    subject_id: int,
    num_questions: int = 10,
) -> None:
    """Fetch the document + subject, run the generator, log outcome.

    Errors:
      - LLMNotConfigured → don't retry, just log (configuration issue)
      - PDFExtractionError → don't retry (bad input, won't change)
      - Everything else → retry via Celery (network blips, rate limits)
    """
    from apps.principal.models import SourceDocument
    from apps.principal.services.question_generator import (
        LLMError,
        LLMNotConfigured,
        PDFExtractionError,
        generate_questions_for_document,
    )
    from apps.shared.models import Subject

    doc = SourceDocument.objects.filter(pk=source_document_id).first()
    if not doc:
        logger.warning('generate_questions task: doc %s not found', source_document_id)
        return

    subject = Subject.objects.filter(pk=subject_id).first()
    if not subject:
        logger.warning('generate_questions task: subject %s not found', subject_id)
        return

    try:
        saved = generate_questions_for_document(
            source_document=doc,
            subject=subject,
            num_questions=num_questions,
            skip_if_existing=True,
        )
        logger.info(
            'Generated %d questions from doc %s (%s)',
            len(saved), doc.id, doc.file_name,
        )
    except (LLMNotConfigured, PDFExtractionError) as exc:
        # Don't retry on config or bad-input errors
        logger.error(
            'Question generation failed (no retry): doc=%s error=%s',
            doc.id, exc,
        )
        return
    except LLMError as exc:
        # LLMError may be transient (rate limit) or permanent (bad JSON)
        # Retry via the autoretry_for decorator
        logger.warning('LLM error for doc %s: %s — will retry', doc.id, exc)
        raise
