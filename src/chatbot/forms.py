"""
Django forms for the chatbot app.
"""

from django import forms
from core.models import Chat, ChatDetail


class ChatForm(forms.ModelForm):
    """Form for creating and editing chat sessions."""
    
    class Meta:
        model = Chat
        fields = ['title']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter chat title'
            })
        }


class ChatDetailForm(forms.ModelForm):
    """Form for creating and editing chat details."""
    
    class Meta:
        model = ChatDetail
        fields = ['screen_name', 'requirement', 'result', 'chat_type']
        widgets = {
            'screen_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter screen name'
            }),
            'requirement': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Enter requirements',
                'rows': 3
            }),
            'result': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Enter result',
                'rows': 5
            }),
            'chat_type': forms.Select(attrs={
                'class': 'form-control'
            })
        }


class FileUploadForm(forms.Form):
    """Form for file uploads."""
    
    file = forms.FileField(
        label='Upload Excel File',
        help_text='Upload an Excel file (.xlsx) with test case specifications',
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': '.xlsx,.xls'
        })
    )
    
    def clean_file(self):
        file = self.cleaned_data.get('file')
        if file:
            if not file.name.endswith(('.xlsx', '.xls')):
                raise forms.ValidationError('Only Excel files (.xlsx, .xls) are allowed.')
            if file.size > 10 * 1024 * 1024:  # 10MB limit
                raise forms.ValidationError('File size must be less than 10MB.')
        return file


class TestCaseGenerationForm(forms.Form):
    """Form for test case generation."""
    
    screen_name = forms.CharField(
        max_length=100,
        label='Screen Name',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter screen name'
        })
    )
    
    requirement = forms.CharField(
        label='Requirements',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Enter requirements',
            'rows': 3
        })
    )
    
    chat_type = forms.ChoiceField(
        choices=[
            ('1', 'Test Case Generation'),
            ('2', 'Template Generation')
        ],
        widget=forms.RadioSelect(attrs={
            'class': 'form-check-input'
        })
    )
