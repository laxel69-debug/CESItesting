from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('announcements', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Rename "text" -> "content"
        migrations.RenameField(
            model_name='announcement',
            old_name='text',
            new_name='content',
        ),

        # Add new fields
        migrations.AddField(
            model_name='announcement',
            name='title',
            field=models.CharField(max_length=255, default=''),
        ),
        migrations.AddField(
            model_name='announcement',
            name='target_role',
            field=models.CharField(
                max_length=20,
                choices=[('all', 'All'), ('students', 'Students'), ('teachers', 'Teachers'), ('parents', 'Parents')],
                default='all'
            ),
        ),
        migrations.AddField(
            model_name='announcement',
            name='publish_date',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='announcement',
            name='created_by',
            field=models.ForeignKey(
                to=settings.AUTH_USER_MODEL,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='announcements',
                null=True,
                blank=True,
            ),
        ),
        migrations.AddField(
            model_name='announcement',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
