from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.shortcuts import render, redirect

@csrf_protect
def login_view(request):
    if request.method == "GET":
        return render(request, "admin/auth/login.html")

    elif request.method == "POST":
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "").strip()

        if not email or not password:
            return JsonResponse({
                "success": False,
                "message": "Email và mật khẩu không được để trống."
            }, status=400)
 
        user = authenticate(request, email=email, password=password)

        if user is None:
            return JsonResponse({
                "success": False,
                "message": "Email hoặc mật khẩu không chính xác."
            }, status=401)

        if not user.is_active:
            return JsonResponse({
                "success": False,
                "message": "Tài khoản của bạn đã bị vô hiệu hóa."
            }, status=403)

        if not (user.is_staff or user.is_superuser):
            return JsonResponse({
                "success": False,
                "message": "Tài khoản không có quyền truy cập trang quản trị."
            }, status=403)

        # Đăng nhập
        login(request, user)

    return JsonResponse({"success": True, "message": "Đăng nhập thành công."})

    
def logout_view(request):
    logout(request) 
    return redirect('/admin/login')