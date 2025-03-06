""" 
Module xử lý upload file.
"""

import os
import json
from datetime import datetime, date

import openai
import openpyxl
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from openpyxl import load_workbook
from openpyxl.styles import Alignment

from .models import Chat, ChatDetail
from . import views


client = openai.OpenAI(api_key="")

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        file_extension = file.name.split('.')[-1].lower()
        # Kiểm tra định dạng file
        if file_extension not in ['xlsx']:
            return JsonResponse({'message': 'Vui lòng chọn file Excel (xlsx)!'}, status=400)
        
        if validate_file_spec(file):
            data = data_spec(file)
        elif validate_file_api(file):
            data = data_api(file)  
        else:
            return JsonResponse({'message': 'Template spec không đúng định dạng'}, status=400)    
        
        current_dir = os.path.dirname(__file__)
        upload_dir = os.path.join(current_dir, "upload")

        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(upload_dir, exist_ok=True)

        # Tạo tên file theo thời gian
        original_filename = file.name
        file_path = os.path.join(upload_dir, original_filename)

        # Lưu file vào thư mục `result`
        fs = FileSystemStorage(location=upload_dir)
        filename = fs.get_available_name(original_filename)

        # Lưu file vào thư mục result/
        file_path = fs.save(filename, file)

        try:
            if isinstance(data, dict) and "item" in data and data["item"]:
                result = create_testcase(data)
                if "<!DOCTYPE" in result.choices[0].message.content or "<html>" in result.choices[0].message.content:
                    print("❌ Lỗi: API trả về HTML thay vì JSON!")
                    return JsonResponse({"error": "API returned an invalid response"}, status=500)
                test_case_text = result.choices[0].message.content
                json_data = views.parse_test_cases(test_case_text)
                history_id = request.POST.get('history_id')
                save_upload(data.get('screen_name', ''), json_data, history_id, file_path)
                return JsonResponse({"screen_name": data.get('screen_name', ''), "test_cases": json_data, })
            return JsonResponse({'message': 'Không có data trả về'}, status=400)           
        except Exception as e:
           return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Không có file nào được tải lên!'}, status=400)

def create_testcase(data):
    screen_name = data.get('screen_name', '')
    requirement = data.get('requirement', '')
    item =  data['item']
    prompt = (f"Tạo test case cho màn hình {screen_name}" +
        (f" với yêu cầu '{requirement}'" if requirement else "") +
        f" và gồm những item hiển thị có những điều kiện sau: {item} "
        "Liệt kê các trường hợp kiểm thử theo định dạng sau:\n"
        "Số thứ tự: <số thứ tự>\n"
        "Độ ưu tiên: <độ ưu tiên của test case>\n"
        "Loại: <loại test case>\n"
        "Mục tiêu: <mục tiêu test case>\n"
        "Dữ liệu kiểm tra: <dữ liệu để test>\n"
        "Điều kiện: <điều kiện để test>\n"
        "Các bước kiểm tra: <các bước để test>\n"
        "Kết quả mong đợi: <kết quả mong đợt>\n"
        "Ghi chú: <ghi chú>\n\n"
        "Ví dụ: Nếu chức năng là 'Đăng nhập', cung cấp các trường hợp kiểm thử như sau:\n\n"
        "### Test case 1\n"
        "Số thứ tự: 1\n"
        "Độ ưu tiên: Cao\n"
        "Loại: Kiểm thử chức năng\n"
        "Mục tiêu: Đăng nhập thành công với thông tin hợp lệ\n"
        "Dữ liệu kiểm tra: Tên người dùng: 'user123', Mật khẩu: 'password123'\n"
        "Điều kiện: Người dùng đã có tài khoản hợp lệ\n"
        "Các bước kiểm tra:\n"
        "    1. Nhập 'user123' vào trường Tên người dùng.\n"
        "    2. Nhập 'password123' vào trường Mật khẩu.\n"
        "    3. Nhấn nút 'Đăng nhập'.\n"
        "Kết quả mong đợi: đăng nhập thành công\n"
        "Ghi chú: Đảm bảo thông tin xác thực hợp lệ.\n"
        "Hãy viết đầy đủ các test case với yêu cầu trên, ghi đúng format đã có sẵn như ví dụ trên"
        )

    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "user", "content": prompt}
        ],
    )

    return response

# check validate template spec
def validate_file_spec(file_path):
    wb = load_workbook(file_path)
    sheet = wb.active  

    # Kiểm tra "Màn hình" (A1) và "Yêu cầu màn hình" (A2)
    expected_screen = "Màn hình"
    expected_screen_requirements = "Yêu cầu màn hình"

    screen_cell = sheet["A1"].value
    screen_requirements_cell = sheet["A2"].value


    if screen_cell != expected_screen or screen_requirements_cell != expected_screen_requirements:
        return False
    
    # Kiểm tra tiêu đề bảng (Dòng 8)
    expected_headers = ["STT", "Tên Item", "Require", "Type", "Max", "Min", "Condition/Spec/Event", "Data"]
    actual_headers = [sheet.cell(row=8, column=i).value for i in range(1, len(expected_headers) + 1)] 
    actual_headers = [header.strip() for header in actual_headers]
    return actual_headers == expected_headers

