import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { ReviewDirection } from './dto/create-review.dto'
import { encodeCursor } from '../common/utils/cursor.util'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function qb(result: unknown): any {
  const chain: any = {}
  ;['from', 'where', 'limit', 'orderBy', 'returning'].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
  chain.catch = () => Promise.resolve(result)
  return chain
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function insertQb(result: unknown = []): any {
  const onConflictDoUpdate = jest.fn().mockResolvedValue(undefined)
  const returning = jest.fn().mockResolvedValue(result)
  const values = jest.fn().mockReturnValue({ returning, onConflictDoUpdate })
  return { values }
}

const REVIEWER_ID = 'user-uuid-reviewer'
const REVIEWED_ID = 'user-uuid-reviewed'
const LISTING_ID = 'listing-uuid-001'
const REVIEW_ID = 'review-uuid-001'

const mockReview = {
  id: REVIEW_ID,
  listingId: LISTING_ID,
  reviewerId: REVIEWER_ID,
  reviewedId: REVIEWED_ID,
  direction: ReviewDirection.BUYER_TO_SELLER,
  overallRating: 5,
  comment: 'Excelente vendedor',
  isPublic: true,
  createdAt: new Date('2026-01-15T00:00:00Z'),
}

const mockReputation = {
  userId: REVIEWED_ID,
  asSellerAvg: '4.50',
  asSellerCount: 10,
  asBuyerAvg: '0',
  asBuyerCount: 0,
  updatedAt: new Date(),
}

const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  transaction: jest.fn(),
}

describe('ReviewsService', () => {
  let service: ReviewsService

  beforeEach(async () => {
    jest.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
      ],
    }).compile()

    service = module.get<ReviewsService>(ReviewsService)
  })

  describe('create()', () => {
    const dto = {
      listingId: LISTING_ID,
      reviewedId: REVIEWED_ID,
      direction: ReviewDirection.BUYER_TO_SELLER,
      overallRating: 5,
      comment: 'Excelente vendedor',
    }

    it('creates review and updates reputation atomically', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: LISTING_ID }]))
      mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
        const tx = {
          insert: jest.fn()
            .mockReturnValueOnce(insertQb([mockReview]))          // reviews insert
            .mockReturnValueOnce(insertQb()),                      // reputationScores upsert
        }
        return cb(tx)
      })

      const result = await service.create(REVIEWER_ID, dto)
      expect(result.id).toBe(REVIEW_ID)
      expect(result.overallRating).toBe(5)
    })

    it('throws BadRequestException when reviewer tries to review themselves', async () => {
      await expect(
        service.create(REVIEWED_ID, { ...dto, reviewedId: REVIEWED_ID }),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws NotFoundException when listing does not exist', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.create(REVIEWER_ID, dto)).rejects.toThrow(NotFoundException)
    })

    it('throws ConflictException on duplicate review (unique constraint violation)', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: LISTING_ID }]))
      mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
        const tx = {
          insert: jest.fn().mockReturnValueOnce({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockRejectedValue({ code: '23505' }),
              onConflictDoUpdate: jest.fn(),
            }),
          }),
        }
        return cb(tx)
      })

      await expect(service.create(REVIEWER_ID, dto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findByUser()', () => {
    it('returns paginated reviews for a user', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockReview]))
      const result = await service.findByUser(REVIEWED_ID)
      expect(result.data).toHaveLength(1)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeNull()
    })

    it('returns hasMore=true and cursor when more results exist', async () => {
      const rows = Array.from({ length: 21 }, (_, i) => ({
        ...mockReview,
        id: `review-${i}`,
        createdAt: new Date(`2026-01-${String(21 - i).padStart(2, '0')}T00:00:00Z`),
      }))
      mockDb.select.mockReturnValueOnce(qb(rows))
      const result = await service.findByUser(REVIEWED_ID, undefined, 20)
      expect(result.data).toHaveLength(20)
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).not.toBeNull()
    })

    it('applies cursor when provided', async () => {
      const cursor = encodeCursor({ createdAt: new Date('2026-01-10T00:00:00Z'), id: 'x' })
      mockDb.select.mockReturnValueOnce(qb([mockReview]))
      const result = await service.findByUser(REVIEWED_ID, cursor)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('getReputation()', () => {
    it('returns existing reputation score for a user', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockReputation]))
      const result = await service.getReputation(REVIEWED_ID)
      expect(result.userId).toBe(REVIEWED_ID)
      expect(result.asSellerAvg).toBe('4.50')
    })

    it('returns zeroed defaults when no reputation record exists', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      const result = await service.getReputation(REVIEWED_ID)
      expect(result.userId).toBe(REVIEWED_ID)
      expect(result.asSellerCount).toBe(0)
      expect(result.asBuyerCount).toBe(0)
    })
  })
})
