"""AI Question Generator service.

Pipeline:
    SourceDocument (PDF) → pypdf extracts text → Anthropic Claude generates
    question JSON → we parse + save as GeneratedQuestion rows.

Two public entry points:
    extract_pdf_text(file_handle)          -> str
    generate_questions_for_document(doc)   -> list[GeneratedQuestion]

The second is the main one. It's idempotent by checking if questions already
exist for that source document — so re-running the Celery task is safe.

Configuration:
    ANTHROPIC_API_KEY       — empty disables the feature (returns error)
    ANTHROPIC_MODEL         — default claude-sonnet-4-5
    ANTHROPIC_MAX_INPUT_CHARS — cap on extracted PDF text (default 40k)

Extending:
    The PROMPT_TEMPLATE is a regular string. Customize it to match your
    school's syllabus conventions, language, or answer format. The JSON
    schema expected from Claude is documented in the prompt.
"""
import json
import logging
import re
import secrets
from typing import Any

from django.conf import settings
from django.db import transaction

from apps.principal.models import GeneratedQuestion, SourceDocument

logger = logging.getLogger(__name__)


class LLMNotConfigured(RuntimeError):
    """Raised when ANTHROPIC_API_KEY is empty."""


class LLMError(RuntimeError):
    """Raised when Anthropic returns an error or the response is unusable."""


class PDFExtractionError(RuntimeError):
    """Raised when pypdf cannot read the file (corrupted, encrypted, scanned)."""


# ── PDF extraction ──────────────────────────────────────────────────────────

def extract_pdf_text(file_handle) -> str:
    """Read a PDF FileField and return all extracted text.

    Truncates to ANTHROPIC_MAX_INPUT_CHARS so we don't burn tokens on
    500-page textbooks.
    """
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise PDFExtractionError('pypdf not installed') from exc

    try:
        reader = PdfReader(file_handle)
    except Exception as exc:
        raise PDFExtractionError(f'Could not read PDF: {exc}') from exc

    pages = []
    for page in reader.pages:
        try:
            text = page.extract_text() or ''
        except Exception:
            # Some pages fail individually — skip them, keep the rest
            continue
        if text.strip():
            pages.append(text.strip())

    full_text = '\n\n'.join(pages).strip()

    if not full_text:
        raise PDFExtractionError(
            'No text extracted. PDF may be image-only (scanned) or encrypted.'
        )

    max_chars = settings.ANTHROPIC_MAX_INPUT_CHARS
    if len(full_text) > max_chars:
        full_text = full_text[:max_chars] + '\n\n[TRUNCATED]'
        logger.info('PDF text truncated to %d chars', max_chars)

    return full_text


# ── Prompt template ─────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """You are an experienced K-12 teacher in India creating exam questions from course material.

Your task: read the source material below and generate {num_questions} exam-style questions.

Requirements:
- Mix of 2-mark and 5-mark questions (roughly 60% 2-mark, 40% 5-mark)
- Spread across Easy / Medium / Hard difficulty
- Each question must be answerable from the source material
- 2-mark questions: 1-2 sentence answers (short answer)
- 5-mark questions: 3-5 point answers (long answer with explanation)
- For each question provide a key_answer AND a grading_rubric explaining what
  a good answer must contain
- Use clear, age-appropriate language for the stated subject level

Subject context: {subject_context}

Source material:
<source>
{source_text}
</source>

Return ONLY a JSON object wrapped in <json>...</json> tags. The JSON must match:
{{
  "questions": [
    {{
      "question_text": "string",
      "key_answer": "string",
      "topic": "string (specific topic name, 2-5 words)",
      "marks": 2 | 5,
      "difficulty": "easy" | "medium" | "hard",
      "grading_rubric": {{
        "key_points": ["point 1", "point 2"],
        "mark_allocation": "string explaining how marks are split"
      }}
    }}
  ]
}}

