"""
Django settings for testcase_generator project.

This file imports the appropriate settings based on the environment.
"""

import os

# Determine which settings to use based on environment
environment = os.getenv('DJANGO_SETTINGS_MODULE', 'testcase_generator.settings.development')

if environment == 'testcase_generator.settings.development':
    from .settings.development import *
elif environment == 'testcase_generator.settings.production':
    from .settings.production import *
elif environment == 'testcase_generator.settings.testing':
    from .settings.testing import *
else:
    # Default to development
    from .settings.development import *
