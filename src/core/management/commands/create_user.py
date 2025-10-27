from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.utils import timezone


class Command(BaseCommand):
    help = "create default users for testing"

    def handle(self, *args, **options):
        users_to_create = [
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "Admin@123",
                "is_staff": True,
                "is_superuser": True
            },
            {
                "username": "testuser",
                "email": "testuser@example.com",
                "password": "Test@1234",
                "is_staff": False,
                "is_superuser": False
            }
        ]

        for user_data in users_to_create:
            username = user_data["username"]
            email = user_data["email"]

            if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User "{username}" đã tồn tại, bỏ qua.'))
                continue

            try:
                if user_data["is_superuser"]:
                    # Tạo admin
                    User.objects.create_superuser(
                        username=username,
                        email=email,
                        password=user_data["password"]
                    )
                    self.stdout.write(self.style.SUCCESS(f'Đã tạo admin: {username}'))
                else:
                    # Tạo user 
                    User.objects.create(
                        username=username,
                        email=email,
                        password=make_password(user_data["password"]),
                        is_active=True,
                        is_staff=user_data["is_staff"],
                        is_superuser=user_data["is_superuser"],
                        date_joined=timezone.now()
                    )
                    self.stdout.write(self.style.SUCCESS(f'Đã tạo user thường: {username}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Lỗi khi tạo {username}: {str(e)}'))
