from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.utils import timezone


class Command(BaseCommand):
    help = "Create user if it does not exist"

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for the default user', default='test1')
        parser.add_argument('--email', type=str, help='Email for the default user', default='test@gmail.com')
        parser.add_argument('--password', type=str, help='Password for the default user', default='Test@1234')
        parser.add_argument('--is-staff', action='store_true', help='Grant staff status', default=False)
        parser.add_argument('--is-superuser', action='store_true', help='Grant superuser status', default=False)

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        is_staff = options['is_staff']
        is_superuser = options['is_superuser']

        # Check if user already exists
        if User.objects.filter(email=email).exists() or User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} or username {username} already exists.'))
            return

        # Create user
        try:
            User.objects.create(
                username=username,
                email=email,
                password=make_password(password),
                is_active=True,
                is_staff=is_staff,
                is_superuser=is_superuser,
                date_joined=timezone.now()
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created user: {email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating user: {str(e)}'))
