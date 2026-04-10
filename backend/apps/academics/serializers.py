import re
from datetime import date
from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Q
from rest_framework import serializers

from apps.academics.models import (
    CertificateTemplate,
    GeneratedReportCard,
    IssuedCertificate,
    ReportCardTemplate,
    ReportCardTerm,
)
from apps.student.models import Attendance, StudentProfile
from apps.teacher.models import Assessment, GradeEntry


# ---------------------------------------------------------------------------
# Report Card Term
# ---------------------------------------------------------------------------

class ReportCardTermSerializer(serializers.ModelSerializer):
    assessment_ids = serializers.PrimaryKeyRelatedField(
        source='assessments',
        many=True,
        queryset=Assessment.objects.all(),
        required=False,
    )
    term_display = serializers.CharField(source='get_term_display', read_only=True)

    class Meta:
        model = ReportCardTerm
        fields = [
            'id', 'template', 'term', 'term_display',
            'assessment_ids', 'grade_thresholds',
        ]
        read_only_fields = ['id']



# ---------------------------------------------------------------------------
# Report Card Template  (nested terms on read)
# ---------------------------------------------------------------------------

class ReportCardTemplateSerializer(serializers.ModelSerializer):
    terms = ReportCardTermSerializer(many=True, read_only=True)
    board_type_display = serializers.CharField(source='get_board_type_display', read_only=True)
    grading_scale_display = serializers.CharField(source='get_grading_scale_display', read_only=True)
    grade_label = serializers.CharField(source='grade.label', read_only=True)
    academic_year_label = serializers.CharField(source='academic_year.label', read_only=True)

    class Meta:
        model = ReportCardTemplate
        fields = [
            'id', 'name', 'board_type', 'board_type_display',
            'grade', 'grade_label',
            'academic_year', 'academic_year_label',
            'grading_scale', 'grading_scale_display',
            'co_scholastic_areas',
            'show_attendance', 'show_remarks', 'show_rank',
            'header_text', 'footer_text',
            'principal_signature', 'school_seal',
            'is_active', 'terms',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Generated Report Card  (read-only listing)
# ---------------------------------------------------------------------------

class GeneratedReportCardSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    term_display = serializers.CharField(source='term.get_term_display', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = GeneratedReportCard
        fields = [
            'id', 'student', 'student_name', 'student_id',
            'template', 'template_name',
            'term', 'term_display',
            'academic_year', 'data_snapshot',
            'status', 'status_display',
            'generated_by', 'generated_at',
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Bulk Generate Report Cards  (input serializer)
# ---------------------------------------------------------------------------

class GenerateReportCardsSerializer(serializers.Serializer):
    section_id = serializers.IntegerField()
    term_id = serializers.IntegerField()

    def validate_section_id(self, value):
        from apps.shared.models import Section
        try:
            Section.objects.get(pk=value)
        except Section.DoesNotExist:
            raise serializers.ValidationError('Section not found.')
        return value

    def validate_term_id(self, value):
        try:
            ReportCardTerm.objects.select_related('template').get(pk=value)
        except ReportCardTerm.DoesNotExist:
            raise serializers.ValidationError('Report card term not found.')
        return value

    # ------------------------------------------------------------------
    # Grading helpers per board type
    # ------------------------------------------------------------------

    @staticmethod
    def _cbse_grade(percentage: Decimal, thresholds: list) -> str:
        """Assign CBSE letter grade from configurable thresholds."""
        pct = float(percentage)
        # Sort thresholds descending by min for deterministic matching
        sorted_thresholds = sorted(thresholds, key=lambda t: t.get('min', 0), reverse=True)
        for t in sorted_thresholds:
            if t.get('min', 0) <= pct <= t.get('max', 100):
                return t.get('grade', '')
        # Fallback CBSE 9-point scale if no thresholds configured
        if pct >= 91:
            return 'A1'
        elif pct >= 81:
            return 'A2'
        elif pct >= 71:
            return 'B1'
        elif pct >= 61:
            return 'B2'
        elif pct >= 51:
            return 'C1'
        elif pct >= 41:
            return 'C2'
        elif pct >= 33:
            return 'D'
        return 'E'

    @staticmethod
    def _icse_grade(percentage: Decimal) -> str:
        """ICSE percentage-based grading."""
        pct = float(percentage)
        if pct >= 90:
            return 'A1'
        elif pct >= 80:
            return 'A2'
        elif pct >= 70:
            return 'B1'
        elif pct >= 60:
            return 'B2'
        elif pct >= 50:
            return 'C1'
        elif pct >= 40:
            return 'C2'
        elif pct >= 33:
            return 'D'
        return 'E'

    @staticmethod
    def _state_board_grade(percentage: Decimal) -> str:
        """State board typically uses simpler letter grades."""
        pct = float(percentage)
        if pct >= 90:
            return 'A+'
        elif pct >= 75:
            return 'A'
        elif pct >= 60:
            return 'B+'
        elif pct >= 50:
            return 'B'
        elif pct >= 35:
            return 'C'
        return 'F'

    @staticmethod
    def _custom_grade(percentage: Decimal, thresholds: list) -> str:
        """Custom board uses thresholds if provided, else percentage only."""
        if thresholds:
            return GenerateReportCardsSerializer._cbse_grade(percentage, thresholds)
        pct = float(percentage)
        if pct >= 90:
            return 'A'
        elif pct >= 75:
            return 'B'
        elif pct >= 60:
            return 'C'
        elif pct >= 40:
            return 'D'
        return 'F'

    def _assign_grade(self, board_type: str, percentage: Decimal, thresholds: list) -> str:
        """Route to the correct grading function by board_type."""
        if board_type == ReportCardTemplate.BoardType.CBSE:
            return self._cbse_grade(percentage, thresholds)
        elif board_type == ReportCardTemplate.BoardType.ICSE:
            return self._icse_grade(percentage)
        elif board_type == ReportCardTemplate.BoardType.STATE_BOARD:
            return self._state_board_grade(percentage)
        return self._custom_grade(percentage, thresholds)

    # ------------------------------------------------------------------
    # Core generation logic
    # ------------------------------------------------------------------

    @transaction.atomic
    def create(self, validated_data):
        section_id = validated_data['section_id']
        term_id = validated_data['term_id']
        user = self.context['request'].user

        term = (
            ReportCardTerm.objects
            .select_related('template', 'template__grade', 'template__academic_year')
            .prefetch_related('assessments', 'assessments__subject')
            .get(pk=term_id)
        )
        template = term.template
        board_type = template.board_type
        thresholds = term.grade_thresholds or []

        # All students in the section with eagerly loaded relations
        students = (
            StudentProfile.objects
            .filter(section_id=section_id, is_active=True)
            .select_related('user', 'section', 'section__grade')
        )

        if not students.exists():
            raise serializers.ValidationError('No active students found in this section.')

        assessment_ids = list(term.assessments.values_list('id', flat=True))
        if not assessment_ids:
            raise serializers.ValidationError('No assessments linked to this term.')

        # Build a map of assessment_id -> subject info + total_marks
        assessment_map = {}
        for a in term.assessments.select_related('subject').all():
            assessment_map[a.id] = {
                'assessment_id': a.id,
                'title': a.title,
                'subject_name': a.subject.name,
                'subject_code': a.subject.code,
                'total_marks': a.total_marks,
            }

        # Fetch all grade entries for these assessments + students in one query
        student_ids = list(students.values_list('id', flat=True))
        grade_entries = (
            GradeEntry.objects
            .filter(
                assessment_id__in=assessment_ids,
                student_id__in=student_ids,
            )
            .select_related('assessment', 'assessment__subject')
        )

        # Index: student_id -> assessment_id -> GradeEntry
        entry_index: dict[int, dict[int, GradeEntry]] = {}
        for ge in grade_entries:
            entry_index.setdefault(ge.student_id, {})[ge.assessment_id] = ge

        # Attendance data: student_id -> {total, present}
        attendance_data = {}
        if template.show_attendance:
            att_qs = (
                Attendance.objects
                .filter(student_id__in=student_ids)
                .values('student_id')
                .annotate(
                    total_days=Count('id'),
                    days_present=Count('id', filter=Q(is_present=True)),
                )
            )
            for row in att_qs:
                attendance_data[row['student_id']] = {
                    'total_days': row['total_days'],
                    'days_present': row['days_present'],
                }

        # Generate report cards
        created_cards = []
        for student in students:
            student_entries = entry_index.get(student.id, {})
            subjects = []
            grand_total_obtained = Decimal('0')
            grand_total_max = Decimal('0')

            for a_id, a_info in assessment_map.items():
                ge = student_entries.get(a_id)
                marks_obtained = Decimal(str(ge.marks_obtained)) if ge else Decimal('0')
                total_marks = Decimal(str(a_info['total_marks']))
                percentage = (
                    (marks_obtained / total_marks * 100) if total_marks > 0 else Decimal('0')
                )
                letter_grade = self._assign_grade(board_type, percentage, thresholds)

                subjects.append({
                    'subject_name': a_info['subject_name'],
                    'subject_code': a_info['subject_code'],
                    'assessment_title': a_info['title'],
                    'marks_obtained': float(marks_obtained),
                    'total_marks': int(a_info['total_marks']),
                    'percentage': round(float(percentage), 2),
                    'letter_grade': letter_grade,
                    'remarks': ge.remarks if ge else '',
                })

                grand_total_obtained += marks_obtained
                grand_total_max += total_marks

            overall_percentage = (
                (grand_total_obtained / grand_total_max * 100) if grand_total_max > 0 else Decimal('0')
            )
            overall_grade = self._assign_grade(board_type, overall_percentage, thresholds)

            data_snapshot = {
                'student': {
                    'name': student.user.full_name,
                    'student_id': student.student_id,
                    'class': str(student.section) if student.section else '',
                    'house': student.house,
                    'date_of_birth': str(student.date_of_birth) if student.date_of_birth else '',
                },
                'template': {
                    'name': template.name,
                    'board_type': board_type,
                    'grading_scale': template.grading_scale,
                },
                'term': term.get_term_display(),
                'academic_year': template.academic_year.label,
                'subjects': subjects,
                'summary': {
                    'total_marks_obtained': float(grand_total_obtained),
                    'total_marks_maximum': float(grand_total_max),
                    'overall_percentage': round(float(overall_percentage), 2),
                    'overall_grade': overall_grade,
                },
            }

            # Attendance snapshot
            if template.show_attendance:
                att = attendance_data.get(student.id, {'total_days': 0, 'days_present': 0})
                data_snapshot['attendance'] = att

            # Co-scholastic areas (CBSE)
            if template.co_scholastic_areas:
                data_snapshot['co_scholastic_areas'] = template.co_scholastic_areas

            # Upsert: update if already generated for this student+template+term
            card, _created = GeneratedReportCard.objects.update_or_create(
                student=student,
                template=template,
                term=term,
                defaults={
                    'academic_year': template.academic_year,
                    'data_snapshot': data_snapshot,
                    'status': GeneratedReportCard.Status.DRAFT,
                    'generated_by': user,
                },
            )
            created_cards.append(card)

        return created_cards


# ---------------------------------------------------------------------------
# Certificate Template
# ---------------------------------------------------------------------------

class CertificateTemplateSerializer(serializers.ModelSerializer):
    cert_type_display = serializers.CharField(source='get_cert_type_display', read_only=True)

    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'name', 'cert_type', 'cert_type_display',
            'body_template', 'header_image',
            'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ---------------------------------------------------------------------------
# Issued Certificate  (read + list)
# ---------------------------------------------------------------------------

class IssuedCertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_id_display = serializers.CharField(source='student.student_id', read_only=True)
    cert_type = serializers.CharField(source='template.cert_type', read_only=True)
    cert_type_display = serializers.CharField(source='template.get_cert_type_display', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = IssuedCertificate
        fields = [
            'id', 'student', 'student_name', 'student_id_display',
            'template', 'template_name',
            'cert_type', 'cert_type_display',
            'serial_number', 'issued_date', 'issued_by',
            'reason', 'rendered_body',
            'date_of_admission', 'date_of_leaving',
            'class_at_leaving', 'reason_for_leaving',
            'conduct', 'qualified_for_promotion',
            'working_days', 'days_present',
            'created_at',
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Issue Certificate  (input serializer)
# ---------------------------------------------------------------------------

class IssueCertificateSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    template_id = serializers.IntegerField()
    issued_date = serializers.DateField(default=date.today)
    reason = serializers.CharField(required=False, default='', allow_blank=True)
    # TC-specific optional fields
    date_of_leaving = serializers.DateField(required=False, allow_null=True)
    class_at_leaving = serializers.CharField(required=False, default='', allow_blank=True)
    reason_for_leaving = serializers.CharField(required=False, default='', allow_blank=True)
    conduct = serializers.CharField(required=False, default='Good', allow_blank=True)
    qualified_for_promotion = serializers.BooleanField(required=False, default=None, allow_null=True)

    def validate_student_id(self, value):
        try:
            StudentProfile.objects.select_related(
                'user', 'section', 'section__grade',
            ).get(pk=value, is_active=True)
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError('Active student not found.')
        return value

    def validate_template_id(self, value):
        try:
            CertificateTemplate.objects.get(pk=value, is_active=True)
        except CertificateTemplate.DoesNotExist:
            raise serializers.ValidationError('Active certificate template not found.')
        return value

    @staticmethod
    def _generate_serial_number() -> str:
        """Format: CERT-YYYY-NNNN  (auto-incrementing per year)."""
        year = date.today().year
        prefix = f'CERT-{year}-'
        last = (
            IssuedCertificate.objects
            .filter(serial_number__startswith=prefix)
            .order_by('-serial_number')
            .values_list('serial_number', flat=True)
            .first()
        )
        if last:
            last_num = int(last.split('-')[-1])
            next_num = last_num + 1
        else:
            next_num = 1
        return f'{prefix}{next_num:04d}'

    @staticmethod
    def _render_body(body_template: str, context: dict) -> str:
        """Replace {{placeholder}} tokens with context values."""
        def replacer(match):
            key = match.group(1).strip()
            return str(context.get(key, match.group(0)))
        return re.sub(r'\{\{(\w+)\}\}', replacer, body_template)

    @transaction.atomic
    def create(self, validated_data):
        student = (
            StudentProfile.objects
            .select_related('user', 'section', 'section__grade')
            .get(pk=validated_data['student_id'])
        )
        template = CertificateTemplate.objects.get(pk=validated_data['template_id'])
        user = self.context['request'].user

        # Build placeholder context
        guardians = student.guardians.filter(is_primary=True).first()
        section_label = str(student.section) if student.section else ''
        grade_label = student.section.grade.label if student.section else ''

        placeholder_ctx = {
            'student_name': student.user.full_name,
            'student_id': student.student_id,
            'father_name': guardians.name if guardians else '',
            'class': section_label,
            'grade': grade_label,
            'section': student.section.name if student.section else '',
            'house': student.house,
            'date_of_birth': str(student.date_of_birth) if student.date_of_birth else '',
            'enrollment_date': str(student.enrollment_date) if student.enrollment_date else '',
            'issued_date': str(validated_data['issued_date']),
            'date': str(validated_data['issued_date']),
        }

        # TC-specific data
        date_of_admission = student.enrollment_date
        date_of_leaving = validated_data.get('date_of_leaving')
        working_days = None
        days_present = None

        if template.cert_type == CertificateTemplate.CertType.TC:
            # Compute attendance stats from Attendance model
            att_qs = Attendance.objects.filter(student=student)
            if date_of_leaving:
                att_qs = att_qs.filter(date__lte=date_of_leaving)
            att_stats = att_qs.aggregate(
                total=Count('id'),
                present=Count('id', filter=Q(is_present=True)),
            )
            working_days = att_stats['total']
            days_present = att_stats['present']

            placeholder_ctx.update({
                'date_of_admission': str(date_of_admission) if date_of_admission else '',
                'date_of_leaving': str(date_of_leaving) if date_of_leaving else '',
                'class_at_leaving': validated_data.get('class_at_leaving', section_label),
                'reason_for_leaving': validated_data.get('reason_for_leaving', ''),
                'conduct': validated_data.get('conduct', 'Good'),
                'qualified_for_promotion': 'Yes' if validated_data.get('qualified_for_promotion') else 'No',
                'working_days': str(working_days) if working_days is not None else '',
                'days_present': str(days_present) if days_present is not None else '',
            })

        rendered_body = self._render_body(template.body_template, placeholder_ctx)
        serial_number = self._generate_serial_number()

        certificate = IssuedCertificate.objects.create(
            student=student,
            template=template,
            serial_number=serial_number,
            issued_date=validated_data['issued_date'],
            issued_by=user,
            reason=validated_data.get('reason', ''),
            date_of_admission=date_of_admission,
            date_of_leaving=date_of_leaving,
            class_at_leaving=validated_data.get('class_at_leaving', ''),
            reason_for_leaving=validated_data.get('reason_for_leaving', ''),
            conduct=validated_data.get('conduct', 'Good'),
            qualified_for_promotion=validated_data.get('qualified_for_promotion'),
            working_days=working_days,
            days_present=days_present,
            rendered_body=rendered_body,
        )
        return certificate
