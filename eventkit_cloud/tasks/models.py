# -*- coding: utf-8 -*-


import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils import timezone

from storages.backends.s3boto3 import S3Boto3Storage

from eventkit_cloud.core.helpers import (
    sendnotification,
    NotificationVerb,
    NotificationLevel,
)
from eventkit_cloud.core.models import (
    UIDMixin,
    TimeStampedModelMixin,
    TimeTrackingModelMixin,
    LowerCaseCharField,
)
from eventkit_cloud.jobs.models import (
    Job,
    DataProvider,
    JobPermissionLevel,
    JobPermission,
    RegionalPolicy,
)
from eventkit_cloud.tasks.enumerations import TaskStates
from eventkit_cloud.tasks import (
    DEFAULT_CACHE_EXPIRATION,
    get_cache_value,
    set_cache_value,
)
from notifications.models import Notification

from eventkit_cloud.utils.helpers import get_active_regional_justification

logger = logging.getLogger(__name__)


def get_all_users_by_permissions(permissions):
    return User.objects.filter(
        models.Q(groups__name=permissions["groups"]) | models.Q(username__in=permissions["members"])
    ).distinct()


def notification_delete(instance):
    for notification in Notification.objects.filter(actor_object_id=instance.id):
        ct = ContentType.objects.filter(pk=notification.actor_content_type_id).get()
        if ct == ContentType.objects.get_for_model(type(instance)):
            notification.delete()


def notification_soft_delete(instance):
    for notification in Notification.objects.filter(actor_object_id=instance.id):
        ct = ContentType.objects.filter(pk=notification.actor_content_type_id).get()
        if ct == ContentType.objects.get_for_model(type(instance)):
            notification.public = False
            notification.save()


class NotificationModelMixin(models.Model):
    def delete_notifications(self, *args, **kwargs):
        notification_delete(self)

    def soft_delete_notifications(self, *args, **kwargs):
        permissions = kwargs.get("permissions")
        if permissions:
            users = get_all_users_by_permissions(permissions)
            logger.error("users: {0}".format(users))
            for user in users:
                logger.error("Sending notification to {0}".format(user))
                sendnotification(
                    self,
                    user,
                    NotificationVerb.RUN_DELETED.value,
                    None,
                    None,
                    NotificationLevel.WARNING.value,
                    getattr(self, "status", "DELETED"),
                )

    class Meta:
        abstract = True


class FileProducingTaskResult(UIDMixin, NotificationModelMixin):
    """
    A FileProducingTaskResult holds the information from the task, i.e. the reason for executing the task.
    """

    filename = models.CharField(max_length=508, blank=True, editable=False)
    size = models.FloatField(null=True, editable=False)
    download_url = models.URLField(verbose_name="URL to export task result output.", max_length=508)
    deleted = models.BooleanField(default=False)

    def soft_delete(self, *args, **kwargs):
        from eventkit_cloud.tasks.signals import exporttaskresult_delete_exports

        exporttaskresult_delete_exports(self.__class__, self)
        self.deleted = True
        self.export_task.display = False
        self.save()

    def user_can_download(self, user: User):
        """
            Checks to see if the user has all of the required permissions to download the file.  To not make these
            requests slower ideally the downloadable will have already
            select_related("export_task__export_provider_task__provider", "export_task__export_provider_task__run")
            :param user: The user requesting the file.
            :param downloadable: The downloadable file.
            :return:
            """

        jobs = JobPermission.userjobs(user, JobPermissionLevel.READ.value)
        job = jobs.filter(runs__data_provider_task_records__tasks__result=self).first()
        providers = []

        if not job:
            return False

        # Check the associated RunZipFile for attribute classes.
        attribute_classes = []
        for run_zip_file in self.runzipfile_set.all():
            for data_provider_task_record in run_zip_file.data_provider_task_records.all():
                providers.append(data_provider_task_record.provider)
                if data_provider_task_record.provider.attribute_class:
                    attribute_classes.append(data_provider_task_record.provider.attribute_class)

        for attribute_class in attribute_classes:
            if attribute_class and not attribute_class.users.filter(id=user.id):
                return False

        # Get the providers associated with this download if it's not a zipfile.
        if self.export_task.export_provider_task.provider:
            providers.append(self.export_task.export_provider_task.provider)

        # Check to make sure the user has agreed to the regional policy if one exists.
        for policy in RegionalPolicy.objects.filter(
            region__the_geom__intersects=job.the_geom, providers__in=providers
        ).prefetch_related("justifications"):
            if not get_active_regional_justification(policy, user):
                return False

        return True

    class Meta:
        managed = True
        db_table = "export_task_results"

    def __str__(self):
        return "FileProducingTaskResult ({}), {}".format(self.uid, self.filename)


