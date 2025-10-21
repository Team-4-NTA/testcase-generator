from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q

class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            # Tìm user bằng email
            user = User.objects.get(Q(email__iexact=email))
            # Kiểm tra mật khẩu
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            # Nếu có nhiều user với cùng email (hiếm gặp), lấy user đầu tiên
            user = User.objects.filter(Q(email__iexact=email)).first()
            if user and user.check_password(password):
                return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None