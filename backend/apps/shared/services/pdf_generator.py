"""PDF generation service using WeasyPrint.

Pipeline:
    Django template -> rendered HTML string -> WeasyPrint -> PDF bytes

Public helpers:
    render_report_card_pdf(report_card)  -> bytes
    render_certificate_pdf(certificate)  -> bytes
    render_html_to_pdf(html, base_url=None) -> bytes  (generic escape hatch)

Design notes:
    - Templates live in apps/academics/templates/academics/pdfs/
    - The same template can be rendered as HTML for web preview or as PDF.
    - WeasyPrint is imported lazily inside functions so the import doesn't
      crash Django startup if system libs (cairo/pango) are missing in dev.
"""
import logging
from typing import Any

from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


class PDFGenerationError(RuntimeError):
    """Raised when WeasyPrint fails or is not available."""


def render_html_to_pdf(html: str, base_url: str | None = None) -> bytes:
    """Convert a rendered HTML string to PDF bytes.

    `base_url` is used to resolve relative URLs for images / CSS inside the
    HTML. For Django-rendered templates, pass your MEDIA_URL or site root.
    """
    try:
        from weasyprint import HTML
    except ImportError as exc:
        raise PDFGenerationError(
            'WeasyPrint is not installed. Run `pip install weasyprint` '
            'and install system libs (libcairo2, libpango-1.0-0).'
        ) from exc
    except OSError as exc:
        # WeasyPrint raises OSError when cairo/pango shared libs are missing
        raise PDFGenerationError(
            f'WeasyPrint system libraries missing: {exc}. '
            'Install libcairo2 + libpango-1.0-0.'
        ) from exc

    try:
        return HTML(string=html, base_url=base_url).write_pdf()
    except Exception as exc:
        logger.exception('WeasyPrint failed to render HTML')
        raise PDFGenerationError(f'PDF rendering failed: {exc}') from exc


def render_report_card_pdf(report_card, request=None) -> bytes:
    """Render a GeneratedReportCard to PDF bytes.

    Uses `academics/pdfs/report_card.html` as the template. The report card's
    `data_snapshot` is passed as the `data` context variable so templates
    can access frozen values (student name, marks, attendance, etc.).
    """
    context = _build_report_card_context(report_card)
    html = render_to_string('academics/pdfs/report_card.html', context)
    base_url = request.build_absolute_uri('/') if request else None
    return render_html_to_pdf(html, base_url=base_url)


def render_certificate_pdf(certificate, request=None) -> bytes:
    """Render an IssuedCertificate to PDF bytes.

    The template is chosen by `certificate.template.cert_type`:
      - tc        -> transfer_certificate.html
      - bonafide  -> bonafide_certificate.html
      - other     -> generic_certificate.html (falls back to rendered_body)
    """
    cert_type = certificate.template.cert_type
    template_map = {
        'tc': 'academics/pdfs/transfer_certificate.html',
        'bonafide': 'academics/pdfs/bonafide_certificate.html',
    }
    template_name = template_map.get(cert_type, 'academics/pdfs/generic_certificate.html')

    context = _build_certificate_context(certificate)
    html = render_to_string(template_name, context)
    base_url = request.build_absolute_uri('/') if request else None
    return render_html_to_pdf(html, base_url=base_url)


# ── Context builders ────────────────────────────────────────────────────────

def _build_report_card_context(report_card) -> dict[str, Any]:
    """Flatten the report card into a template-friendly context dict."""
    from apps.super_admin.models import SchoolSettings

    school = SchoolSettings.objects.first()
    student = report_card.student
    template = report_card.template

    # data_snapshot is frozen JSON; use it if present, else pull live values
    snapshot = report_card.data_snapshot or {}

    return {
        'school': {
            'name': school.school_name if school else 'Acadrix School',
            'address': getattr(school, 'address', '') if school else '',
            'phone': getattr(school, 'phone', '') if school else '',
            'motto': getattr(school, 'motto', '') if school else '',
        },
        'student': {
            'name': student.user.full_name,
            'student_id': student.student_id,
            'grade': template.grade.label if template.grade else '',
            'section': str(student.section) if student.section else '',
            'house': student.house,
            'date_of_birth': student.date_of_birth.isoformat() if student.date_of_birth else '',
        },
        'term_name': report_card.term.get_term_display() if report_card.term else '',
        'academic_year': str(report_card.academic_year) if report_card.academic_year else '',
        'subjects': snapshot.get('subjects', []),  # [{name, max, obtained, grade}, ...]
        'total_marks': snapshot.get('total_marks', 0),
        'marks_obtained': snapshot.get('marks_obtained', 0),
        'percentage': snapshot.get('percentage', 0),
        'rank': snapshot.get('rank', ''),
        'overall_grade': snapshot.get('overall_grade', ''),
        'remarks': snapshot.get('remarks', ''),
        'attendance_total': snapshot.get('attendance_total', 0),
        'attendance_present': snapshot.get('attendance_present', 0),
        'co_scholastic': snapshot.get('co_scholastic', template.co_scholastic_areas or []),
        'header_text': template.header_text,
        'footer_text': template.footer_text,
        'show_attendance': template.show_attendance,
        'show_remarks': template.show_remarks,
        'show_rank': template.show_rank,
        'board': template.get_board_type_display(),
        'generated_at': report_card.generated_at,
        'status': report_card.get_status_display(),
    }


def _build_certificate_context(certificate) -> dict[str, Any]:
    """Flatten an issued certificate into template context."""
    from apps.super_admin.models import SchoolSettings

    school = SchoolSettings.objects.first()
    student = certificate.student

    primary_guardian = student.guardians.filter(is_primary=True).first()
    father_name = primary_guardian.name if primary_guardian else ''

    return {
        'school': {
            'name': school.school_name if school else 'Acadrix School',
            'address': getattr(school, 'address', '') if school else '',
            'phone': getattr(school, 'phone', '') if school else '',
        },
        'student': {
            'name': student.user.full_name,
            'student_id': student.student_id,
            'father_name': father_name,
            'date_of_birth': student.date_of_birth.isoformat() if student.date_of_birth else '',
            'address': student.address,
        },
        'certificate': {
            'serial_number': certificate.serial_number,
            'issued_date': certificate.issued_date.isoformat() if certificate.issued_date else '',
            'reason': certificate.reason,
            'cert_type': certificate.template.get_cert_type_display(),
            'date_of_admission': certificate.date_of_admission.isoformat() if certificate.date_of_admission else '',
            'date_of_leaving': certificate.date_of_leaving.isoformat() if certificate.date_of_leaving else '',
            'class_at_leaving': certificate.class_at_leaving,
            'reason_for_leaving': certificate.reason_for_leaving,
            'conduct': certificate.conduct,
            'qualified_for_promotion': certificate.qualified_for_promotion,
            'working_days': certificate.working_days,
            'days_present': certificate.days_present,
            'rendered_body': certificate.rendered_body,
        },
    }