class ExportRun(UIDMixin, TimeStampedModelMixin, TimeTrackingModelMixin, NotificationModelMixin):
    """
    ExportRun is the main structure for storing export information.

    A Job provides information for the ExportRun.
    Many ExportRuns can map to a Job.
    Many DataProviderTasks can map to an ExportRun.
    Many ExportTasks can map to an DataProviderTaskRecord.
    """

    job = models.ForeignKey(Job, related_name="runs", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="runs", default=0, on_delete=models.CASCADE)
    worker = models.CharField(max_length=50, editable=False, default="", null=True)
    status = models.CharField(blank=True, max_length=20, db_index=True, default="")
    expiration = models.DateTimeField(default=timezone.now, editable=True)
    notified = models.DateTimeField(default=None, blank=True, null=True)
    deleted = models.BooleanField(default=False, db_index=True)
    delete_user = models.ForeignKey(User, null=True, blank=True, editable=False, on_delete=models.CASCADE)

    class Meta:
        managed = True
        db_table = "export_runs"
        verbose_name = "ExportRun (DataPack)"
        verbose_name_plural = "ExportRuns (DataPacks)"

    def __str__(self):
        return "{0}".format(str(self.uid))

    def soft_delete(self, user=None, *args, **kwargs):
        from eventkit_cloud.tasks.export_tasks import cancel_run
        from eventkit_cloud.tasks.signals import exportrun_delete_exports

        exportrun_delete_exports(self.__class__, self)
        username = None
        if user:
            self.delete_user = user
            username = user.username
        self.deleted = True
        logger.info("Deleting run {0} by user {1}".format(str(self.uid), user))
        cancel_run(export_run_uid=self.uid, canceling_username=username, delete=True)
        self.save()
        self.soft_delete_notifications(*args, **kwargs)


class ExportRunFile(UIDMixin, TimeStampedModelMixin):
    """
    The ExportRunFile stores additional files to be added to each ExportRun zip archive.
    """

    storage = None
    if settings.USE_S3:
        storage = S3Boto3Storage()
    else:
        storage = FileSystemStorage(location=settings.EXPORT_RUN_FILES, base_url=settings.EXPORT_RUN_FILES_DOWNLOAD)

    file = models.FileField(verbose_name="File", storage=storage)
    directory = models.CharField(
        max_length=100, null=True, blank=True, help_text="An optional directory name to store the file in."
    )
    provider = models.ForeignKey(
        DataProvider,
        on_delete=models.CASCADE,
        related_name="file_provider",
        null=True,
        blank=True,
        help_text="An optional data provider to associate the file with.",
    )

    def save(self, *args, **kwargs):
        if self.pk:
            export_run_file = ExportRunFile.objects.get(id=self.id)
            if export_run_file.file != self.file:
                export_run_file.file.delete(save=False)
        super(ExportRunFile, self).save(*args, **kwargs)


class DataProviderTaskRecord(UIDMixin, TimeStampedModelMixin, TimeTrackingModelMixin):
    """
    The DataProviderTaskRecord stores the task information for a specific provider.
    """

    from eventkit_cloud.jobs.models import MapImageSnapshot

    name = models.CharField(max_length=100, blank=True)
    slug = LowerCaseCharField(max_length=40, default="")
    provider = models.ForeignKey(
        DataProvider, on_delete=models.CASCADE, related_name="task_record_provider", null=True, blank=True
    )
    run = models.ForeignKey(ExportRun, related_name="data_provider_task_records", on_delete=models.CASCADE)
    status = models.CharField(blank=True, max_length=20, db_index=True)
    display = models.BooleanField(default=False)
    estimated_size = models.FloatField(null=True, blank=True)
    estimated_duration = models.FloatField(null=True, blank=True)
    preview = models.ForeignKey(
        MapImageSnapshot, blank=True, null=True, on_delete=models.SET_NULL, help_text="A preview for a provider task.",
    )

    class Meta:
        ordering = ["name"]
        managed = True
        db_table = "data_provider_task_records"

    def __str__(self):
        return "DataProviderTaskRecord uid: {0}".format(str(self.uid))


