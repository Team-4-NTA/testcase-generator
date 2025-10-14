"""
Django REST Framework serializers for the chatbot app.
"""

from rest_framework import serializers
from .models import Chat, ChatDetail


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for Chat model."""
    
    class Meta:
        model = Chat
        fields = ['id', 'title', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatDetailSerializer(serializers.ModelSerializer):
    """Serializer for ChatDetail model."""
    
    chat_id = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())
    
    class Meta:
        model = ChatDetail
        fields = [
            'id', 'chat_id', 'screen_name', 'requirement', 'result',
            'chat_type', 'url_requirement', 'url_result', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TestCaseGenerationSerializer(serializers.Serializer):
    """Serializer for test case generation requests."""
    
    screen_name = serializers.CharField(max_length=100)
    requirement = serializers.CharField()
    chat_type = serializers.IntegerField(default=1)
    history_id = serializers.IntegerField(required=False, allow_null=True)


class FileUploadSerializer(serializers.Serializer):
    """Serializer for file upload requests."""
    
    file = serializers.FileField()
    history_id = serializers.IntegerField(required=False, allow_null=True)


class TemplateGenerationSerializer(serializers.Serializer):
    """Serializer for template generation requests."""
    
    screen_name = serializers.CharField(max_length=100)
    requirement = serializers.CharField()
    type = serializers.ChoiceField(choices=['spec', 'api'])
    history_id = serializers.IntegerField(required=False, allow_null=True)


class ExcelExportSerializer(serializers.Serializer):
    """Serializer for Excel export requests."""
    
    screen_name = serializers.CharField(max_length=100)
    test_case = serializers.JSONField()
