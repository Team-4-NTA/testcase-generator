# create_testcase_ai
project tạo tự động test case

1. git clone https://github.com/CaoHien2k/create_testcase_ai.git

2. pip install django
   
4. cd myproject/
   
5. python manage.py runserver 8888

6. pip install mysql-connector-python

7. python manage.py makemigrations

8. python manage.py migrate

9. pip install python-dotenv

//build lại docker
10. docker build -t my-django-  app .

//check version pylint đã có chưa
11. docker run --rm my-django-app pylint --version

//check lỗi code trong file
12. pylint <tên_file>
 