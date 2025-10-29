import json
import re
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.forms import SetPasswordForm
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib import messages
from django.conf import settings

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

def forgot_password(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, "Email không tồn tại trong hệ thống.")
            return redirect('forgot_password')

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = request.build_absolute_uri(f'/reset-password/{uid}/{token}/')

        message = render_to_string('auth/reset_password_email.html', {
            'user': user,
            'reset_link': reset_link,
        })

        send_mail(
            'Đặt lại mật khẩu',
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        messages.success(request, 'Một email đặt lại mật khẩu đã được gửi tới bạn.')
        return redirect('forgot_password')

    return render(request, 'auth/forgot_password.html')


def reset_password(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        user = None

    context = {'uid': uidb64, 'token': token}

    if not user or not default_token_generator.check_token(user, token):
        messages.error(request, "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.")
        return redirect('forgot_password')

    if request.method == 'GET':
        return render(request, 'auth/reset_password.html', context)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Dữ liệu không hợp lệ."}, status=400)

        password = (data.get('password') or '').strip()
        password_confirm = (data.get('passwordComfirm') or '').strip()

        if not password or not password_confirm:
            return JsonResponse({"success": False, "message": "Vui lòng nhập đầy đủ mật khẩu."}, status=400)

        if password != password_confirm:
            return JsonResponse({"success": False, "message": "Mật khẩu không khớp."}, status=400)

        pattern = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$')
        if not pattern.match(password):
            return JsonResponse({
                "success": False,
                "message": "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt và không có khoảng trắng."
            }, status=400)

        user.set_password(password)
        user.save()

        return JsonResponse({"success": True, "message": "Đổi mật khẩu thành công!"})

    return JsonResponse({"success": False, "message": "Phương thức không được hỗ trợ."}, status=405)

def register(request):
    if request.method == "POST":
        # Lấy dữ liệu
        if request.content_type == "application/json":
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
            firstname = data.get("firstname")
            lastname = data.get("lastname")
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            is_ajax = True
        else:
            firstname = data.get("firstname")
            lastname = data.get("lastname")
            username = data.get("username")
            email = request.POST.get("email")
            password = request.POST.get("password")
            is_ajax = False

        if not email or not password:
            return JsonResponse({"success": False, "message": "Email và mật khẩu không được để trống."})

        if not lastname or not firstname:
            return JsonResponse({"success": False, "message": "Họ và tên không được để trống."})

        if not username:
            return JsonResponse({"success": False, "message": "Tên đăng nhập không được để trống."})
        
        if User.objects.filter(username=username).exists():
            msg = "Username đã tồn tại"
            if is_ajax:
                return JsonResponse({"success": False, "message": msg}, status=400)
            messages.error(request, msg)
            return redirect("register")
        
        if User.objects.filter(email=email).exists():
            msg = "Email đã tồn tại"
            if is_ajax:
                return JsonResponse({"success": False, "message": msg}, status=400)
            messages.error(request, msg)
            return redirect("register")

        # Tạo user (chưa active)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=firstname,
            last_name=lastname,
            is_active=False
        )

        # Tạo token và link xác nhận
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        confirm_link = request.build_absolute_uri(f'/activate/{uid}/{token}/')

        # Render email từ template
        subject = "Xác nhận tài khoản của bạn"
        message = render_to_string("auth/confirm_email.html", {
            "user": user,
            "confirm_link": confirm_link,
        })

        # Gửi mail
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        success_msg = "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."
        if is_ajax:
            return JsonResponse({"success": True, "message": success_msg})
        messages.success(request, success_msg)
        return redirect("login")

    return render(request, "auth/register.html")
