# Generated migration for Enrollment model

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0003_section_adviser_alter_adminprofile_permissions_level_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Enrollment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grade_level', models.IntegerField(choices=[(1, 'Grade 1'), (2, 'Grade 2'), (3, 'Grade 3'), (4, 'Grade 4'), (5, 'Grade 5'), (6, 'Grade 6')])),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('COMPLETED', 'Completed'), ('DROPPED', 'Dropped'), ('PENDING', 'Pending')], default='PENDING', max_length=20)),
                ('enrolled_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('academic_year', models.CharField(default='2024-2025', max_length=10)),
                ('remarks', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to='accounts.section')),
                ('student', models.ForeignKey(limit_choices_to={'role': 'PARENT_STUDENT'}, on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to='accounts.user')),
            ],
            options={
                'verbose_name': 'Enrollment',
                'verbose_name_plural': 'Enrollments',
                'ordering': ['-enrolled_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='enrollment',
            unique_together={('student', 'section', 'grade_level', 'academic_year')},
        ),
    ]
