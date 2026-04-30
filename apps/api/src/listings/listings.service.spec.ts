import { Test, TestingModule } from '@nestjs/testing'
import {
  NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common'
import { ListingsService } from './listings.service'
import { ListingType, ListingCondition, Currency } from './dto/create-listing.dto'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { ConfigService } from '../config/config.service'
import { WalletService } from '../wallet/wallet.service'
import { encodeCursor } from '../common/utils/cursor.util'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function qb(result: unknown): any {
  const chain: any = {}
  ;['from', 'where', 'limit', 'orderBy', 'leftJoin'].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain)
  })
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
  chain.catch = () => Promise.resolve(result)
  return chain
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateQb(): any {
  const returning = jest.fn().mockResolvedValue([])
  const where = jest.fn().mockReturnValue({ returning })
  const set = jest.fn().mockReturnValue({ where })
  return { set }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function insertQb(result: unknown = undefined): any {
  const returning = jest.fn().mockResolvedValue(result ?? [])
  const values = jest.fn().mockReturnValue({ returning })
  return { values }
}

const USER_ID = 'user-uuid-001'
const LISTING_ID = 'listing-uuid-001'

const mockListing = {
  id: LISTING_ID,
  userId: USER_ID,
  categoryId: 'cat-1',
  type: 'standard',
  status: 'active',
  isCollectible: false,
  title: 'iPhone 12 Pro',
  description: 'Excelente estado, casi sin uso, con caja original',
  price: '150000',
  currency: 'ARS',
  priceNegotiable: false,
  condition: 'used',
  moderationStatus: 'approved',
  riskScore: 0,
  creditsSpent: 2,
  wasFreeQuota: false,
  viewsCount: 0,
  contactsCount: 0,
  durationDays: 30,
  location: null,
  locationText: 'CABA',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  countryCode: 'AR',
  paymentMethods: [],
  shippingOptions: [],
  shippingDescription: null,
  collectibleAttributes: null,
  aiGenerated: false,
  publishedAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 86400_000),
  soldAt: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date(),
}

const createDto = {
  categoryId: 'cat-1',
  type: ListingType.STANDARD,
  title: 'iPhone 12 Pro',
  description: 'Excelente estado, casi sin uso, con caja original',
  price: 150000,
  currency: Currency.ARS,
  priceNegotiable: false,
  condition: ListingCondition.USED,
  city: 'Buenos Aires',
  province: 'Buenos Aires',
}

const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
}

const mockConfigService = {
  getNumber: jest.fn().mockResolvedValue(30),
}

const mockWalletService = {
  getFreeQuota: jest.fn().mockResolvedValue({ quota: 5, used: 0, remaining: 5 }),
  consumeFreeQuota: jest.fn().mockResolvedValue(undefined),
  debit: jest.fn().mockResolvedValue({ id: 'txn-1', amount: -2, balanceAfter: 8 }),
}

