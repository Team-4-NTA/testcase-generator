from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import redirect
from django.contrib import messages

def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, "Tài khoản của bạn đã được kích hoạt!")
        return redirect("login")
    else:
        messages.error(request, "Link kích hoạt không hợp lệ hoặc đã hết hạn.")
        return redirect("register")
