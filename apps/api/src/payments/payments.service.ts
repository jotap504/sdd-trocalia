import {
  Injectable, Inject, Logger, BadRequestException, UnauthorizedException,
} from '@nestjs/common'
import { createHmac } from 'crypto'
import { eq, desc } from 'drizzle-orm'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { WalletService } from '../wallet/wallet.service'
import * as schema from '../database/schema'
import { TOKEN_PACKAGES, type PackageId } from './dto/create-preference.dto'

type DB = NodePgDatabase<typeof schema>

interface MpWebhookBody {
  type?: string
  action?: string
  data?: { id?: string | number }
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)
  private readonly preference: Preference
  private readonly payment: Payment
  private readonly webhookSecret: string
  private readonly backUrl: string

  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DB,
    private readonly walletService: WalletService,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN ?? '',
    })
    this.preference = new Preference(client)
    this.payment = new Payment(client)
    this.webhookSecret = process.env.MP_WEBHOOK_SECRET ?? ''
    this.backUrl = process.env.APP_URL ?? 'https://trocalia.ar'
  }

  async createPreference(userId: string, packageId: PackageId) {
    const pkg = TOKEN_PACKAGES[packageId]
    if (!pkg) throw new BadRequestException('INVALID_PACKAGE')

    const [pendingPayment] = await this.db
      .insert(schema.payments)
      .values({
        userId,
        packageId,
        amount: String(pkg.amount),
        currency: 'ARS',
        tokensGranted: pkg.tokens,
        description: pkg.description,
        status: 'pending',
      })
      .returning()

    const result = await this.preference.create({
      body: {
        items: [
          {
            id: packageId,
            title: pkg.description,
            quantity: 1,
            unit_price: pkg.amount,
            currency_id: 'ARS',
          },
        ],
        external_reference: pendingPayment.id,
        back_urls: {
          success: `${this.backUrl}/payments/success`,
          failure: `${this.backUrl}/payments/failure`,
          pending: `${this.backUrl}/payments/pending`,
        },
        auto_return: 'approved',
        notification_url: `${this.backUrl}/api/v1/payments/webhook`,
      },
    })

    await this.db
      .update(schema.payments)
      .set({ mpPreferenceId: result.id ?? null, updatedAt: new Date() })
      .where(eq(schema.payments.id, pendingPayment.id))

    return { initPoint: result.init_point, paymentId: pendingPayment.id }
  }

  async handleWebhook(
    body: MpWebhookBody,
    signature: string | undefined,
    requestId: string | undefined,
    ts: string | undefined,
  ): Promise<void> {
    if (this.webhookSecret && signature && requestId && ts) {
      this.validateSignature(body, signature, requestId, ts)
    }

    if (body.type !== 'payment' || !body.data?.id) return

    const mpPaymentId = String(body.data.id)

    let paymentData: Awaited<ReturnType<Payment['get']>>
    try {
      paymentData = await this.payment.get({ id: mpPaymentId })
    } catch (err) {
      this.logger.error(`Failed to fetch MP payment ${mpPaymentId}`, err)
      return
    }

    const externalRef = paymentData.external_reference
    if (!externalRef) return

    const [payment] = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, externalRef))
      .limit(1)

    if (!payment || payment.status === 'approved') return

    const mpStatus = paymentData.status ?? 'unknown'

    await this.db
      .update(schema.payments)
      .set({ mpPaymentId, status: mpStatus, updatedAt: new Date() })
      .where(eq(schema.payments.id, payment.id))

    if (mpStatus === 'approved') {
      await this.walletService.credit(payment.userId, payment.tokensGranted, 'token_purchase')
      this.logger.log(`Credited ${payment.tokensGranted} tokens to user ${payment.userId}`)
    }
  }

  async getHistory(userId: string) {
    return this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.userId, userId))
      .orderBy(desc(schema.payments.createdAt))
      .limit(50)
  }

  private validateSignature(
    body: MpWebhookBody,
    signature: string,
    requestId: string,
    ts: string,
  ): void {
    const parts = signature.split(',')
    const v1Part = parts.find((p) => p.startsWith('v1='))
    if (!v1Part) throw new UnauthorizedException('INVALID_WEBHOOK_SIGNATURE')

    const v1 = v1Part.replace('v1=', '')
    const dataId = body.data?.id ? String(body.data.id) : ''
    const template = `id:${dataId};request-id:${requestId};ts:${ts};`
    const expected = createHmac('sha256', this.webhookSecret).update(template).digest('hex')

    if (expected !== v1) throw new UnauthorizedException('INVALID_WEBHOOK_SIGNATURE')
  }
}
