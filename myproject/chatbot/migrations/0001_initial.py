# Generated by Django 5.1.6 on 2025-02-20 07:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'chats',
            },
        ),
        migrations.CreateModel(
            name='ChatDetail',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('screen_name', models.CharField(max_length=100)),
                ('requirement', models.TextField()),
                ('result', models.TextField()),
                ('chat_type', models.IntegerField()),
                ('url_requirement', models.TextField()),
                ('url_result', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('chat_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chatbot.chat')),
            ],
            options={
                'db_table': 'chat_detail',
            },
        ),
    ]
