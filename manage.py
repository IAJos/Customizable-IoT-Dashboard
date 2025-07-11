#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    settings_module = 'Customizable_iot_dashboard.production' if 'WEBSITE_HOSTNAME' in os.environ else 'Customizable_iot_dashboard.settings'
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
    # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Customizable_iot_dashboard.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
