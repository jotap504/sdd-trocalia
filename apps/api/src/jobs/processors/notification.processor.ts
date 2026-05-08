import type { Job } from 'bullmq'
import type { NotificationsService, SendNotificationParams } from '../../notifications/notifications.service'

export interface NotificationJobData {
  params: SendNotificationParams
}

export async function processNotification(
  job: Job<NotificationJobData>,
  notificationsService: NotificationsService,
): Promise<void> {
  await notificationsService.send(job.data.params)
}
