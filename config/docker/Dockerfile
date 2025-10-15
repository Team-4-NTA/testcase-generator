# Chọn ảnh nền Python chính thức
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép các tệp yêu cầu vào container
COPY requirements.txt .

# Cài đặt các gói Python cần thiết
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn ứng dụng vào container
COPY src .

# Cổng mặc định mà ứng dụng Django sẽ chạy
EXPOSE 8000

# Lệnh chạy ứng dụng Django khi container khởi động
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]