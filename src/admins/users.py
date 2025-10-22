from django.core.paginator import Paginator
from django.shortcuts import render
from django.contrib.auth import get_user_model

User = get_user_model()

def users(request):
    user_list = User.objects.all().order_by('-date_joined')
    paginator = Paginator(user_list, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "admin/users.html", {"page_obj": page_obj})