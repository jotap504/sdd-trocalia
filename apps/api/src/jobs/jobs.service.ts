import { Injectable, Inject } from '@nestjs/common'
import type { Queue } from 'bullmq'
import {
  SEARCH_QUEUE_TOKEN, NOTIFICATION_QUEUE_TOKEN,
} from './jobs.constants'
import type { SearchIndexJobData } from './processors/search-index.processor'
import type { NotificationJobData } from './processors/notification.processor'
import type { ListingDocument } from '../search/search.service'
import type { SendNotificationParams } from '../notifications/notifications.service'

@Injectable()
export class JobsService {
  constructor(
    @Inject(SEARCH_QUEUE_TOKEN) private readonly searchQueue: Queue<SearchIndexJobData>,
    @Inject(NOTIFICATION_QUEUE_TOKEN) private readonly notificationQueue: Queue<NotificationJobData>,
  ) {}

  async enqueueSearchIndex(listing: ListingDocument): Promise<void> {
    await this.searchQueue.add('index', { type: 'index', listing })
  }

  async enqueueSearchDelete(listingId: string): Promise<void> {
    await this.searchQueue.add('delete', { type: 'delete', listingId })
  }

  async enqueueNotification(params: SendNotificationParams): Promise<void> {
    await this.notificationQueue.add('send', { params })
  }
}
