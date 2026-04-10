from decimal import Decimal

from django.db import models as db_models
from rest_framework import serializers

from apps.leave.models import (
    LeaveApplication,
    LeaveApproval,
    LeaveBalance,
    LeaveType,
)


# ---------------------------------------------------------------------------
# Leave Type
# ---------------------------------------------------------------------------

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = [
            'id', 'name', 'code', 'annual_quota',
            'carries_forward', 'applicable_to', 'is_active',
        ]


# ---------------------------------------------------------------------------
# Leave Balance (read-only)
# ---------------------------------------------------------------------------

class LeaveBalanceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    leave_type_code = serializers.CharField(source='leave_type.code', read_only=True)
    remaining = serializers.DecimalField(max_digits=5, decimal_places=1, read_only=True)

    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'user', 'user_name', 'leave_type', 'leave_type_name',
            'leave_type_code', 'academic_year', 'allocated', 'used',
            'carried_forward', 'remaining',
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Leave Application (read-only listing)
# ---------------------------------------------------------------------------

class LeaveApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    leave_type_code = serializers.CharField(source='leave_type.code', read_only=True)
    days_count = serializers.SerializerMethodField()
    approval = serializers.SerializerMethodField()

    class Meta:
        model = LeaveApplication
        fields = [
            'id', 'applicant', 'applicant_name', 'leave_type',
            'leave_type_name', 'leave_type_code', 'start_date', 'end_date',
            'is_half_day', 'reason', 'attachment', 'status', 'days_count',
            'applied_at', 'approval',
        ]
        read_only_fields = fields

    def get_days_count(self, obj):
        return obj.days_count

    def get_approval(self, obj):
        approval = getattr(obj, 'approval', None)
        if approval is None:
            # Try to fetch if not prefetched
            try:
                approval = obj.approval
            except LeaveApproval.DoesNotExist:
                return None
        return {
            'approver_name': approval.approver.full_name,
            'action': approval.action,
            'remarks': approval.remarks,
            'acted_at': approval.acted_at,
        }


# ---------------------------------------------------------------------------
# Apply Leave (write)
# ---------------------------------------------------------------------------

class ApplyLeaveSerializer(serializers.Serializer):
    leave_type_id = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    is_half_day = serializers.BooleanField(default=False)
    reason = serializers.CharField()
    attachment = serializers.FileField(required=False, allow_null=True)

    def validate_leave_type_id(self, value):
        try:
            leave_type = LeaveType.objects.get(pk=value, is_active=True)
        except LeaveType.DoesNotExist:
            raise serializers.ValidationError('Invalid or inactive leave type.')
        return value

    def validate(self, attrs):
        start_date = attrs['start_date']
        end_date = attrs['end_date']
        is_half_day = attrs.get('is_half_day', False)
        user = self.context['request'].user

        # Date sanity
        if start_date > end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after start date.',
            })

        if is_half_day and start_date != end_date:
            raise serializers.ValidationError({
                'is_half_day': 'Half-day leave must have the same start and end date.',
            })

        # Calculate days
        days_requested = Decimal('0.5') if is_half_day else Decimal((end_date - start_date).days + 1)

        # Check leave balance for the current academic year
        from apps.shared.models import AcademicYear
        academic_year = AcademicYear.objects.filter(is_current=True).first()
        if not academic_year:
            raise serializers.ValidationError('No active academic year found.')

        balance = LeaveBalance.objects.filter(
            user=user,
            leave_type_id=attrs['leave_type_id'],
            academic_year=academic_year,
        ).first()

        if not balance:
            raise serializers.ValidationError(
                'No leave balance allocated for this leave type in the current academic year.'
            )

        if balance.remaining < days_requested:
            raise serializers.ValidationError(
                f'Insufficient leave balance. Available: {balance.remaining}, Requested: {days_requested}'
            )

        # Check for overlapping pending/approved applications
        overlapping = LeaveApplication.objects.filter(
            applicant=user,
            status__in=[
                LeaveApplication.Status.PENDING,
                LeaveApplication.Status.APPROVED,
            ],
            start_date__lte=end_date,
            end_date__gte=start_date,
        ).exists()

        if overlapping:
            raise serializers.ValidationError(
                'You already have a pending or approved leave application overlapping with these dates.'
            )

        attrs['_academic_year'] = academic_year
        return attrs

    def create(self, validated_data):
        validated_data.pop('_academic_year', None)
        attachment = validated_data.pop('attachment', None)
        leave_type_id = validated_data.pop('leave_type_id')

        application = LeaveApplication.objects.create(
            applicant=self.context['request'].user,
            leave_type_id=leave_type_id,
            attachment=attachment or '',
            **validated_data,
        )
        return application


# ---------------------------------------------------------------------------
# Approve / Reject Leave (write)
# ---------------------------------------------------------------------------

class ApproveLeaveSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approved', 'rejected'])
    remarks = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        application = self.context['application']

        if application.status != LeaveApplication.Status.PENDING:
            raise serializers.ValidationError(
                f'Cannot act on a leave application with status "{application.status}".'
            )

        return attrs

    def save(self):
        application = self.context['application']
        approver = self.context['request'].user
        action = self.validated_data['action']
        remarks = self.validated_data.get('remarks', '')

        # Create approval record
        approval = LeaveApproval.objects.create(
            application=application,
            approver=approver,
            action=action,
            remarks=remarks,
        )

        # Update application status
        application.status = action
        application.save(update_fields=['status'])

        # Deduct from balance only on approval
        if action == LeaveApproval.Action.APPROVED:
            from apps.shared.models import AcademicYear
            academic_year = AcademicYear.objects.filter(is_current=True).first()

            if academic_year:
                balance = LeaveBalance.objects.filter(
                    user=application.applicant,
                    leave_type=application.leave_type,
                    academic_year=academic_year,
                ).first()

                if balance:
                    balance.used += Decimal(str(application.days_count))
                    balance.save(update_fields=['used'])

        return approval


# ---------------------------------------------------------------------------
# Bulk Allocate Balances (write)
# ---------------------------------------------------------------------------

class AllocateBalancesSerializer(serializers.Serializer):
    academic_year_id = serializers.IntegerField()
    leave_type_id = serializers.IntegerField()
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )
    allocated = serializers.IntegerField(min_value=0)

    def validate_academic_year_id(self, value):
        from apps.shared.models import AcademicYear
        if not AcademicYear.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Invalid academic year.')
        return value

    def validate_leave_type_id(self, value):
        if not LeaveType.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError('Invalid or inactive leave type.')
        return value

    def validate_user_ids(self, value):
        from apps.accounts.models import User
        existing_count = User.objects.filter(pk__in=value).count()
        if existing_count != len(value):
            raise serializers.ValidationError('One or more user IDs are invalid.')
        return value

    def create(self, validated_data):
        academic_year_id = validated_data['academic_year_id']
        leave_type_id = validated_data['leave_type_id']
        user_ids = validated_data['user_ids']
        allocated = validated_data['allocated']

        created_count = 0
        updated_count = 0

        for user_id in user_ids:
            _, created = LeaveBalance.objects.update_or_create(
                user_id=user_id,
                leave_type_id=leave_type_id,
                academic_year_id=academic_year_id,
                defaults={'allocated': allocated},
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        return {'created': created_count, 'updated': updated_count}
