"""
Utility functions for the chatbot app.
"""

import os
import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.core.files.storage import default_storage


def parse_test_cases(text: str) -> str:
    """
    Parse test case content into JSON format.
    
    Args:
        text: Raw text containing test cases
        
    Returns:
        JSON string of parsed test cases
    """
    test_cases = []
    matches = re.split(r'### Test case \d+', text)
    
    for case in matches[1:]:
        columns = {}
        lines = case.split("\n")
        steps = []
        is_step_section = False

        for line in lines:
            line = line.strip()
            if line.startswith("Số thứ tự:"):
                columns["id"] = line.split(":", 1)[1].strip()
            elif line.startswith("Độ ưu tiên:"):
                columns["priority"] = line.split(":", 1)[1].strip()
            elif line.startswith("Loại:"):
                columns["type"] = line.split(":", 1)[1].strip()
            elif line.startswith("Mục tiêu:"):
                columns["goal"] = line.split(":", 1)[1].strip()
            elif line.startswith("Dữ liệu kiểm tra:"):
                columns["test_data"] = line.split(":", 1)[1].strip()
            elif line.startswith("Điều kiện:"):
                columns["condition"] = line.split(":", 1)[1].strip()
            elif line.startswith("Các bước kiểm tra:"):
                is_step_section = True
            elif line.startswith("Kết quả mong đợi:"):
                columns["expected_result"] = line.split(":", 1)[1].strip()
                is_step_section = False
            elif line.startswith("Ghi chú:"):
                columns["note"] = line.split(":", 1)[1].strip()
            elif is_step_section and re.match(r'^\d+\.', line):
                steps.append(line)

        columns["steps"] = "\n".join(steps)
        
        # Only add if all required fields are present
        required_fields = ["id", "priority", "type", "goal", "test_data", "condition", "steps", "expected_result"]
        if all(field in columns for field in required_fields):
            test_cases.append(columns)

    return json.dumps(test_cases, ensure_ascii=False, indent=2)


def validate_excel_file(file_path: str) -> bool:
    """
    Validate Excel file format and structure.
    
    Args:
        file_path: Path to the Excel file
        
    Returns:
        True if valid, False otherwise
    """
    try:
        import openpyxl
        workbook = openpyxl.load_workbook(file_path)
        
        # Check if file has too many sheets
        if len(workbook.sheetnames) > 10:
            return False
            
        return True
    except Exception:
        return False


def generate_filename(prefix: str, extension: str = 'xlsx') -> str:
    """
    Generate a unique filename with timestamp.
    
    Args:
        prefix: File prefix
        extension: File extension
        
    Returns:
        Generated filename
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{timestamp}.{extension}"


def save_file_to_media(file, subdirectory: str = '') -> str:
    """
    Save uploaded file to media directory.
    
    Args:
        file: Uploaded file object
        subdirectory: Subdirectory within media
        
    Returns:
        Relative path to saved file
    """
    if subdirectory:
        file_path = os.path.join('media', subdirectory, file.name)
    else:
        file_path = os.path.join('media', file.name)
    
    # Ensure directory exists
    full_path = os.path.join(settings.MEDIA_ROOT, subdirectory) if subdirectory else settings.MEDIA_ROOT
    os.makedirs(full_path, exist_ok=True)
    
    # Save file
    with default_storage.open(file_path, 'wb') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    return file_path


def clean_text_for_ai(text: str) -> str:
    """
    Clean text before sending to AI API.
    
    Args:
        text: Input text
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove special characters that might cause issues
    text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
    
    return text


def format_date_for_display(date_obj) -> str:
    """
    Format date for display in templates.
    
    Args:
        date_obj: Date object
        
    Returns:
        Formatted date string
    """
    if isinstance(date_obj, str):
        date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
    
    return date_obj.strftime('%H:%M')


def get_file_size_mb(file_path: str) -> float:
    """
    Get file size in MB.
    
    Args:
        file_path: Path to file
        
    Returns:
        File size in MB
    """
    try:
        size_bytes = os.path.getsize(file_path)
        return size_bytes / (1024 * 1024)
    except OSError:
        return 0.0


def is_valid_json(text: str) -> bool:
    """
    Check if text is valid JSON.
    
    Args:
        text: Text to check
        
    Returns:
        True if valid JSON, False otherwise
    """
    try:
        json.loads(text)
        return True
    except (json.JSONDecodeError, TypeError):
        return False
