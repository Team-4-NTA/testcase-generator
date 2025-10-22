""" 
Module xử lý urls.
"""
from django.urls import path, include
from . import users

urlpatterns = [
    path('users', users.users, name='users'),
]
