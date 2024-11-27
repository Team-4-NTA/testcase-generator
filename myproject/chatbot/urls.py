from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.chatgpt_login_testcase, name='chatgpt_login_testcase'),
    path('export-excel', views.write_test_case_to_excel, name='write_test_case_to_excel'),
    path('get-chat-list/<int:history_id>', views.get_chat_list, name='get_chat_list'),
    path('get-history/', views.get_history, name='get_history'),
    path('save-history/', views.save_history, name='save_history'),
]