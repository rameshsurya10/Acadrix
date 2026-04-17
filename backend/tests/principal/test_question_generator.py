"""Tests for the AI question generator service (Phase 3.1).

Strategy:
  - Mock pypdf.PdfReader so tests don't need real PDF fixtures
  - Mock anthropic.Anthropic so tests don't hit the API (and don't need an API key)
  - Exercise every branch: happy path, LLM not configured, bad JSON,
    empty response, PDF extraction failures, idempotency

These tests run under `CELERY_TASK_ALWAYS_EAGER=True` (set in settings_test.py),
so `.delay()` calls execute inline.
"""
from decimal import Decimal
from io import BytesIO
from unittest.mock import MagicMock, patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from apps.accounts.models import User
from apps.principal.models import GeneratedQuestion, SourceDocument
from apps.principal.services.question_generator import (
    LLMError,
    LLMNotConfigured,
    PDFExtractionError,
    _parse_questions_json,
    generate_questions_for_document,
)
from apps.shared.models import Department, Subject


def _make_fixture():
    user = User.objects.create_user(
        username='principal1', email='p@test.com', password='p',
        role='principal', first_name='Pri', last_name='Principal',
    )
    dept = Department.objects.create(name='Science')
    subject = Subject.objects.create(name='Physics', code='PHY', department=dept)
    doc = SourceDocument.objects.create(
        uploaded_by=user,
        file=SimpleUploadedFile('chapter-1.pdf', b'%PDF-fake', content_type='application/pdf'),
        file_name='chapter-1.pdf',
        file_size_bytes=9,
        subject_context='Physics',
    )
    return user, subject, doc


SAMPLE_LLM_RESPONSE = """<json>
{
  "questions": [
    {
      "question_text": "State Newton's first law of motion.",
      "key_answer": "An object at rest stays at rest...",
      "topic": "Newton's Laws",
      "marks": 2,
      "difficulty": "easy",
      "grading_rubric": {
        "key_points": ["Inertia", "Net force zero"],
        "mark_allocation": "1 for statement, 1 for example"
      }
    },
    {
      "question_text": "Derive F = ma from Newton's second law.",
      "key_answer": "Starting from the definition of momentum...",
      "topic": "Newton's Laws",
      "marks": 5,
      "difficulty": "hard",
      "grading_rubric": {
        "key_points": ["Momentum definition", "Derivative", "Units check"],
        "mark_allocation": "2 setup, 2 derivation, 1 verification"
      }
    }
  ]
}
</json>"""


class ParseQuestionsJSONTest(TestCase):
    def test_parses_valid_json_block(self):
        qs = _parse_questions_json(SAMPLE_LLM_RESPONSE)
        self.assertEqual(len(qs), 2)
        self.assertEqual(qs[0]['marks'], 2)
        self.assertEqual(qs[1]['difficulty'], 'hard')

    def test_fallback_to_raw_json_when_tags_missing(self):
        raw = '{"questions": [{"question_text": "Q", "marks": 2, "difficulty": "easy", "topic": "T", "key_answer": "A"}]}'
        qs = _parse_questions_json(raw)
        self.assertEqual(len(qs), 1)

    def test_malformed_json_raises(self):
        with self.assertRaises(LLMError):
            _parse_questions_json('<json>not json at all</json>')

    def test_missing_questions_array_raises(self):
        with self.assertRaises(LLMError):
            _parse_questions_json('<json>{"other": []}</json>')


class GenerateQuestionsPipelineTest(TestCase):
    def setUp(self):
        self.user, self.subject, self.doc = _make_fixture()

    def _mock_claude_response(self, text: str = SAMPLE_LLM_RESPONSE):
        """Return a mock anthropic.messages.create response."""
        block = MagicMock()
        block.text = text
        message = MagicMock()
        message.content = [block]
        return message

    @override_settings(ANTHROPIC_API_KEY='')
    def test_raises_when_api_key_missing(self):
        with patch('apps.principal.services.question_generator.extract_pdf_text', return_value='hello'):
            with self.assertRaises(LLMNotConfigured):
                generate_questions_for_document(
                    source_document=self.doc,
                    subject=self.subject,
                    num_questions=2,
                )

    @override_settings(ANTHROPIC_API_KEY='test-key')
    @patch('apps.principal.services.question_generator.extract_pdf_text')
    def test_happy_path_saves_questions(self, mock_extract):
        mock_extract.return_value = 'Newton wrote that every object in a state of uniform motion...'

        mock_client = MagicMock()
        mock_client.messages.create.return_value = self._mock_claude_response()

        with patch('anthropic.Anthropic', return_value=mock_client):
            saved = generate_questions_for_document(
                source_document=self.doc,
                subject=self.subject,
                num_questions=2,
                skip_if_existing=False,
            )

        self.assertEqual(len(saved), 2)
        self.assertEqual(GeneratedQuestion.objects.filter(source_document=self.doc).count(), 2)

        # Check field mapping
        q_easy = GeneratedQuestion.objects.get(marks=2)
        self.assertEqual(q_easy.difficulty, 'easy')
        self.assertEqual(q_easy.topic, "Newton's Laws")
        self.assertIn("Newton's first law", q_easy.question_text)
        self.assertTrue(q_easy.reference_id.startswith('AI-PHYSICS-'))
        self.assertEqual(q_easy.status, GeneratedQuestion.Status.DRAFT)

    @override_settings(ANTHROPIC_API_KEY='test-key')
    @patch('apps.principal.services.question_generator.extract_pdf_text')
    def test_idempotent_when_questions_already_exist(self, mock_extract):
        mock_extract.return_value = 'text'

        # Pre-seed a question for this document
        GeneratedQuestion.objects.create(
            source_document=self.doc,
            reference_id='AI-EXISTING-001',
            question_text='Pre-existing',
            key_answer='',
            topic='Existing',
            subject=self.subject,
            marks=2,
            difficulty='medium',
        )

        mock_client = MagicMock()
        mock_client.messages.create.return_value = self._mock_claude_response()

        with patch('anthropic.Anthropic', return_value=mock_client):
            result = generate_questions_for_document(
                source_document=self.doc,
                subject=self.subject,
                num_questions=5,
                skip_if_existing=True,
            )

        # Returned the existing one, did NOT call Claude
        self.assertEqual(len(result), 1)
        mock_client.messages.create.assert_not_called()

    @override_settings(ANTHROPIC_API_KEY='test-key')
    @patch('apps.principal.services.question_generator.extract_pdf_text')
    def test_llm_error_on_bad_response(self, mock_extract):
        mock_extract.return_value = 'text'

        bad_response = MagicMock()
        bad_response.content = [MagicMock(text='<json>garbage</json>')]
        mock_client = MagicMock()
        mock_client.messages.create.return_value = bad_response

        with patch('anthropic.Anthropic', return_value=mock_client):
            with self.assertRaises(LLMError):
                generate_questions_for_document(
                    source_document=self.doc,
                    subject=self.subject,
                    num_questions=2,
                    skip_if_existing=False,
                )

        # Nothing saved
        self.assertEqual(GeneratedQuestion.objects.filter(source_document=self.doc).count(), 0)

    @override_settings(ANTHROPIC_API_KEY='test-key')
    @patch('apps.principal.services.question_generator.extract_pdf_text')
    def test_pdf_extraction_error_bubbles_up(self, mock_extract):
        mock_extract.side_effect = PDFExtractionError('scanned PDF')
        with self.assertRaises(PDFExtractionError):
            generate_questions_for_document(
                source_document=self.doc,
                subject=self.subject,
                num_questions=2,
                skip_if_existing=False,
            )
