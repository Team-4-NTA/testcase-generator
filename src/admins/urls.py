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
    path('edit-user/<int:user_id>/', users.edit_user, name='edit_user'),
    path('add-user', users.add_user, name='add_user'),
    path('delete-user/<int:user_id>/', users.delete_user, name='delete_user'),
]
