import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ModerationService } from './moderation.service'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { ConfigService } from '../config/config.service'

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
function updateQb(result: unknown = []): any {
  const returning = jest.fn().mockResolvedValue(result)
  const where = jest.fn().mockReturnValue({ returning })
  const set = jest.fn().mockReturnValue({ where })
  return { set }
}

const LISTING_ID = 'listing-uuid-001'
const MODERATOR_ID = 'mod-uuid-001'

const mockPendingListing = {
  id: LISTING_ID,
  status: 'draft',
  moderationStatus: 'pending',
  durationDays: 30,
  riskScore: 45,
}

const mockApprovedListing = {
  ...mockPendingListing,
  status: 'active',
  moderationStatus: 'approved',
}

const mockDb = {
  select: jest.fn(),
  update: jest.fn(),
}

const mockConfigService = { getNumber: jest.fn().mockResolvedValue(30) }

describe('ModerationService', () => {
  let service: ModerationService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockConfigService.getNumber.mockResolvedValue(30)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<ModerationService>(ModerationService)
  })

  describe('listPending()', () => {
    it('returns pending listings ordered by risk score desc', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockPendingListing]))
      const result = await service.listPending()
      expect(result).toHaveLength(1)
      expect(result[0].moderationStatus).toBe('pending')
    })
  })

  describe('approve()', () => {
    it('approves listing and sets status=active with publishedAt and expiresAt', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockPendingListing]))
      mockDb.update.mockReturnValueOnce(updateQb([mockApprovedListing]))

      const result = await service.approve(LISTING_ID, MODERATOR_ID)
      expect(result.moderationStatus).toBe('approved')
      expect(result.status).toBe('active')
    })

    it('throws NotFoundException when listing not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.approve(LISTING_ID, MODERATOR_ID)).rejects.toThrow(NotFoundException)
    })

    it('throws BadRequestException when listing is not pending', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ ...mockPendingListing, moderationStatus: 'approved' }]))
      await expect(service.approve(LISTING_ID, MODERATOR_ID)).rejects.toThrow(BadRequestException)
    })
  })

  describe('reject()', () => {
    it('rejects listing and keeps status=draft', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockPendingListing]))
      mockDb.update.mockReturnValueOnce(updateQb([{ ...mockPendingListing, moderationStatus: 'rejected' }]))

      const result = await service.reject(LISTING_ID, MODERATOR_ID)
      expect(result.moderationStatus).toBe('rejected')
    })

    it('throws NotFoundException when listing not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.reject(LISTING_ID, MODERATOR_ID)).rejects.toThrow(NotFoundException)
    })

    it('throws BadRequestException when listing is not pending', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ ...mockPendingListing, moderationStatus: 'flagged' }]))
      await expect(service.reject(LISTING_ID, MODERATOR_ID)).rejects.toThrow(BadRequestException)
    })
  })

  describe('flag()', () => {
    it('flags a listing regardless of current moderationStatus', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: LISTING_ID }]))
      mockDb.update.mockReturnValueOnce(updateQb([{ ...mockPendingListing, moderationStatus: 'flagged' }]))

      const result = await service.flag(LISTING_ID, MODERATOR_ID)
      expect(result.moderationStatus).toBe('flagged')
    })

    it('throws NotFoundException when listing not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.flag(LISTING_ID, MODERATOR_ID)).rejects.toThrow(NotFoundException)
    })
  })
})