# check validate template api
def validate_file_api(file_path):

    wb = load_workbook(file_path)
    sheet = wb.active  
    api_name = "Tên API"

    # Kiểm tra có "Tên API" không (ô A1)
    expected_api_name = sheet["A1"].value
  
    if api_name != expected_api_name:
        return False

    # Kiểm tra tiêu đề bảng (Dòng 9)
    expected_headers = ["Loại", "Tên Tham số", "Bắt buộc", "Mô tả", "Mẫu"]
    actual_headers = []

    for i in range(1, len(expected_headers) + 1):
        cell_value = sheet.cell(row=9, column=i).value
        if cell_value is None:  
            cell_value = sheet.cell(row=8, column=i).value  # Thử lấy từ ô trên (nếu có)
        actual_headers.append(cell_value.strip() if cell_value else None)
    return actual_headers == actual_headers

# get data trong file excel
def data_spec(file):
    wb = load_workbook(filename=file, data_only=True)
    ws = wb.active  # Lấy sheet đầu tiên

    data = {  # Đổi từ list thành dict
        "screen_name": ws["B1"].value,
        "requirement": ws["B2"].value,
        "item": []
    }

    # Xử lý dữ liệu từ dòng 9 trở lên, chỉ lấy cột A đến H
    # Lấy tiêu đề từ dòng 8: chỉ lấy 8 cột đầu tiên (A đến H)
    headers = [cell.value for cell in ws[8][:8]]
    item = []
    for row in ws.iter_rows(min_row=9, max_col=8, values_only=True):
        row_data = {}
        for i in range(len(headers)):
            # Lấy giá trị của từng ô trong các cột A-H
            cell_value = row[i] if i < len(row) else None
            if cell_value is not None:
                row_data[headers[i]] = cell_value
        if row_data:  # Chỉ thêm nếu dòng không rỗng
            item.append(row_data)
    data['item'] = item
    return data    

# get data trong file excel
def data_api(file):
    wb = load_workbook(filename=file, data_only=True)
    ws = wb.active  # Lấy sheet đầu tiên

    data = {
        "screen_name": ws["B1"].value,
        "item": []
    }

    # Xác định vị trí của tiêu đề trong sheet
    header_rows = [cell.row for cell in ws["A"] if cell.value == "Loại"]

    if len(header_rows) < 2:
        raise ValueError("Không tìm thấy 'Loại' thứ hai trong cột A")

    header_index = header_rows[1]  # Lấy dòng chứa 'Loại' thứ 2

    # Lấy dữ liệu từ dòng 10 đến ngay trước dòng tiêu đề
    headers = [cell.value for cell in ws[9][:6]]  # Tiêu đề cột (dòng 9)
    item = []

    for row in ws.iter_rows(min_row=10, max_row=header_index - 1, max_col=6, values_only=True):
        row_data = {}
        for i in range(len(headers)):
            cell_value = row[i] if i < len(row) else None
            if cell_value is not None:
                row_data[headers[i]] = cell_value

        if "Tên Tham số" in row_data and None in row_data:
            row_data["Tên Tham số"] = f'{row_data["Tên Tham số"]} gồm {row_data[None]}'
            del row_data[None]  # Xóa key None sau khi xử lý
        if row_data:
            item.append(row_data)

    data["item"] = item
    return data

def write_test_case_to_excel(screen_name, test_cases_json):
    try:
        current_dir = os.path.dirname(__file__)
        template_file_path = os.path.join(current_dir, "files/format-testcase.xlsx")

        if not os.path.exists(template_file_path):
            raise FileNotFoundError("Template file not found!")

        workbook = openpyxl.load_workbook(template_file_path)
        sheet = workbook.active

        # Ghi "Tên màn hình" vào ô đầu tiên
        sheet["A2"] = screen_name
        sheet["F2"] = date.today()

        test_cases = json.loads(test_cases_json)  # Chuyển JSON string thành list
        row = 9

        for case in test_cases:
            sheet[f"A{row}"] = case.get("id", "")
            sheet[f"B{row}"] = case.get("priority", "")
            sheet[f"C{row}"] = case.get("type", "")
            sheet[f"D{row}"] = case.get("goal", "")
            sheet[f"E{row}"] = case.get("test_data", "").replace(",", ",\n")
            sheet[f"F{row}"] = case.get("condition", "")
            sheet[f"G{row}"] = case.get("steps", "")
            sheet[f"H{row}"] = case.get("expected_result", "")
            sheet[f"I{row}"] = case.get("note", "")
            row += 1

        for row in sheet.iter_rows(min_row=9, max_row=row - 1):
            for cell in row:
                cell.alignment = Alignment(wrap_text=True)

        # Tạo thư mục upload nếu chưa có
        upload_dir = os.path.join(current_dir, "resutl")
        os.makedirs(upload_dir, exist_ok=True)
        current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        # Đường dẫn lưu file
        file_name = f"{current_time}_testcase.xlsx"
        file_path = os.path.join(upload_dir, file_name)

        workbook.save(file_path)

        return file_path  # Trả về đường dẫn file đã lưu

    except Exception as e:
        print(f"Error: {str(e)}")
        return None

@csrf_exempt
def save_upload(screen_name, chat_data, history_id, url):
    file_path = write_test_case_to_excel(screen_name, chat_data)
    if not chat_data:
        return JsonResponse({"error": "No chats provided."}, status=400)

    chat_objects = []

    history = None
    if not history_id or history_id.lower() == 'null': 
        history = Chat.objects.create(title=screen_name)
    else:
        try:
            history = Chat.objects.get(id=history_id)
        except FileNotFoundError:
            return JsonResponse({"error": "History not found."}, status=404)
    chat = ChatDetail.objects.create(
        chat_id=history,  
        screen_name=screen_name,
        requirement='',
        result='',
        chat_type=2,
        url_requirement=url,
        url_result=file_path 
    )

    chat_objects.append(chat)
    return JsonResponse({"success": True, "history_id": history.id})
