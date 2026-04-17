"""Tests for PDF generation (Phase 1.5).

Strategy: mock WeasyPrint at the function level so the suite doesn't depend
on system libraries (libcairo2, libpango-1.0-0) being installed in every dev
environment. A guarded real-rendering test runs only when WeasyPrint + libs
are available.
"""
from datetime import date, datetime
from unittest.mock import patch

import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.academics.models import (
    CertificateTemplate,
    GeneratedReportCard,
    IssuedCertificate,
    ReportCardTemplate,
    ReportCardTerm,
)
from apps.shared.models import AcademicYear, Grade
from apps.shared.services.pdf_generator import (
    PDFGenerationError,
    render_html_to_pdf,
    render_report_card_pdf,
    render_certificate_pdf,
)
from apps.student.models import StudentProfile


def _build_academic_fixtures():
    year = AcademicYear.objects.create(
        label='2025-2026', start_date=date(2025, 6, 1), end_date=date(2026, 3, 31),
        is_current=True,
    )
    grade = Grade.objects.create(level=5, label='Grade 5')
    template = ReportCardTemplate.objects.create(
        name='Grade 5 CBSE',
        board_type=ReportCardTemplate.BoardType.CBSE,
        grade=grade,
        academic_year=year,
        grading_scale=ReportCardTemplate.GradingScale.BOTH,
        show_attendance=True,
        show_remarks=True,
        show_rank=True,
        header_text='Board examination',
        footer_text='Results are provisional.',
    )
    term = ReportCardTerm.objects.create(
        template=template, term=ReportCardTerm.TermType.TERM1,
    )
    user = User.objects.create_user(
        username='s5', email='s5@test.com', password='p',
        role='student', first_name='Priya', last_name='Iyer',
    )
    student = StudentProfile.objects.create(
        user=user, student_id='SM-2025-0005', date_of_birth=date(2015, 7, 4),
    )
    report_card = GeneratedReportCard.objects.create(
        student=student, template=template, term=term, academic_year=year,
        status=GeneratedReportCard.Status.FINAL,
        data_snapshot={
            'subjects': [
                {'name': 'English', 'max': 100, 'obtained': 92, 'grade': 'A1'},
                {'name': 'Maths', 'max': 100, 'obtained': 88, 'grade': 'A2'},
                {'name': 'Science', 'max': 100, 'obtained': 79, 'grade': 'B1'},
            ],
            'total_marks': 300,
            'marks_obtained': 259,
            'percentage': 86.3,
            'rank': 4,
            'overall_grade': 'A2',
            'remarks': 'Consistent performance. Keep it up!',
            'attendance_total': 120,
            'attendance_present': 115,
        },
    )
    return {
        'year': year, 'grade': grade, 'template': template,
        'term': term, 'user': user, 'student': student,
        'report_card': report_card,
    }


# ─── PDF service layer ──────────────────────────────────────────────────────

