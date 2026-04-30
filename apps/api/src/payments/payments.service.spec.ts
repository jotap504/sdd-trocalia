import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { createHmac } from 'crypto'
import { Preference, Payment } from 'mercadopago'
import { PaymentsService } from './payments.service'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { WalletService } from '../wallet/wallet.service'

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
const PAYMENT_ID = 'payment-uuid-001'
const MP_PAYMENT_ID = '123456789'

const mockPayment = {
  id: PAYMENT_ID,
  userId: USER_ID,
  packageId: 'tokens_10',
  amount: '500',
  currency: 'ARS',
  tokensGranted: 10,
  status: 'pending',
  mpPreferenceId: null,
  mpPaymentId: null,
  createdAt: new Date(),
}

// Mock MercadoPago SDK
const mockPreferenceCreate = jest.fn()
const mockPaymentGet = jest.fn()

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
  Preference: jest.fn().mockImplementation(() => ({ create: mockPreferenceCreate })),
  Payment: jest.fn().mockImplementation(() => ({ get: mockPaymentGet })),
}))

const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
}

const mockWalletService = {
  credit: jest.fn(),
}

describe('PaymentsService', () => {
  let service: PaymentsService

  beforeEach(async () => {
    jest.resetAllMocks()
    process.env.MP_WEBHOOK_SECRET = 'test-secret'

    // Re-apply constructor mocks cleared by resetAllMocks
    jest.mocked(Preference).mockImplementation(() => ({ create: mockPreferenceCreate }) as unknown as InstanceType<typeof Preference>)
    jest.mocked(Payment).mockImplementation(() => ({ get: mockPaymentGet }) as unknown as InstanceType<typeof Payment>)

    mockPreferenceCreate.mockResolvedValue({
      id: 'pref-001',
      init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-001',
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile()

    service = module.get<PaymentsService>(PaymentsService)
  })

  describe('createPreference()', () => {
    it('creates payment record and returns MercadoPago init_point', async () => {
      mockDb.insert.mockReturnValueOnce(insertQb([mockPayment]))
      mockDb.update.mockReturnValueOnce(updateQb())

      const result = await service.createPreference(USER_ID, 'tokens_10')
      expect(result.initPoint).toContain('mercadopago.com.ar')
      expect(result.paymentId).toBe(PAYMENT_ID)
      expect(mockPreferenceCreate).toHaveBeenCalledTimes(1)
    })

    it('throws BadRequestException for invalid packageId', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.createPreference(USER_ID, 'invalid_package' as any),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('handleWebhook()', () => {
    const approvedPaymentData = {
      id: Number(MP_PAYMENT_ID),
      status: 'approved',
      external_reference: PAYMENT_ID,
    }

    it('credits tokens to user when payment is approved', async () => {
      mockPaymentGet.mockResolvedValue(approvedPaymentData)
      mockDb.select.mockReturnValueOnce(qb([mockPayment]))
      mockDb.update.mockReturnValueOnce(updateQb())
      mockWalletService.credit.mockResolvedValue({ balance: 10 })

      await service.handleWebhook(
        { type: 'payment', data: { id: MP_PAYMENT_ID } },
        undefined, undefined, undefined,
      )

      expect(mockWalletService.credit).toHaveBeenCalledWith(USER_ID, 10, 'token_purchase')
    })

    it('does not credit tokens when payment status is not approved', async () => {
      mockPaymentGet.mockResolvedValue({ ...approvedPaymentData, status: 'pending' })
      mockDb.select.mockReturnValueOnce(qb([mockPayment]))
      mockDb.update.mockReturnValueOnce(updateQb())

      await service.handleWebhook(
        { type: 'payment', data: { id: MP_PAYMENT_ID } },
        undefined, undefined, undefined,
      )

      expect(mockWalletService.credit).not.toHaveBeenCalled()
    })

    it('skips processing when payment already approved', async () => {
      mockPaymentGet.mockResolvedValue(approvedPaymentData)
      mockDb.select.mockReturnValueOnce(qb([{ ...mockPayment, status: 'approved' }]))

      await service.handleWebhook(
        { type: 'payment', data: { id: MP_PAYMENT_ID } },
        undefined, undefined, undefined,
      )

      expect(mockWalletService.credit).not.toHaveBeenCalled()
    })

    it('ignores non-payment webhook types', async () => {
      await service.handleWebhook({ type: 'merchant_order' }, undefined, undefined, undefined)
      expect(mockPaymentGet).not.toHaveBeenCalled()
    })

    it('validates webhook signature when secret is set', async () => {
      const requestId = 'req-001'
      const ts = String(Date.now())
      const dataId = MP_PAYMENT_ID
      const template = `id:${dataId};request-id:${requestId};ts:${ts};`
      const v1 = createHmac('sha256', 'test-secret').update(template).digest('hex')
      const signature = `ts=${ts},v1=${v1}`

      mockPaymentGet.mockResolvedValue(approvedPaymentData)
      mockDb.select.mockReturnValueOnce(qb([mockPayment]))
      mockDb.update.mockReturnValueOnce(updateQb())
      mockWalletService.credit.mockResolvedValue({ balance: 10 })

      await expect(
        service.handleWebhook(
          { type: 'payment', data: { id: dataId } },
          signature, requestId, ts,
        ),
      ).resolves.not.toThrow()
    })

    it('throws UnauthorizedException when signature is invalid', async () => {
      await expect(
        service.handleWebhook(
          { type: 'payment', data: { id: MP_PAYMENT_ID } },
          'ts=123,v1=invalid', 'req-001', '123',
        ),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('getHistory()', () => {
    it('returns payment history ordered by date', async () => {
      mockDb.select.mockReturnValueOnce(qb([mockPayment]))
      const result = await service.getHistory(USER_ID)
      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe(USER_ID)
    })
  })
})
