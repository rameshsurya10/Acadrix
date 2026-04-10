import secrets
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.student.models import Payment, StudentProfile, TuitionAccount, TuitionLineItem
from .models import FeeTemplate, FeeTemplateItem, StudentDiscount


# ── Fee Template ───────────────────────────────────────────────────

class FeeTemplateItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeTemplateItem
        fields = ['id', 'description', 'amount', 'is_optional', 'order']
        read_only_fields = ['id']


class FeeTemplateSerializer(serializers.ModelSerializer):
    items = FeeTemplateItemSerializer(many=True, required=False)
    grade_label = serializers.CharField(source='grade.label', read_only=True)
    academic_year_label = serializers.CharField(source='academic_year.label', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = FeeTemplate
        fields = [
            'id', 'grade', 'grade_label', 'academic_year', 'academic_year_label',
            'name', 'due_date', 'is_active', 'total_amount',
            'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        template = FeeTemplate.objects.create(**validated_data)
        for idx, item in enumerate(items_data):
            item.setdefault('order', idx)
            FeeTemplateItem.objects.create(template=template, **item)
        return template

    @transaction.atomic
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for idx, item in enumerate(items_data):
                item.setdefault('order', idx)
                FeeTemplateItem.objects.create(template=instance, **item)

        return instance


# ── Student Discount ───────────────────────────────────────────────

class StudentDiscountSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.__str__', read_only=True)
    applied_by_name = serializers.CharField(source='applied_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = StudentDiscount
        fields = [
            'id', 'student', 'student_name', 'discount_type', 'description',
            'amount', 'applied_by', 'applied_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'applied_by', 'applied_by_name', 'created_at']


# ── Record Payment ─────────────────────────────────────────────────

class RecordPaymentSerializer(serializers.Serializer):
    """Admin records a manual payment on behalf of a student."""
    student_id = serializers.IntegerField(help_text='StudentProfile ID')
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    method = serializers.ChoiceField(choices=Payment.Method.choices)
    notes = serializers.CharField(required=False, default='')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be positive.')
        return value

    def validate_student_id(self, value):
        if not StudentProfile.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Student not found.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        profile = StudentProfile.objects.get(pk=validated_data['student_id'])

        try:
            account = profile.tuition_account
        except TuitionAccount.DoesNotExist:
            raise serializers.ValidationError({'student_id': 'Student has no tuition account.'})

        receipt_id = f'RCP-{secrets.token_hex(4).upper()}'
        amount = validated_data['amount']

        payment = Payment.objects.create(
            account=account,
            receipt_id=receipt_id,
            amount=amount,
            method=validated_data['method'],
            paid_by=self.context['request'].user,
            notes=validated_data.get('notes', ''),
        )

        account.paid_amount += amount
        if account.paid_amount >= account.total_amount:
            account.status = TuitionAccount.PaymentStatus.PAID
        else:
            account.status = TuitionAccount.PaymentStatus.PARTIAL
        account.save(update_fields=['paid_amount', 'status', 'updated_at'])

        return payment


# ── Apply Template to Student ──────────────────────────────────────

def apply_fee_template_to_student(profile: StudentProfile):
    """
    Look up the FeeTemplate for the student's grade + current academic year.
    Create a TuitionAccount with line items from the template.
    Apply any existing discounts.
    """
    if not profile.section or not profile.section.grade:
        return None

    grade = profile.section.grade

    template = (
        FeeTemplate.objects
        .filter(grade=grade, academic_year__is_current=True, is_active=True)
        .prefetch_related('items')
        .first()
    )
    if not template:
        return None

    if hasattr(profile, 'tuition_account'):
        return profile.tuition_account

    total = sum(item.amount for item in template.items.all())

    discounts = StudentDiscount.objects.filter(student=profile)
    discount_total = sum(d.amount for d in discounts)
    total = max(total - discount_total, Decimal('0'))

    account = TuitionAccount.objects.create(
        student=profile,
        total_amount=total,
        due_date=template.due_date,
        semester=template.academic_year.label,
    )

    for item in template.items.all():
        TuitionLineItem.objects.create(
            account=account,
            description=item.description,
            amount=item.amount,
        )

    if discount_total > 0:
        TuitionLineItem.objects.create(
            account=account,
            description=f'Scholarship/Discount ({discount_total})',
            amount=-discount_total,
        )

    return account
