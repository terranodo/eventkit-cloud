# -*- coding: utf-8 -*-

from eventkit_cloud.settings.base import *  # NOQA
from eventkit_cloud.settings.base import INSTALLED_APPS
from eventkit_cloud.settings.base import is_true


# Extra installed apps
INSTALLED_APPS += (
    # any 3rd party apps
    "rest_framework",
    "rest_framework_gis",
    "rest_framework.authtoken",
    # 'social.apps.django_app.default'
)

# 3rd party specific app settings


REST_FRAMEWORK = {
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "eventkit_cloud.api.renderers.HOTExportApiRenderer",
    ),
    "EXCEPTION_HANDLER": "eventkit_cloud.api.utils.eventkit_exception_handler",
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.AcceptHeaderVersioning",
    "DEFAULT_VERSION": "1.0",
}
