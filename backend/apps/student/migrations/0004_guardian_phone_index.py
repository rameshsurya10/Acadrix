from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0003_alter_payment_method'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='guardian',
            index=models.Index(fields=['phone'], name='guardians_phone_idx'),
        ),
    ]
