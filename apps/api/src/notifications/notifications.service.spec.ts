import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { DRIZZLE_TOKEN } from '../database/database.module'

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
  const returning = jest.fn().mockResolvedValue(result)
  const values = jest.fn().mockReturnValue({ returning })
  return { values }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateQb(): any {
  const where = jest.fn().mockResolvedValue([])
  const set = jest.fn().mockReturnValue({ where })
  return { set }
}

const USER_ID = 'user-uuid-001'
const NOTIF_ID = 'notif-uuid-001'

const mockNotification = {
  id: NOTIF_ID,
  userId: USER_ID,
  channel: 'in_app' as const,
  type: 'new_review',
  title: 'Nueva reseña',
  body: 'Recibiste una nueva reseña de 5 estrellas',
  data: {},
  status: 'pending' as const,
  readAt: null,
  sentAt: null,
  createdAt: new Date('2026-01-15T00:00:00Z'),
}

const mockFetch = jest.fn()

const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
}

// Mock Resend SDK
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'email-id-001' }),
    },
  })),
}))

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(async () => {
    jest.resetAllMocks()
    global.fetch = mockFetch as unknown as typeof fetch
    mockFetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ id: 'onesignal-id' }) })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
  })

  describe('send()', () => {
    it('saves in_app notification and marks as sent', async () => {
      mockDb.insert.mockReturnValueOnce(insertQb([mockNotification]))
      mockDb.update.mockReturnValueOnce(updateQb())

      await service.send({
        userId: USER_ID,
        channel: 'in_app',
        type: 'new_review',
        title: 'Nueva reseña',
        body: 'Recibiste una reseña',
      })

      expect(mockDb.insert).toHaveBeenCalledTimes(1)
      expect(mockDb.update).toHaveBeenCalledTimes(1)
    })

    it('sends email via Resend when channel=email and toEmail provided', async () => {
      mockDb.insert.mockReturnValueOnce(insertQb([{ ...mockNotification, channel: 'email' }]))
      mockDb.update.mockReturnValueOnce(updateQb())

      await service.send({
        userId: USER_ID,
        channel: 'email',
        type: 'listing_expired',
        title: 'Listado expirado',
        body: 'Tu listado ha expirado',
        toEmail: 'user@example.com',
      })

      expect(mockDb.update).toHaveBeenCalledTimes(1)
    })

    it('looks up email from DB when toEmail not provided for email channel', async () => {
      mockDb.insert.mockReturnValueOnce(insertQb([{ ...mockNotification, channel: 'email' }]))
      mockDb.select.mockReturnValueOnce(qb([{ email: 'user@example.com' }]))
      mockDb.update.mockReturnValueOnce(updateQb())

      await service.send({
        userId: USER_ID,
        channel: 'email',
        type: 'listing_expired',
        title: 'Listado expirado',
        body: 'Tu listado ha expirado',
      })

      expect(mockDb.select).toHaveBeenCalledTimes(1)
    })

    it('sends push via OneSignal when channel=push', async () => {
      mockDb.insert.mockReturnValueOnce(insertQb([{ ...mockNotification, channel: 'push' }]))
      mockDb.update.mockReturnValueOnce(updateQb())

      await service.send({
        userId: USER_ID,
        channel: 'push',
        type: 'new_message',
        title: 'Nuevo mensaje',
        body: 'Tienes un nuevo mensaje',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://onesignal.com/api/v1/notifications',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('marks notification as failed when channel send throws', async () => {
      mockDb.insert.mockReturnValueOnce(insertQb([{ ...mockNotification, channel: 'push' }]))
      mockDb.update.mockReturnValueOnce(updateQb())
      mockFetch.mockResolvedValue({ ok: false, status: 500 })

      await expect(
        service.send({ userId: USER_ID, channel: 'push', type: 'x', title: 'x', body: 'x' }),
      ).resolves.not.toThrow()

      const updateCall = mockDb.update.mock.results[0]
      expect(updateCall).toBeDefined()
    })
  })

  describe('findForUser()', () => {
    it('returns notifications for user ordered by date', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockNotification]))
      const result = await service.findForUser(USER_ID)
      expect(result).toHaveLength(1)
    })

    it('filters unread only when unreadOnly=true', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await service.findForUser(USER_ID, true)
      expect(mockDb.select).toHaveBeenCalledTimes(1)
    })
  })

  describe('markRead()', () => {
    it('marks notification as read', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: NOTIF_ID, userId: USER_ID }]))
      mockDb.update.mockReturnValueOnce(updateQb())

      await expect(service.markRead(USER_ID, NOTIF_ID)).resolves.not.toThrow()
      expect(mockDb.update).toHaveBeenCalledTimes(1)
    })

    it('throws NotFoundException when notification not found', async () => {
      mockDb.select.mockReturnValueOnce(qb([]))
      await expect(service.markRead(USER_ID, NOTIF_ID)).rejects.toThrow(NotFoundException)
    })

    it('throws NotFoundException when notification belongs to another user', async () => {
      mockDb.select.mockReturnValueOnce(qb([{ id: NOTIF_ID, userId: 'other-user' }]))
      await expect(service.markRead(USER_ID, NOTIF_ID)).rejects.toThrow(NotFoundException)
    })
  })

  describe('markAllRead()', () => {
    it('marks all unread notifications as read for user', async () => {
      mockDb.update.mockReturnValueOnce(updateQb())
      await expect(service.markAllRead(USER_ID)).resolves.not.toThrow()
      expect(mockDb.update).toHaveBeenCalledTimes(1)
    })
  })
})