describe('ListingsService', () => {
  let service: ListingsService

  beforeEach(async () => {
    jest.resetAllMocks()
    mockConfigService.getNumber.mockResolvedValue(30)
    mockWalletService.getFreeQuota.mockResolvedValue({ quota: 5, used: 0, remaining: 5 })
    mockWalletService.consumeFreeQuota.mockResolvedValue(undefined)
    mockWalletService.debit.mockResolvedValue({ id: 'txn-1', amount: -2, balanceAfter: 8 })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile()

    service = module.get<ListingsService>(ListingsService)
  })

  describe('create()', () => {
    it('creates listing using free quota when available', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: 'cat-1', isCollectible: false }]))
      mockDb.insert.mockReturnValueOnce(insertQb([mockListing]))

      const result = await service.create(USER_ID, createDto)
      expect(result.title).toBe('iPhone 12 Pro')
      expect(mockWalletService.consumeFreeQuota).toHaveBeenCalledWith(USER_ID)
      expect(mockWalletService.debit).not.toHaveBeenCalled()
    })

    it('debits tokens when free quota exhausted', async () => {
      mockWalletService.getFreeQuota.mockResolvedValueOnce({ quota: 5, used: 5, remaining: 0 })
      // chargePublication calls getNumber(costKey) first, then create() calls getNumber('listing.duration.default')
      mockConfigService.getNumber.mockResolvedValueOnce(2).mockResolvedValueOnce(30)
      mockDb.select.mockReturnValueOnce(qb([{ id: 'cat-1', isCollectible: false }]))
      mockDb.insert.mockReturnValueOnce(insertQb([{ ...mockListing, creditsSpent: 2, wasFreeQuota: false }]))

      const result = await service.create(USER_ID, createDto)
      expect(mockWalletService.debit).toHaveBeenCalledWith(USER_ID, 2, 'listing_publish')
      expect(result.creditsSpent).toBe(2)
    })

    it('throws NotFoundException when category not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.create(USER_ID, createDto)).rejects.toThrow(NotFoundException)
    })

    it('sets moderationStatus=pending for medium risk score', async () => {
      const riskDto = { ...createDto, price: 0 }  // price=0 adds 30 pts risk
      mockDb.select.mockReturnValueOnce(qb([{ id: 'cat-1', isCollectible: false }]))
      mockDb.insert.mockReturnValueOnce(insertQb([{ ...mockListing, moderationStatus: 'pending', status: 'draft' }]))

      const result = await service.create(USER_ID, riskDto)
      expect(result.moderationStatus).toBe('pending')
    })
  })

  describe('findAll()', () => {
    it('returns paginated listings without cursor', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockListing]))
      const result = await service.findAll({})
      expect(result.data).toHaveLength(1)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeNull()
    })

    it('returns hasMore=true and nextCursor when more rows exist', async () => {
      const rows = Array.from({ length: 21 }, (_, i) => ({
        ...mockListing,
        id: `listing-${i}`,
        createdAt: new Date(`2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`),
      }))
      mockDb.select.mockReturnValueOnce(qb(rows))
      const result = await service.findAll({ limit: 20 })
      expect(result.data).toHaveLength(20)
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).not.toBeNull()
    })

    it('applies cursor filter when provided', async () => {
      const cursor = encodeCursor({ createdAt: new Date('2026-01-15T00:00:00Z'), id: 'x' })
      mockDb.select.mockReturnValueOnce(qb([mockListing]))
      const result = await service.findAll({ cursor })
      expect(result.data).toHaveLength(1)
    })

    it('filters by categoryId when provided', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await service.findAll({ categoryId: 'cat-1' })
    })
  })

  describe('findOne()', () => {
    it('returns listing with images', async () => {
      mockDb.select
        .mockReturnValueOnce(qb([mockListing]))
        .mockReturnValueOnce(qb([]))  // images
        .mockReturnValueOnce(qb(undefined))  // recordView insert (fire-and-forget)
      mockDb.insert.mockReturnValueOnce(insertQb())
      mockDb.update.mockReturnValueOnce(updateQb())

      const result = await service.findOne(LISTING_ID)
      expect(result.id).toBe(LISTING_ID)
      expect(result.images).toEqual([])
    })

    it('throws NotFoundException when listing not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('throws NotFoundException for removed listing', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ ...mockListing, status: 'removed' }]))
      await expect(service.findOne(LISTING_ID)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update()', () => {
    it('updates editable fields on draft/paused listing', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ ...mockListing, status: 'draft' }]))
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ ...mockListing, title: 'Nuevo título' }]),
          }),
        }),
      })
      const result = await service.update(LISTING_ID, USER_ID, { title: 'Nuevo título' })
      expect(result.title).toBe('Nuevo título')
    })

    it('throws NotFoundException when listing not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.update('nonexistent', USER_ID, {})).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when not owner', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ ...mockListing, userId: 'other-user' }]))
      await expect(service.update(LISTING_ID, USER_ID, {})).rejects.toThrow(ForbiddenException)
    })

    it('throws BadRequestException when listing is active', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ ...mockListing, status: 'active' }]))
      await expect(service.update(LISTING_ID, USER_ID, { title: 'test' })).rejects.toThrow(BadRequestException)
    })
  })

  describe('remove()', () => {
    it('marks listing as removed', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: LISTING_ID, userId: USER_ID }]))
      mockDb.update.mockReturnValueOnce(updateQb())
      await expect(service.remove(LISTING_ID, USER_ID)).resolves.not.toThrow()
    })

    it('throws ForbiddenException when not owner', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: LISTING_ID, userId: 'other-user' }]))
      await expect(service.remove(LISTING_ID, USER_ID)).rejects.toThrow(ForbiddenException)
    })
  })

  describe('findByUser()', () => {
    it('returns user listings with cursor pagination', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockListing]))
      const result = await service.findByUser(USER_ID)
      expect(result.data).toHaveLength(1)
      expect(result.hasMore).toBe(false)
    })
  })
})
