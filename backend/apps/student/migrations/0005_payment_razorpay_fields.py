from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0004_guardian_phone_index'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='method',
            field=models.CharField(
                choices=[
                    ('bank_transfer', 'Bank Transfer'),
                    ('credit_card', 'Credit Card'),
                    ('cash', 'Cash'),
                    ('stripe', 'Stripe (Card)'),
                    ('razorpay', 'Razorpay (Online)'),
                    ('cheque', 'Cheque'),
                    ('other', 'Other'),
                ],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='payment',
            name='razorpay_order_id',
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='razorpay_payment_id',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
        migrations.AddField(
            model_name='payment',
            name='razorpay_signature',
            field=models.CharField(blank=True, default='', max_length=256),
        ),
        migrations.AddField(
            model_name='payment',
            name='gateway_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('created', 'Created'),
                    ('authorized', 'Authorized'),
                    ('captured', 'Captured'),
                    ('failed', 'Failed'),
                    ('refunded', 'Refunded'),
                ],
                default='',
                max_length=20,
            ),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['razorpay_payment_id'], name='payments_rzp_payment_idx'),
        ),
    ]
