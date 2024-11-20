# myproject/views.py
from django.shortcuts import render
from django.http import JsonResponse,StreamingHttpResponse
import openai
import json
import pandas as pd

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
            stream=True  # Kích hoạt stream
        )

        def stream_response():
            for chunk in response:
                if 'choices' in chunk:
                    content = chunk['choices'][0]['delta'].get('content', '')
                    yield content

        return StreamingHttpResponse(stream_response(), content_type='text/plain')

    return render(request, "chatbot.html")

