import os

from audit_logging.celery_support import UserDetailsBase
from celery.utils.log import get_task_logger

# Get an instance of a logger
logger = get_task_logger(__name__)


class EventKitBaseTask(UserDetailsBase):
    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        # This will only run in the PCF environment to shut down unused workers.
        PCF_SCALING = os.getenv("PCF_SCALING", False)
        if PCF_SCALING:
            from eventkit_cloud.tasks.util_tasks import pcf_shutdown_celery_workers

            queue_type, hostname = self.request.hostname.split("@")

            # In our current setup the queue name always mirrors the routing_key, if this changes this logic will break.
            queue_name = self.request.delivery_info["routing_key"]
            logger.info(f"{self} has completed, sending pcf_shutdown_celery_workers task.")
            pcf_shutdown_celery_workers.s(queue_name, queue_type, hostname).apply_async(queue="scale")
