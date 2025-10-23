""" 
Module xử lý urls.
"""
from django.urls import path
from . import users, auth, dashboard

urlpatterns = [
    path('login', auth.login_view, name='login'),
    path('logout', auth.logout_view, name='logout'),
    path('users', users.users, name='users'),
    path('dashboard', dashboard.index, name='index'),
]
