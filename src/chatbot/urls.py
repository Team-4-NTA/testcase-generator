""" 
Module xử lý urls.
"""

from django.urls import path
from . import views, upload, template, auth

urlpatterns = [
    path('login', auth.login, name='generate_template'),
    path('', views.chatgpt_login_testcase, name='chatgpt_login_testcase'),
    path('export-excel', views.write_test_case_to_excel, name='write_test_case_to_excel'),
    path('export-template', views.write_test_case_to_excel, name='write_template_to_excel'),
    path('get-chat-list/<int:history_id>', views.get_chat_list, name='get_chat_list'),
    path('get-history/', views.get_history, name='get_history'),
    path('save-history/', views.save_history, name='save_history'),
    path('delete-history/<int:history_id>/', views.delete_history, name='delete_history'),
    path('upload-template', upload.upload_file, name='upload_file'),
    path('generate-template', template.generate_template, name='generate_template'),
]
