import os
import json
import logging
from pathlib import Path
import re

import openai
from openpyxl import Workbook
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

client = openai.OpenAI(api_key="")

# Đường dẫn thư mục lưu file
MEDIA_DIR = Path("media")
MEDIA_DIR.mkdir(exist_ok=True)


@csrf_exempt
def generate_template(request):
    """Xử lý request tạo template"""
    data = json.loads(request.body)
    screen_name = data.get("screen_name")
    spec_data = generate_spec_data(data)
    file_path = create_excel_file(screen_name, spec_data)
    return JsonResponse({
            "screen_name": screen_name,
            "test_cases": {
                "spec_data": spec_data,
                # "api_data": api_data
            },
            "file_url": str(file_path)
        })

def generate_spec_data(data):
    screen_name = data.get('screen_name', '')
    requirement = data.get('requirement', '')
    prompt = (
        f"Dựa vào màn hình {screen_name} và yêu cầu: {requirement}, tạo danh sách thông số cần có:\n"
        "- STT\n- Tên Item\n- Require\n- Type\n- Max\n- Min\n- Condition/Spec/Event\n- Data"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    print(f"jhvkjsldv {response.choices[0].message.content}")
    print(f"jhvkjsldv {parse_spec_data(response.choices[0].message.content)}")

    return parse_spec_data(response.choices[0].message.content)

def parse_spec_data(response_text):
    """Chuyển đổi bảng markdown từ OpenAI thành danh sách dictionary"""
    lines = response_text.split("\n")
    
    spec_data = []
    table_started = False
    
    for line in lines:
        # Bỏ qua tiêu đề và đường phân cách bảng
        if "| STT |" in line:
            table_started = True
            continue
        if table_started and re.match(r"^\|\s*-+\s*\|", line):
            continue
        
        # Nếu bảng đã bắt đầu, xử lý từng dòng
        if table_started and "|" in line:
            columns = [col.strip() for col in line.split("|")[1:-1]]  # Bỏ cột đầu và cuối (do split("|") tạo phần tử rỗng)
            if len(columns) == 8:  # Đúng số lượng cột
                spec_data.append({
                    "STT": columns[0],
                    "Tên Item": columns[1],
                    "Require": columns[2],
                    "Type": columns[3],
                    "Max": columns[4],
                    "Min": columns[5],
                    "Condition/Spec/Event": columns[6],
                    "Data": columns[7]
                })
    
    return spec_data

def create_excel_file(screen_name, spec_data):
    """Tạo file Excel từ spec_data và api_data"""
    wb = Workbook()
    ws = wb.active
    ws.title = "Spec"

    # Thêm tiêu đề
    ws.append(["Màn hình", screen_name])
    ws.append(["Yêu cầu màn hình", ""])
    ws.append([])
    ws.append(["STT", "Tên Item", "Require", "Type", "Max", "Min", "Condition/Spec/Event", "Data"])

    # Ghi dữ liệu Spec
    for item in spec_data:
        ws.append([item.get(k, "") for k in ["STT", "Tên Item", "Require", "Type", "Max", "Min", "Condition/Spec/Event", "Data"]])

    file_path = MEDIA_DIR / f"{screen_name}_template.xlsx"
    wb.save(file_path)

    return file_path
