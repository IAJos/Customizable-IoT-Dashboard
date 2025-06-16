"""
WSGI config for Customizable_iot_dashboard project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

settings_module = 'Customizable_iot_dashboard.production' if 'WEBSITE_HOSTNAME' in os.environ else 'Customizable_iot_dashboard.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Customizable_iot_dashboard.settings')

application = get_wsgi_application()