Generate exactly {num_questions} questions. Return ONLY the <json>...</json> block, no other text.
"""


# ── LLM call ────────────────────────────────────────────────────────────────

def _call_claude(source_text: str, subject_context: str, num_questions: int) -> list[dict[str, Any]]:
    """Send the prompt to Claude and parse the JSON response.

    Returns a list of question dicts. Raises LLMError on failure.
    """
    if not settings.ANTHROPIC_API_KEY:
        raise LLMNotConfigured(
            'ANTHROPIC_API_KEY is not set. AI question generation is disabled.'
        )

    try:
        import anthropic
    except ImportError as exc:
        raise LLMError('anthropic package not installed') from exc

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    prompt = PROMPT_TEMPLATE.format(
        num_questions=num_questions,
        subject_context=subject_context or 'General',
        source_text=source_text,
    )

    try:
        message = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=4096,
            messages=[{'role': 'user', 'content': prompt}],
        )
    except Exception as exc:
        logger.exception('Anthropic API call failed')
        raise LLMError(f'Anthropic API call failed: {exc}') from exc

    # Response format: [{"type": "text", "text": "..."}]
    content_blocks = message.content
    if not content_blocks:
        raise LLMError('Empty response from Claude')

    text = ''.join(
        getattr(block, 'text', '') for block in content_blocks
    )

    return _parse_questions_json(text)


def _parse_questions_json(text: str) -> list[dict[str, Any]]:
    """Extract and parse the JSON block from Claude's response."""
    match = re.search(r'<json>(.*?)</json>', text, re.DOTALL)
    if not match:
        # Fallback: try raw JSON if the model forgot the tags
        try:
            parsed = json.loads(text.strip())
        except json.JSONDecodeError:
            raise LLMError('Response did not contain a <json>...</json> block')
    else:
        try:
            parsed = json.loads(match.group(1).strip())
        except json.JSONDecodeError as exc:
            raise LLMError(f'Malformed JSON in response: {exc}') from exc

    questions = parsed.get('questions')
    if not isinstance(questions, list) or not questions:
        raise LLMError('Response JSON missing "questions" array')

    return questions


# ── Persistence ─────────────────────────────────────────────────────────────

def _save_questions(
    source_document: SourceDocument,
    subject,
    questions: list[dict[str, Any]],
) -> list[GeneratedQuestion]:
    """Persist a batch of question dicts as GeneratedQuestion rows atomically.

    Each question gets a unique reference_id like `AI-MATH-XXXX`.
    """
    prefix = 'AI-'
    if source_document.subject_context:
        cleaned = re.sub(r'[^A-Z0-9]', '', source_document.subject_context.upper())[:8]
        if cleaned:
            prefix = f'AI-{cleaned}-'

    saved = []
    with transaction.atomic():
        for q in questions:
            ref = f'{prefix}{secrets.token_hex(3).upper()}'
            saved.append(
                GeneratedQuestion.objects.create(
                    source_document=source_document,
                    reference_id=ref,
                    question_text=str(q.get('question_text', '')).strip(),
                    key_answer=str(q.get('key_answer', '')).strip(),
                    topic=str(q.get('topic', ''))[:120].strip(),
                    subject=subject,
                    marks=int(q.get('marks', 2)),
                    difficulty=str(q.get('difficulty', 'medium')).lower(),
                    grading_rubric=q.get('grading_rubric', {}),
                    status=GeneratedQuestion.Status.DRAFT,
                )
            )
    return saved


# ── Main entry point ────────────────────────────────────────────────────────

def generate_questions_for_document(
    source_document: SourceDocument,
    subject,
    num_questions: int = 10,
    skip_if_existing: bool = True,
) -> list[GeneratedQuestion]:
    """Run the full pipeline for a single SourceDocument.

    Args:
        source_document: the uploaded PDF
        subject: the shared.Subject this document relates to
        num_questions: target question count (Claude may return ±1-2)
        skip_if_existing: if True and questions already exist, return those
            without re-calling the LLM (idempotent)

    Returns the list of GeneratedQuestion rows.

    Raises:
        LLMNotConfigured — when ANTHROPIC_API_KEY is empty
        PDFExtractionError — when pypdf fails
        LLMError — when Claude fails or returns unparsable output
    """
    if skip_if_existing:
        existing = list(source_document.questions.all())
        if existing:
            logger.info(
                'Skipping generation: %d questions already exist for doc %s',
                len(existing), source_document.id,
            )
            return existing

    with source_document.file.open('rb') as fh:
        source_text = extract_pdf_text(fh)

    logger.info(
        'Generating %d questions for doc %s (%d chars of source text)',
        num_questions, source_document.id, len(source_text),
    )

    question_data = _call_claude(
        source_text=source_text,
        subject_context=source_document.subject_context,
        num_questions=num_questions,
    )

    saved = _save_questions(source_document, subject, question_data)
    logger.info('Saved %d generated questions for doc %s', len(saved), source_document.id)
    return saved
