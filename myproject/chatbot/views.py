# myproject/views.py
from django.shortcuts import render
from django.http import JsonResponse,StreamingHttpResponse, HttpResponse
import openai
import json
from .models import Chat, History
from datetime import datetime
import openpyxl
import os
from openpyxl.styles import Alignment
from django.views.decorators.csrf import csrf_exempt

openai.api_key = ''

def chatgpt_login_testcase(request):
    if request.method == "POST":
        # Lấy dữ liệu từ yêu cầu POST
        data = json.loads(request.body)
        screen_name = data.get('screen_name', '')
        requirement = data.get('requirement', '')

        prompt = (f"Tạo test case cho màn hình {screen_name} với yêu cầu '{requirement}'. "
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
          "Kết quả mong đợi: đăng nhập thành công"
          "Ghi chú: Đảm bảo thông tin xác thực hợp lệ.\n"
          "Hãy viết đầy đủ các test case với yêu cầu trên, ghi đúng format đã có sẵn như ví dụ trên"
         )
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[ 
                {"role": "user", "content": prompt}
            ],
            stream=True 
        )

        def stream_response():
            for chunk in response:
                if 'choices' in chunk:
                    content = chunk['choices'][0]['delta'].get('content', '')
                    yield content

        return StreamingHttpResponse(stream_response(), content_type='text/plain')

    return render(request, "chatbot.html")

def get_chat_list(request, history_id):
    try:
        history = History.objects.get(id=history_id)
        chats = history.chats.values("id", "screen_name", "requirement", "result", "created_at")
        return JsonResponse(list(chats), safe=False)
    except History.DoesNotExist:
        return JsonResponse({"error": "History not found"}, status=404)

def get_history(request):
    histories = History.objects.all().values("id", "name", "created_at").distinct()
    return JsonResponse(list(histories), safe=False)

@csrf_exempt
def save_history(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            history_id = data.get('history_id')
            chats_data = data.get('chats', [])

            if not chats_data:
                return JsonResponse({"error": "No chats provided."}, status=400)

            chat_objects = []
            for chat_data in chats_data:
                screen_name = chat_data.get('screen_name')

                if not screen_name or screen_name.strip() == "" or screen_name == "N/A":
                    continue 

                requirement = chat_data.get('requirement')
                result = chat_data.get('result')

                chat = Chat.objects.create(
                    screen_name=screen_name,
                    requirement=requirement,
                    result=result
                )

                chat_objects.append(chat)

            if history_id:
                try:
                    history = History.objects.get(id=history_id)
                    history.chats.add(*chat_objects)
                except History.DoesNotExist:
                    return JsonResponse({"error": "History not found."}, status=404)
            else:
                history = History.objects.create(name=chat_objects[0].screen_name)
                history.chats.set(chat_objects)

            return JsonResponse({"success": True, "history_id": history.id})

        except Exception as e:
            print("Error:", e)
            return JsonResponse({"error": "There was an error saving the history."}, status=500)
    else:
        return JsonResponse({"error": "Invalid method."}, status=405)
    
@csrf_exempt
def delete_history(request, history_id):
    try:
        history = History.objects.get(id=history_id)
        chats = history.chats.all()

        for chat in chats:
            chat.delete()

        # Xóa history
        history.delete()

        return JsonResponse({"message": "History and associated chats deleted successfully"}, status=200)

    except History.DoesNotExist:
        return JsonResponse({"error": "History not found"}, status=404)

def write_test_case_to_excel(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            screen_name = data.get('screenName', '')
            data_test_case = data.get('testCase', '')

            current_dir = os.path.dirname(__file__)
            template_file_path = os.path.join(current_dir, "files/format-testcase.xlsx")

            if not os.path.exists(template_file_path):
                return JsonResponse({"error": "Template file not found!"}, status=500)

            workbook = openpyxl.load_workbook(template_file_path)
            sheet = workbook.active

            # Ghi "Tên màn hình" vào ô đầu tiên
            sheet["A2"] = screen_name

            test_cases = data_test_case.split("### Test case")[1:]
            row = 9
            for case in test_cases:
                columns = []
                lines = case.splitlines()
                steps = []
                for line in lines:
                    if "Số thứ tự:" in line:
                        columns.append(line.split(":")[1].strip())
                    elif "Độ ưu tiên:" in line:
                        columns.append(line.split(":")[1].strip())
                    elif "Loại:" in line:
                        columns.append(line.split(":")[1].strip())
                    elif "Mục tiêu:" in line:
                        columns.append(line.split(":")[1].strip())
                    elif "Dữ liệu kiểm tra:" in line:
                        data_test = line.split(":", 1)[1].strip()
                        data_test = data_test.replace(",", ",\n") 
                        columns.append(data_test)
                    elif "Điều kiện:" in line:
                        columns.append(line.split(":")[1].strip())
                    elif "Các bước kiểm tra:" in line:
                        steps = []
                    elif line.strip().startswith(tuple(str(i) + "." for i in range(1, 10))):
                        steps.append(line.strip())
                    elif "Kết quả mong đợi:" in line:
                        columns.append(line.split(":")[1].strip())
                    elif "Ghi chú:" in line:
                        columns.append(line.split(":")[1].strip())

                columns.append("\n".join(steps))
                if len(columns) == 9:
                    sheet[f"A{row}"] = columns[0]
                    sheet[f"B{row}"] = columns[1]
                    sheet[f"C{row}"] = columns[2]
                    sheet[f"D{row}"] = columns[3]
                    sheet[f"E{row}"] = columns[4]
                    sheet[f"F{row}"] = columns[5]
                    sheet[f"G{row}"] = columns[8]
                    sheet[f"H{row}"] = columns[6]
                    sheet[f"I{row}"] = columns[7]
                    row += 1

            for row in sheet.iter_rows(min_row=9, max_row=row - 1):
                for cell in row:
                    cell.alignment = Alignment(wrap_text=True)

            from io import BytesIO
            excel_file = BytesIO()
            workbook.save(excel_file)
            excel_file.seek(0)

            response = HttpResponse(excel_file, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{screen_name}_testcase.xlsx"'
            return response

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

