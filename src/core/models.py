from django.db import models

from django.db import models


class User(models.Model):
    username = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    avatar = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


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


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_roles'

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


