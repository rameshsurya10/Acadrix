from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='otp',
            name='email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='otp',
            name='phone',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddIndex(
            model_name='otp',
            index=models.Index(fields=['phone', 'purpose', 'is_used'], name='otps_phone_purpose_used_idx'),
        ),
    ]
