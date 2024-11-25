# myproject/views.py
from django.shortcuts import render
from django.http import JsonResponse,StreamingHttpResponse
import openai
import json
from .models import Chat, History
from datetime import datetime

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
          "Ghi chú: <ghi chú>\n\n"
          "Ví dụ: Nếu chức năng là 'Đăng nhập', cung cấp các trường hợp kiểm thử như sau:\n\n"
          "Test case 1\n"
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
          "Ghi chú: Đảm bảo thông tin xác thực hợp lệ.\n"
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
    histories = History.objects.all().values("id", "name", "created_at")
    return JsonResponse(list(histories), safe=False)

def save_history(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            chats_data = data.get('chats', [])

            if not chats_data:
                return JsonResponse({"error": "No chats provided."}, status=400)

            chat_objects = []
            for chat_data in chats_data:
                screen_name = chat_data.get('screen_name')
                requirement = chat_data.get('requirement')
                result = chat_data.get('result')

                chat = Chat.objects.create(
                    screen_name=screen_name,
                    requirement=requirement,
                    result=result
                )
                chat_objects.append(chat)

            history = History.objects.create(name="User's Chat History")
            history.chats.set(chat_objects) 

            return JsonResponse({"message": "History saved successfully!"}, status=200)

        except Exception as e:
            print("Error:", e)
            return JsonResponse({"error": "There was an error saving the history."}, status=500)
    else:
        return JsonResponse({"error": "Invalid method."}, status=405)