class PDFServiceUnitTest(TestCase):
    """Mock WeasyPrint and verify the service pipeline."""

    @patch('apps.shared.services.pdf_generator.render_html_to_pdf')
    def test_report_card_render_calls_weasyprint_with_rendered_html(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 fake'
        fx = _build_academic_fixtures()
        result = render_report_card_pdf(fx['report_card'])
        self.assertEqual(result, b'%PDF-1.4 fake')
        mock_render.assert_called_once()
        html_arg = mock_render.call_args.args[0]
        # Rendered HTML should mention the student's name and some marks
        self.assertIn('Priya Iyer', html_arg)
        self.assertIn('English', html_arg)
        self.assertIn('86.3', html_arg)

    @patch('apps.shared.services.pdf_generator.render_html_to_pdf')
    def test_certificate_render_uses_correct_template(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 fake'
        fx = _build_academic_fixtures()
        tc_template = CertificateTemplate.objects.create(
            name='Standard TC', cert_type=CertificateTemplate.CertType.TC,
            body_template='TC body',
        )
        cert = IssuedCertificate.objects.create(
            student=fx['student'], template=tc_template,
            serial_number='TC-2025-0001',
            issued_date=date(2026, 3, 15),
            date_of_admission=date(2020, 6, 1),
            date_of_leaving=date(2026, 3, 10),
            class_at_leaving='Grade 5',
            conduct='Excellent',
            qualified_for_promotion=True,
        )
        result = render_certificate_pdf(cert)
        self.assertEqual(result, b'%PDF-1.4 fake')
        html_arg = mock_render.call_args.args[0]
        self.assertIn('TC-2025-0001', html_arg)
        self.assertIn('Transfer Certificate', html_arg)
        self.assertIn('Priya Iyer', html_arg)

    @patch('apps.shared.services.pdf_generator.render_html_to_pdf')
    def test_unknown_cert_type_falls_back_to_generic(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 fake'
        fx = _build_academic_fixtures()
        char_template = CertificateTemplate.objects.create(
            name='Character Cert', cert_type=CertificateTemplate.CertType.CHARACTER,
            body_template='Body...',
        )
        cert = IssuedCertificate.objects.create(
            student=fx['student'], template=char_template,
            serial_number='CH-0001', issued_date=date(2026, 3, 1),
            rendered_body='Custom content paragraph.',
        )
        render_certificate_pdf(cert)
        html_arg = mock_render.call_args.args[0]
        self.assertIn('Custom content paragraph.', html_arg)

    def test_render_html_to_pdf_raises_when_weasyprint_unavailable(self):
        with patch.dict('sys.modules', {'weasyprint': None}):
            with self.assertRaises(PDFGenerationError):
                render_html_to_pdf('<html><body>test</body></html>')


# ─── Download endpoints ─────────────────────────────────────────────────────

class ReportCardPDFEndpointTest(TestCase):
    def setUp(self):
        self.fx = _build_academic_fixtures()
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='adm', email='adm@test.com', password='p',
            role='admin', first_name='A', last_name='Dmin',
        )
        self.client.force_authenticate(self.admin)

    @patch('apps.academics.views.render_report_card_pdf')
    def test_admin_can_download_report_card_pdf(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 mock-bytes'
        rc = self.fx['report_card']
        response = self.client.get(f'/api/v1/academics/report-cards/{rc.id}/pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('attachment', response['Content-Disposition'])
        self.assertIn('report-card-SM-2025-0005', response['Content-Disposition'])
        self.assertEqual(response.content, b'%PDF-1.4 mock-bytes')

    @patch('apps.academics.views.render_report_card_pdf')
    def test_student_can_download_own_report_card(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 mock-bytes'
        client = APIClient()
        client.force_authenticate(self.fx['user'])
        rc = self.fx['report_card']
        response = client.get(f'/api/v1/academics/report-cards/{rc.id}/pdf/')
        self.assertEqual(response.status_code, 200)

    @patch('apps.academics.views.render_report_card_pdf')
    def test_student_cannot_download_another_students_card(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 mock-bytes'
        other_user = User.objects.create_user(
            username='other', email='other@test.com', password='p',
            role='student', first_name='Other', last_name='Kid',
        )
        StudentProfile.objects.create(user=other_user, student_id='SM-OTHER')
        client = APIClient()
        client.force_authenticate(other_user)
        rc = self.fx['report_card']
        response = client.get(f'/api/v1/academics/report-cards/{rc.id}/pdf/')
        self.assertEqual(response.status_code, 404)

    @patch('apps.academics.views.render_report_card_pdf')
    def test_returns_503_when_weasyprint_missing(self, mock_render):
        mock_render.side_effect = PDFGenerationError('cairo missing')
        rc = self.fx['report_card']
        response = self.client.get(f'/api/v1/academics/report-cards/{rc.id}/pdf/')
        self.assertEqual(response.status_code, 503)


class CertificatePDFEndpointTest(TestCase):
    def setUp(self):
        self.fx = _build_academic_fixtures()
        self.cert_template = CertificateTemplate.objects.create(
            name='TC', cert_type=CertificateTemplate.CertType.TC, body_template='...',
        )
        self.cert = IssuedCertificate.objects.create(
            student=self.fx['student'], template=self.cert_template,
            serial_number='TC-2026-001', issued_date=date(2026, 3, 1),
        )
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='adm2', email='adm2@test.com', password='p',
            role='admin', first_name='A', last_name='Two',
        )
        self.client.force_authenticate(self.admin)

    @patch('apps.academics.views.render_certificate_pdf')
    def test_admin_downloads_certificate_pdf(self, mock_render):
        mock_render.return_value = b'%PDF-1.4 cert-bytes'
        response = self.client.get(f'/api/v1/academics/certificates/{self.cert.id}/pdf/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('tc-TC-2026-001', response['Content-Disposition'])


# ─── Real WeasyPrint render (guarded) ───────────────────────────────────────

class RealWeasyPrintTest(TestCase):
    """Actually render a PDF. Skipped if WeasyPrint or system libs are missing."""

    def test_real_render_produces_pdf_bytes(self):
        weasyprint = pytest.importorskip(
            'weasyprint',
            reason='WeasyPrint not installed or system libs missing',
        )
        try:
            pdf = weasyprint.HTML(string='<h1>Hello</h1>').write_pdf()
        except Exception as exc:
            self.skipTest(f'WeasyPrint failed to render: {exc}')

        self.assertTrue(pdf.startswith(b'%PDF-'))
        self.assertGreater(len(pdf), 100)
