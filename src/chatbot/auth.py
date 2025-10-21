from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from django.shortcuts import redirect

@csrf_protect
def login_view(request):
    if request.method == "GET":
        if request.user.is_authenticated:
          return redirect('/')
        return render(request, "auth/login.html")
    
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        if not email or not password:
            return JsonResponse({"success": False, "message": "Email và mật khẩu không được để trống."})

        user = authenticate(request, email=email, password=password)
        if user is None:
            return JsonResponse({"success": False, "message": "Email hoặc mật khẩu không chính xác."})

        if not user.is_active:
            return JsonResponse({"success": False, "message": "Tài khoản của bạn đã bị vô hiệu hóa."})

        # login user
        login(request, user)
        
        return JsonResponse({"success": True, "message": "Đăng nhập thành công."})
    
def logout_view(request):
    logout(request) 
    return redirect('/login')