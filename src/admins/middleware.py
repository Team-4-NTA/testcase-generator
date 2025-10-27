from django.shortcuts import redirect
from django.urls import reverse

class AdminAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):  
        path = request.path

        if path.startswith('/admin') and not path.startswith('/admin/login'):
            if not request.user.is_authenticated:
                return redirect('/admin/login')
            if not (request.user.is_staff or request.user.is_superuser):
                return redirect('/admin/login')

        if path.startswith('/admin/login'):
            if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
                return redirect('/admin/dashboard')

        return self.get_response(request)
