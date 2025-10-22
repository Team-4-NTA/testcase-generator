from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode 
from django.shortcuts import redirect
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
import traceback, json

def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        messages.add_message(
            request,
            messages.SUCCESS,
            "Tài khoản của bạn đã được kích hoạt!",
            extra_tags="activation"
        )
        return redirect("login")
    else:
        messages.add_message(
            request,
            messages.ERROR,
            "Link kích hoạt không hợp lệ hoặc đã hết hạn.",
            extra_tags="activation"
        )
        return redirect("register")

def resend_confirm_email(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "Phương thức không hợp lệ."})

    try:
        data = json.loads(request.body)
        email = data.get("emailReset")
    except Exception:
        return JsonResponse({"success": False, "message": "Email không hợp lệ."})

    if not email:
        return JsonResponse({"success": False, "message": "Email không được để trống."})

    try:
        user = User.objects.get(email=email)
        if user.is_active:
            return JsonResponse({"success": False, "message": "Tài khoản đã được kích hoạt."})

        # 🔹 Tạo token + link xác nhận
        current_site = get_current_site(request)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        confirm_link = f"http://{current_site.domain}/activate/{uid}/{token}/"

        # 🔹 Render email
        subject = "Xác nhận tài khoản của bạn"
        message = render_to_string("auth/confirm_email.html", {
            "user": user,
            "confirm_link": confirm_link,
        })

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return JsonResponse({"success": True, "message": "Email xác nhận đã được gửi lại."})

    except User.DoesNotExist:
        return JsonResponse({"success": False, "message": "Không tìm thấy tài khoản với email này."})
    except Exception:
        traceback.print_exc()
        return JsonResponse({"success": False, "message": "Có lỗi xảy ra, vui lòng thử lại sau."})