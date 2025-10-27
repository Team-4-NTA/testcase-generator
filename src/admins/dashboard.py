from django.shortcuts import render
from django.contrib.auth.models import User
from core.models import ChatDetail
from django.utils import timezone
from django.db.models.functions import TruncDate
from django.db.models import Count
from datetime import timedelta

def index(request):
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)
    one_month_ago = timezone.now() - timedelta(days=30)

    total_users = User.objects.count() 
    total_users_active = User.objects.filter(is_active=True).count()
    total_ai_request = ChatDetail.objects.count() 
    testcases_this_month = ChatDetail.objects.filter(created_at__gte=start_of_month).count()
    user_logins_today = User.objects.filter(
        last_login__gte=today_start,
        last_login__lt=tomorrow_start
    ).count()

    # Nhóm theo ngày tạo
    testcases_over_time = (
    ChatDetail.objects.filter(created_at__gte=one_month_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(total=Count('id'))
        .order_by('date')
    )

    # Chuẩn bị dữ liệu cho Chart.js
    labels = [item['date'].strftime('%d/%m/%Y') for item in testcases_over_time]
    data = [item['total'] for item in testcases_over_time]


    context = {
        'total_users': total_users,
        'total_users_active': total_users_active,
        'total_ai_request': total_ai_request,
        'testcases_this_month': testcases_this_month,
        'user_logins_today': user_logins_today,
        'labels': labels,
        'data': data,
    }
    return render(request, 'admin/dashboard.html', context)