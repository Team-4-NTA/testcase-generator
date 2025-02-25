from django.db import models

class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.TextField(null=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return self.title

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
