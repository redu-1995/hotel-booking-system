from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="payment",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("COMPLETED", "Completed"),
                    ("FAILED", "Failed"),
                    ("REFUNDED", "Refunded"),
                ],
                default="PENDING",
                max_length=50,
            ),
        ),
    ]