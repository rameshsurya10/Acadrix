from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import User

from .models import (
    PayrollRun,
    PayslipEntry,
    SalaryStructure,
    StaffDocument,
    StaffProfile,
)


# ── Staff Profile ─────────────────────────────────────────────────────

class StaffProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user', 'full_name', 'email', 'phone',
            'employee_id', 'designation', 'department', 'department_name',
            'date_of_joining', 'date_of_leaving', 'employment_type',
            'bank_account_no', 'bank_name', 'ifsc_code',
            'pan_number', 'aadhar_number', 'uan_number', 'esi_number',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ── Salary Structure ──────────────────────────────────────────────────

class SalaryStructureSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='user.full_name', read_only=True)
    gross = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_deductions = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    net = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SalaryStructure
        fields = [
            'id', 'user', 'staff_name',
            'basic', 'hra', 'da', 'conveyance', 'medical', 'special_allowance',
            'pf_employee_pct', 'pf_employer_pct',
            'esi_employee_pct', 'esi_employer_pct',
            'professional_tax', 'tds_pct',
            'effective_from', 'is_active',
            'gross', 'total_deductions', 'net',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ── Payroll Run ───────────────────────────────────────────────────────

class PayrollRunSerializer(serializers.ModelSerializer):
    payslip_count = serializers.IntegerField(source='payslips.count', read_only=True)
    academic_year_label = serializers.CharField(source='academic_year.label', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)

    class Meta:
        model = PayrollRun
        fields = [
            'id', 'month', 'year', 'academic_year', 'academic_year_label',
            'status', 'processed_by', 'processed_by_name', 'processed_at',
            'total_gross', 'total_deductions', 'total_net',
            'payslip_count', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'processed_by', 'processed_at',
            'total_gross', 'total_deductions', 'total_net',
            'created_at', 'updated_at',
        ]


# ── Payslip Entry ─────────────────────────────────────────────────────

class PayslipEntrySerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)
    staff_email = serializers.EmailField(source='staff.email', read_only=True)
    payroll_month = serializers.IntegerField(source='payroll_run.month', read_only=True)
    payroll_year = serializers.IntegerField(source='payroll_run.year', read_only=True)

    class Meta:
        model = PayslipEntry
        fields = [
            'id', 'payroll_run', 'staff', 'staff_name', 'staff_email',
            'payroll_month', 'payroll_year',
            'basic', 'hra', 'da', 'conveyance', 'medical', 'special_allowance',
            'gross_salary',
            'pf_employee', 'pf_employer', 'esi_employee', 'esi_employer',
            'professional_tax', 'tds', 'total_deductions', 'net_salary',
            'working_days', 'days_present', 'days_absent', 'leave_deduction',
            'bonus', 'arrears', 'status',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ── Process Payroll ───────────────────────────────────────────────────

class ProcessPayrollSerializer(serializers.Serializer):
    """
    Accepts a payroll_run_id and generates PayslipEntry rows for every
    active staff member who has a salary structure.
    """
    payroll_run_id = serializers.IntegerField()

    def validate_payroll_run_id(self, value):
        try:
            run = PayrollRun.objects.get(pk=value)
        except PayrollRun.DoesNotExist:
            raise serializers.ValidationError('Payroll run not found.')
        if run.status != PayrollRun.Status.DRAFT:
            raise serializers.ValidationError(
                'Only draft payroll runs can be processed.'
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        run = PayrollRun.objects.select_for_update().get(
            pk=validated_data['payroll_run_id'],
        )

        # Gather all active staff users (teachers + non-teaching)
        staff_roles = ['teacher', 'finance', 'admin', 'principal']
        active_staff = User.objects.filter(
            role__in=staff_roles,
            is_active=True,
        ).select_related('staff_profile', 'teacher_profile')

        # Delete previously generated payslips for this run (re-process)
        run.payslips.all().delete()

        total_gross = Decimal('0')
        total_deductions = Decimal('0')
        total_net = Decimal('0')
        payslips_created = []

        # Prefetch all salary structures indexed by user_id to avoid N+1
        salary_map = {}
        for ss in SalaryStructure.objects.filter(
            user__in=active_staff, is_active=True,
        ).order_by('user_id', '-effective_from'):
            if ss.user_id not in salary_map:  # keep only the most recent per user
                salary_map[ss.user_id] = ss

        for user in active_staff:
            salary = salary_map.get(user.id)
            if salary is None:
                continue

            gross = salary.gross
            working_days = 26  # default monthly working days

            # Calculate deductions
            pf_employee = salary.basic * salary.pf_employee_pct / Decimal('100')
            pf_employer = salary.basic * salary.pf_employer_pct / Decimal('100')
            esi_employee = gross * salary.esi_employee_pct / Decimal('100')
            esi_employer = gross * salary.esi_employer_pct / Decimal('100')
            professional_tax = salary.professional_tax
            tds = gross * salary.tds_pct / Decimal('100')

            deductions = pf_employee + esi_employee + professional_tax + tds
            net = gross - deductions

            payslip = PayslipEntry(
                payroll_run=run,
                staff=user,
                basic=salary.basic,
                hra=salary.hra,
                da=salary.da,
                conveyance=salary.conveyance,
                medical=salary.medical,
                special_allowance=salary.special_allowance,
                gross_salary=gross,
                pf_employee=pf_employee,
                pf_employer=pf_employer,
                esi_employee=esi_employee,
                esi_employer=esi_employer,
                professional_tax=professional_tax,
                tds=tds,
                total_deductions=deductions,
                net_salary=net,
                working_days=working_days,
                days_present=working_days,
                days_absent=0,
                leave_deduction=Decimal('0'),
            )
            payslips_created.append(payslip)
            total_gross += gross
            total_deductions += deductions
            total_net += net

        # Bulk create for performance
        PayslipEntry.objects.bulk_create(payslips_created)

        # Update run totals and status
        run.status = PayrollRun.Status.PROCESSED
        run.processed_by = self.context['request'].user
        run.processed_at = timezone.now()
        run.total_gross = total_gross
        run.total_deductions = total_deductions
        run.total_net = total_net
        run.save(update_fields=[
            'status', 'processed_by', 'processed_at',
            'total_gross', 'total_deductions', 'total_net', 'updated_at',
        ])

        return run


# ── Staff Document ────────────────────────────────────────────────────

class StaffDocumentSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True)

    class Meta:
        model = StaffDocument
        fields = [
            'id', 'staff', 'staff_name', 'doc_type',
            'file', 'file_name', 'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at']
