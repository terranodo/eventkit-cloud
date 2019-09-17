# Generated by Django 2.2.3 on 2019-09-05 14:32

from django.db import migrations, models
import django.utils.timezone
import uuid


class Migration(migrations.Migration):
    def insert_default_projections(apps, schema_editor):  # NOQA
        Projection = apps.get_model('jobs', 'Projection')  # NOQA
        Projection.objects.create(
            name='World Geodetic System 1984 (WGS84)', srid=4326)
        Projection.objects.create(
            name='WGS 84 / Pseudo-Mercator', srid=3857)

    dependencies = [
        ('jobs', 'add_supported_format_settings'),
    ]

    operations = [
        migrations.CreateModel(
            name='Projection',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('id', models.AutoField(editable=False, primary_key=True, serialize=False)),
                ('uid', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('srid', models.IntegerField(unique=True)),
                ('description', models.CharField(blank=True, max_length=255, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='job',
            name='projections',
            field=models.ManyToManyField(related_name='projections', to='jobs.Projection'),
        ),
        migrations.RunPython(insert_default_projections),
    ]
