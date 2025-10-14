"""
Testing settings for testcase_generator project.
"""

from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'test-secret-key-for-testing-only'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1', 'generation.nitrotech.asia']

# Database for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Password hashers for testing (faster)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Email backend for testing
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Cache configuration for testing
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake-test',
    }
}

# Disable migrations for testing
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Media files for testing
MEDIA_ROOT = '/tmp/test_media'

# Static files for testing
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Logging for testing
LOGGING['loggers']['django']['level'] = 'WARNING'
LOGGING['loggers']['chatbot']['level'] = 'WARNING'

# Disable OpenAI API calls during testing
OPENAI_API_KEY = 'test-api-key'
DEFAULT_AI_MODEL = 'test-model'
FALLBACK_AI_MODEL = 'test-fallback-model'

# Test-specific settings
TEST_RUNNER = 'django.test.runner.DiscoverRunner'
