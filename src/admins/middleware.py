from django.shortcuts import redirect
from django.urls import reverse

class AdminAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Nếu truy cập vào /admin/ mà user không phải admin
        if request.path.startswith('/admin/') and not request.path.startswith('/admin/login'):
            if not request.user.is_authenticated:
                return redirect('/admin/login')
            if not (request.user.is_staff or request.user.is_superuser):
                return redirect('/admin/login')
        return self.get_response(request)