class UserDownload(UIDMixin):
    """
    Model that stores each DataPack download event.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="downloads")
    downloaded_at = models.DateTimeField(verbose_name="Time of Download", default=timezone.now, editable=False)
    downloadable = models.ForeignKey(FileProducingTaskResult, on_delete=models.CASCADE, related_name="downloads")

    class Meta:
        ordering = ["-downloaded_at"]

    @property
    def job(self):
        if self.downloadable.export_task:
            return self.downloadable.export_task.export_provider_task.run.job
        if self.downloadable.run:
            return self.downloadable.run.job

    @property
    def provider(self):
        # TODO: This is one of many reasons why DataProviderTaskRecord should maybe point to DataProvider
        if self.downloadable.export_task:
            return DataProvider.objects.filter(slug=self.downloadable.export_task.export_provider_task.slug).first()


class ExportTaskRecord(UIDMixin, TimeStampedModelMixin, TimeTrackingModelMixin):
    """
    An ExportTaskRecord holds the information about the process doing the actual work for a task.
    """

    celery_uid = models.UUIDField(null=True)  # celery task uid
    name = models.CharField(max_length=100)
    export_provider_task = models.ForeignKey(DataProviderTaskRecord, related_name="tasks", on_delete=models.CASCADE)
    status = models.CharField(blank=True, max_length=20, db_index=True)
    pid = models.IntegerField(blank=True, default=-1)
    worker = models.CharField(max_length=100, blank=True, editable=False, null=True)
    cancel_user = models.ForeignKey(User, null=True, blank=True, editable=False, on_delete=models.CASCADE)
    display = models.BooleanField(default=False)
    result = models.OneToOneField(
        "FileProducingTaskResult", on_delete=models.CASCADE, null=True, blank=True, related_name="export_task",
    )

    class Meta:
        ordering = ["created_at"]
        managed = True
        db_table = "export_task_records"

    def __str__(self):
        return "ExportTaskRecord uid: {0}".format(str(self.uid))

    @property
    def progress(self):
        if TaskStates[self.status] in TaskStates.get_finished_states():
            return 100
        return get_cache_value(obj=self, attribute="progress", default=0)

    @progress.setter
    def progress(self, value, expiration=DEFAULT_CACHE_EXPIRATION):
        return set_cache_value(obj=self, attribute="progress", value=value, expiration=expiration)

    @property
    def estimated_finish(self):
        if TaskStates[self.status] in TaskStates.get_finished_states():
            return
        return get_cache_value(obj=self, attribute="estimated_finish", default=0)

    @estimated_finish.setter
    def estimated_finish(self, value, expiration=DEFAULT_CACHE_EXPIRATION):
        return set_cache_value(obj=self, attribute="estimated_finish", value=value, expiration=expiration)


class ExportTaskException(TimeStampedModelMixin):
    """
    Model to store ExportTaskRecord exceptions for auditing.
    """

    id = models.AutoField(primary_key=True, editable=False)
    task = models.ForeignKey(ExportTaskRecord, related_name="exceptions", on_delete=models.CASCADE)
    exception = models.TextField(editable=False)

    class Meta:
        managed = True
        db_table = "export_task_exceptions"


def prefetch_export_runs(queryset_list_or_model):
    prefetch_args = [
        "job__data_provider_tasks__provider",
        "job__data_provider_tasks__formats",
        "data_provider_task_records__tasks__result",
        "data_provider_task_records__tasks__exceptions",
    ]
    if isinstance(queryset_list_or_model, models.query.QuerySet):
        return queryset_list_or_model.select_related("user").prefetch_related(*prefetch_args)
    elif isinstance(queryset_list_or_model, list):
        models.prefetch_related_objects(queryset_list_or_model, *prefetch_args)
    elif isinstance(queryset_list_or_model, ExportRun):
        models.prefetch_related_objects([queryset_list_or_model], *prefetch_args)
    return queryset_list_or_model


class RunZipFile(UIDMixin, TimeStampedModelMixin, TimeTrackingModelMixin):

    run = models.ForeignKey(ExportRun, on_delete=models.CASCADE, related_name="zip_files", null=True, blank=True)
    data_provider_task_records = models.ManyToManyField(DataProviderTaskRecord)
    downloadable_file = models.ForeignKey(FileProducingTaskResult, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"RunZipFile uid: {self.uid}"

    @property
    def message(self):
        return get_cache_value(obj=self, attribute="message", default="")

    @message.setter
    def message(self, value, expiration=DEFAULT_CACHE_EXPIRATION):
        return set_cache_value(obj=self, attribute="message", value=value, expiration=expiration)

    @property
    def status(self):
        return get_cache_value(obj=self, attribute="status", default="")

    @status.setter
    def status(self, value, expiration=DEFAULT_CACHE_EXPIRATION):
        return set_cache_value(obj=self, attribute="status", value=value, expiration=expiration)
