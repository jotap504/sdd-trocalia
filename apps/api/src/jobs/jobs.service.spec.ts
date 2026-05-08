import { Test, TestingModule } from '@nestjs/testing'
import { JobsService } from './jobs.service'
import { SEARCH_QUEUE_TOKEN, NOTIFICATION_QUEUE_TOKEN } from './jobs.constants'
import type { ListingDocument } from '../search/search.service'

const mockSearchQueue = { add: jest.fn() }
const mockNotificationQueue = { add: jest.fn() }

const baseListing: ListingDocument = {
  id: 'listing-001',
  title: 'iPhone 13 Pro',
  description: 'Excelente estado',
  price: 150000,
  currency: 'ARS',
  condition: 'used',
  type: 'standard',
  status: 'active',
  moderationStatus: 'approved',
  categoryId: 'cat-001',
  createdAt: '2026-01-15T00:00:00Z',
}

describe('JobsService', () => {
  let service: JobsService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockSearchQueue.add.mockResolvedValue({ id: 'job-001' })
    mockNotificationQueue.add.mockResolvedValue({ id: 'job-002' })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: SEARCH_QUEUE_TOKEN, useValue: mockSearchQueue },
        { provide: NOTIFICATION_QUEUE_TOKEN, useValue: mockNotificationQueue },
      ],
    }).compile()

    service = module.get<JobsService>(JobsService)
  })

  describe('enqueueSearchIndex()', () => {
    it('adds index job to search queue with listing data', async () => {
      await service.enqueueSearchIndex(baseListing)
      expect(mockSearchQueue.add).toHaveBeenCalledWith(
        'index',
        { type: 'index', listing: baseListing },
      )
    })
  })

  describe('enqueueSearchDelete()', () => {
    it('adds delete job to search queue with listingId', async () => {
      await service.enqueueSearchDelete('listing-001')
      expect(mockSearchQueue.add).toHaveBeenCalledWith(
        'delete',
        { type: 'delete', listingId: 'listing-001' },
      )
    })
  })

  describe('enqueueNotification()', () => {
    it('adds notification job to notification queue', async () => {
      const params = {
        userId: 'user-001',
        channel: 'push' as const,
        type: 'new_review',
        title: 'Nueva reseña',
        body: 'Recibiste una reseña de 5 estrellas',
      }
      await service.enqueueNotification(params)
      expect(mockNotificationQueue.add).toHaveBeenCalledWith('send', { params })
    })
  })
})

// ────────────────────────────────────────────
// Processor unit tests (no Queue/Worker needed)
// ────────────────────────────────────────────

import { processSearchIndex } from './processors/search-index.processor'
import { processNotification } from './processors/notification.processor'
import { processListingExpiry } from './processors/listing-expiry.processor'
import type { Job } from 'bullmq'

function makeJob<T>(data: T): Job<T> {
  return { data } as Job<T>
}

describe('processSearchIndex()', () => {
  it('calls indexListing for type=index', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchService = { indexListing: jest.fn().mockResolvedValue(undefined) } as any
    await processSearchIndex(
      makeJob({ type: 'index' as const, listing: baseListing }),
      searchService,
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(searchService.indexListing).toHaveBeenCalledWith(baseListing)
  })

  it('calls deleteListing for type=delete', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchService = { deleteListing: jest.fn().mockResolvedValue(undefined) } as any
    await processSearchIndex(
      makeJob({ type: 'delete' as const, listingId: 'listing-001' }),
      searchService,
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(searchService.deleteListing).toHaveBeenCalledWith('listing-001')
  })
})

describe('processNotification()', () => {
  it('calls notificationsService.send with job params', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notificationsService = { send: jest.fn().mockResolvedValue(undefined) } as any
    const params = {
      userId: 'user-001',
      channel: 'in_app' as const,
      type: 'new_review',
      title: 'Nueva reseña',
      body: 'Descripción',
    }
    await processNotification(makeJob({ params }), notificationsService)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(notificationsService.send).toHaveBeenCalledWith(params)
  })
})

describe('processListingExpiry()', () => {
  it('updates expired listings and returns count', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 'l1' }, { id: 'l2' }])
    const where = jest.fn().mockReturnValue({ returning })
    const set = jest.fn().mockReturnValue({ where })
    const update = jest.fn().mockReturnValue({ set })
    const mockDb = { update } as never

    const result = await processListingExpiry(makeJob({}), mockDb)
    expect(result.expired).toBe(2)
    expect(update).toHaveBeenCalled()
  })
})
