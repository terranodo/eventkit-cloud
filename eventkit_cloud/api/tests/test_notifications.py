# -*- coding: utf-8 -*-
from __future__ import absolute_import
import json
import os
import uuid
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

# from django.test import TestCase as APITestCase

from django.contrib.auth.models import Group, User
from django.contrib.gis.geos import GEOSGeometry, GeometryCollection, Polygon, Point, LineString
from ...jobs.models import ExportFormat, Job, DataProvider, \
    DataProviderType, DataProviderTask, bbox_to_geojson, DatamodelPreset, License
from ...tasks.models import ExportRun, ExportTaskRecord, DataProviderTaskRecord
from ...tasks.export_tasks import TaskStates
from ...core.models import GroupPermission
from notifications.models import Notification
from ...core.helpers import sendnotification, NotificationVerb


class TestNotifications(APITestCase):
    fixtures = ('insert_provider_types.json', 'osm_provider.json', 'datamodel_presets.json',)

    def __init__(self, *args, **kwargs):
        super(TestNotifications, self).__init__(*args, **kwargs)

    def setUp(self, ):
        self.path = os.path.dirname(os.path.realpath(__file__))
        self.group, created = Group.objects.get_or_create(name='TestDefaultExportExtentGroup')
        self.user1 = User.objects.create_user(username='user_1', email='demo@demo.com', password='demo')
        self.user2 = User.objects.create_user(username='user_2', email='demo@demo.com', password='demo')
        token = Token.objects.create(user=self.user1)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key,
                                HTTP_ACCEPT='application/json; version=1.0',
                                HTTP_ACCEPT_LANGUAGE='en',
                                HTTP_HOST='testserver')


    def test_send(self, ):
        memo = "Note to myself"
        level = "info"
        verb = NotificationVerb.REMOVED_FROM_GROUP.value

        sendnotification(self.user1, self.user1, verb, None, None, level, memo)
        url = '/api/notifications/all'
        response = self.client.get(url, content_type='application/json; version=1.0')
        self.assertEquals(status.HTTP_200_OK, response.status_code)
        self.assertEquals(len(response.data),1)
        self.assertEquals(response.data[0]["description"],memo)
        self.assertEquals(response.data[0]["level"],level)
        self.assertEquals(response.data[0]["verb"],verb)



