import logging

from django.conf import settings
from django.contrib.auth.models import Group, User
from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch.dispatcher import receiver

from eventkit_cloud.core.models import JobPermission, JobPermissionLevel
from eventkit_cloud.jobs.models import Job, DataProvider, MapImageSnapshot
from eventkit_cloud.jobs.helpers import get_provider_image_dir, get_provider_thumbnail_name
from eventkit_cloud.utils.image_snapshot import make_thumbnail_downloadable, save_thumbnail

from eventkit_cloud.tasks.export_tasks import make_dirs

from eventkit_cloud.utils.s3 import delete_from_s3

import os

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """
    This method is executed whenever a User object is created.

    Adds the new user to DefaultExportExtentGroup.
    """
    if created:
        instance.groups.add(Group.objects.get(name='DefaultExportExtentGroup'))


@receiver(post_save, sender=Job)
def job_post_save(sender, instance, created, **kwargs):
    """
    This method is executed whenever a Job  object is created.

    If created is true, assign the user as an ADMIN for this job
    """

    if created:
        jp = JobPermission.objects.create(job=instance, content_object=instance.user,
                                          permission=JobPermissionLevel.ADMIN.value)
        jp.save()


@receiver(pre_delete, sender=MapImageSnapshot)
def mapimagesnapshot_delete(sender, instance, *args, **kwargs):
    """
    Delete associated file when deleting a MapImageSnapshot.
    """
    if getattr(settings, 'USE_S3', False):
        delete_from_s3(download_url=instance.download_url)
    url_parts = instance.download_url.split('/')
    full_file_download_path = '/'.join([settings.IMAGES_ROOT.rstrip('/'), url_parts[-2], url_parts[-1]])
    try:
        os.remove(full_file_download_path)
        logger.info("The file {0} was deleted.".format(full_file_download_path))
    except OSError:
        logger.warn("The file {0} was already removed or does not exist.".format(full_file_download_path))


@receiver(pre_save, sender=DataProvider)
def provider_pre_save(sender, instance, **kwargs):
    """
    This method is executed whenever a DataProvider is created or updated.
    """
    if instance.preview_url:
        if instance.thumbnail:
            thumb = instance.thumbnail
            instance.thumbnail = None
            thumb.delete()
        try:
            # First check to see if this DataProvider should update the thumbnail
            # This should only be needed if it is a new entry, or the preview_url has changed,
            is_thumbnail_fresh = True
            try:
                provider = sender.objects.get(uid=instance.uid)
            except sender.DoesNotExist:
                is_thumbnail_fresh = False
            else:
                # The last preview url doesn't match the current or we still don't have a thumbnail.
                if instance.preview_url != provider.preview_url or instance.thumbnail is None:
                    is_thumbnail_fresh = False

            if not is_thumbnail_fresh:
                provider_image_dir = get_provider_image_dir(instance.uid)
                make_dirs(provider_image_dir)
                # Return a file system path to the image.
                filepath = save_thumbnail(instance.preview_url,
                                          os.path.join(provider_image_dir, get_provider_thumbnail_name(instance.slug)))
                # Return a MapImageSnapshot representing the thumbnail
                thumbnail_snapshot = make_thumbnail_downloadable(filepath, instance.uid)
                instance.thumbnail = thumbnail_snapshot
        except Exception as e:
            # Catch exceptions broadly and log them, we do not want to prevent saving provider's if
            # a thumbnail creation error occurs.
            logger.error(f'Could not save thumbnail for DataProvider: {instance.slug}')
            logger.exception(e)
