from django.core.paginator import Paginator
from django.contrib.auth import get_user_model
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from core.models import UserDetail
import json

User = get_user_model()

def users(request):
    user_list = User.objects.filter(is_superuser=False, is_active=True).order_by('-date_joined')
    paginator = Paginator(user_list, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "admin/users.html", {"page_obj": page_obj})

@csrf_exempt
def add_user(request):
    if not request.user.is_superuser:
        return JsonResponse({"error": "Bạn không có quyền thực hiện hành động này."}, status=403)
    if request.method == "POST":
        # Nếu là multipart/form-data thì dùng request.POST và request.FILES
        if request.content_type.startswith("multipart/form-data"):
            username = request.POST.get("username")
            email = request.POST.get("email")
            password = request.POST.get("password")
            first_name = request.POST.get("firstname", "")
            last_name = request.POST.get("lastname", "")
            avatar = request.FILES.get("photo")
        else:
            data = json.loads(request.body.decode("utf-8"))
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            first_name = data.get("firstname", "")
            last_name = data.get("lastname", "")
            avatar = None 

        if not username or not password:
            return JsonResponse({"error": "Username và password là bắt buộc"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username đã tồn tại"}, status=400)

        # Tạo User mặc định
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=make_password(password),
        )

        # Tạo UserDetail nếu có avatar
        user_detail = UserDetail.objects.create(user=user, avatar=avatar)

        return JsonResponse({ "message": "Tạo người dùng thành công" }, status=201)

    return render(request, "admin/add_user.html")

@csrf_exempt
def edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user_detail, created = UserDetail.objects.get_or_create(user=user)

    if request.method == "POST":
        data = request.POST or json.loads(request.body.decode("utf-8"))
        user.username = data.get("username", user.username)
        user.email = data.get("email", user.email)
        user.first_name = data.get("firstname", user.first_name)
        user.last_name = data.get("lastname", user.last_name)

        delete_avatar = data.get("delete_avatar") == "true"
        if delete_avatar and user_detail.avatar:
            user_detail.avatar.delete(save=False)
            user_detail.avatar = None
            user_detail.save()  

        # Cập nhật mật khẩu nếu có
        new_password = data.get("password")
        if new_password:
            user.password = make_password(new_password)
        
        new_avatar = request.FILES.get("photo")
        if new_avatar:
            if not user_detail.avatar or user_detail.avatar.name != new_avatar.name:
                user_detail.avatar = new_avatar
                user_detail.save()

        user.save()
        return JsonResponse({"message": "Cập nhật thành công"}, status=200)

    return render(request, "admin/edit_user.html", {"user": user, "user_detail": user_detail})

@csrf_exempt
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return JsonResponse({"message": "Xóa người dùng thành công"}, status=200)
