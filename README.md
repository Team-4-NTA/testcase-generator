# CREATE TESTCASE AI

Dự án tự động tạo test case bằng AI. Mục tiêu là hỗ trợ lập trình viên và QA nhanh chóng sinh ra bộ test case phù hợp với yêu cầu đầu vào.

## Clone Project

- HTTP: `https://github.com/Team-4-NTA/testcase-generator.git`

- SSH: `git@github.com:Team-4-NTA/testcase-generator.git`

## Yêu cầu hệ thống

- Docker & Docker Compose

## Project Setup

```sh
cd testcase-generator
docker-compose build --no-cache
docker-compose up -d
docker exec -it django_app /bin/bash
python manage.py migrate
```
