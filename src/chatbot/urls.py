""" 
Module xử lý urls.
"""
from django.urls import path, include
from django.contrib.auth.views import LogoutView
from . import views, upload, template, auth, confirm_email

urlpatterns = [
    path('login', auth.login_view, name='login'),
    path('logout', auth.logout_view, name='logout'),
    path('accounts/', include('allauth.urls')),
    path('forgot-password', auth.forgot_password, name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', auth.reset_password, name='reset_password'),
    path('register', auth.register, name='register'),
    path('resend-confirm-email/', confirm_email.resend_confirm_email, name='resend_confirm_email'),
    path("activate/<uidb64>/<token>/", confirm_email.activate, name="activate"),
    path('', views.chatgpt_login_testcase, name='chatgpt_login_testcase'),
    path('export-excel', views.write_test_case_to_excel, name='write_test_case_to_excel'),
    path('export-template', views.write_test_case_to_excel, name='write_template_to_excel'),
    path('get-chat-list/<int:history_id>', views.get_chat_list, name='get_chat_list'),
    path('get-history/', views.get_history, name='get_history'),
    path('delete-history/<int:history_id>/', views.delete_history, name='delete_history'),
    path('upload-template', upload.upload_file, name='upload_file'),
    path('generate-template', template.generate_template, name='generate_template'),
]
