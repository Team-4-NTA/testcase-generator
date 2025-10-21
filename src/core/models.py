from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser

class UserDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.user.username
    class Meta:
        db_table = 'user_details'

class UserProvider(models.Model):
    PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('facebook', 'Facebook'),
        ('github', 'GitHub'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='providers')
    provider_name = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    provider_id = models.CharField(max_length=255)
    access_token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_providers'


class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.TextField(null=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return str(self.title)

    class Meta:
        db_table = 'chats'

class ChatDetail(models.Model):
    id = models.AutoField(primary_key=True)
    chat_id = models.ForeignKey("Chat", on_delete=models.CASCADE)
    screen_name = models.CharField(max_length=100, null=False)
    requirement = models.TextField(null=False)
    result = models.TextField(null=False)
    chat_type = models.IntegerField(null=False)
    url_requirement = models.TextField(null=False)
    url_result = models.TextField(null=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.screen_name} - {self.chat_id}"

    class Meta:
        db_table = 'chat_detail'


