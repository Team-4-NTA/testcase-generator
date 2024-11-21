from django.db import models

# Create your models here.

class Chat(models.Model):
    screen_name = models.CharField(max_length=200)
    requirement = models.TextField()
    result = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    id = models.AutoField(primary_key=True)

    def __str__(self):
        return self.screen_name

class History(models.Model):
    name = models.CharField(max_length=200)
    chats = models.ManyToManyField(Chat, related_name='histories')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
