import {
  Module, OnModuleInit, OnModuleDestroy, Inject, Logger,
} from '@nestjs/common'
import { Queue, Worker } from 'bullmq'
import type Redis from 'ioredis'
import { REDIS_TOKEN } from '../redis/redis.module'
import { SearchService } from '../search/search.service'
import { NotificationsService } from '../notifications/notifications.service'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { SearchModule } from '../search/search.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { JobsService } from './jobs.service'
import {
  SEARCH_QUEUE, NOTIFICATION_QUEUE, LISTING_EXPIRY_QUEUE,
  SEARCH_QUEUE_TOKEN, NOTIFICATION_QUEUE_TOKEN, LISTING_EXPIRY_QUEUE_TOKEN,
} from './jobs.constants'
import { processSearchIndex } from './processors/search-index.processor'
import { processNotification } from './processors/notification.processor'
import { processListingExpiry } from './processors/listing-expiry.processor'

@Module({
  imports: [SearchModule, NotificationsModule],
  providers: [
    JobsService,
    {
      provide: SEARCH_QUEUE_TOKEN,
      inject: [REDIS_TOKEN],
      useFactory: (redis: Redis) =>
        new Queue(SEARCH_QUEUE, { connection: redis }),
    },
    {
      provide: NOTIFICATION_QUEUE_TOKEN,
      inject: [REDIS_TOKEN],
      useFactory: (redis: Redis) =>
        new Queue(NOTIFICATION_QUEUE, { connection: redis }),
    },
    {
      provide: LISTING_EXPIRY_QUEUE_TOKEN,
      inject: [REDIS_TOKEN],
      useFactory: (redis: Redis) =>
        new Queue(LISTING_EXPIRY_QUEUE, { connection: redis }),
    },
  ],
  exports: [JobsService],
})
export class JobsModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsModule.name)
  private workers: Worker[] = []

  constructor(
    @Inject(REDIS_TOKEN) private readonly redis: Redis,
    @Inject(DRIZZLE_TOKEN) private readonly db: unknown,
    @Inject(SEARCH_QUEUE_TOKEN) private readonly searchQueue: Queue,
    @Inject(LISTING_EXPIRY_QUEUE_TOKEN) private readonly expiryQueue: Queue,
    private readonly searchService: SearchService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const connection = this.redis

    this.workers = [
      new Worker(
        SEARCH_QUEUE,
        (job) => processSearchIndex(job, this.searchService),
        { connection, concurrency: 5 },
      ),
      new Worker(
        NOTIFICATION_QUEUE,
        (job) => processNotification(job, this.notificationsService),
        { connection, concurrency: 3 },
      ),
      new Worker(
        LISTING_EXPIRY_QUEUE,
        (job) => processListingExpiry(job, this.db as Parameters<typeof processListingExpiry>[1]),
        { connection, concurrency: 1 },
      ),
    ]

    this.workers.forEach((w) => {
      w.on('failed', (job, err) => {
        this.logger.error(`Job failed [${job?.name}]`, err)
      })
    })

    await this.expiryQueue.add(
      'expire-listings',
      {},
      { repeat: { pattern: '0 2 * * *' }, jobId: 'listing-expiry-daily' },
    )

    this.logger.log('BullMQ workers started')
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.close()))
    await this.searchQueue.close()
    await this.expiryQueue.close()
  }
}
