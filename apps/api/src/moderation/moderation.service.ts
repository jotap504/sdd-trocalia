import {
  Injectable, Inject, NotFoundException, BadRequestException,
} from '@nestjs/common'
import { eq, and, desc } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_TOKEN } from '../database/database.module'
import { ConfigService } from '../config/config.service'
import * as schema from '../database/schema'

type DB = NodePgDatabase<typeof schema>

@Injectable()
export class ModerationService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DB,
    private readonly configService: ConfigService,
  ) {}

  async listPending(limit = 50) {
    return this.db
      .select()
      .from(schema.listings)
      .where(
        and(
          eq(schema.listings.moderationStatus, 'pending'),
          eq(schema.listings.status, 'draft'),
        ),
      )
      .orderBy(desc(schema.listings.riskScore), desc(schema.listings.createdAt))
      .limit(Math.min(limit, 100))
  }

  async approve(listingId: string, moderatorId: string) {
    const [listing] = await this.db
      .select({ id: schema.listings.id, moderationStatus: schema.listings.moderationStatus, durationDays: schema.listings.durationDays })
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1)

    if (!listing) throw new NotFoundException('LISTING_NOT_FOUND')
    if (listing.moderationStatus !== 'pending') {
      throw new BadRequestException('LISTING_NOT_PENDING')
    }

    const publishedAt = new Date()
    const durationDays = await this.configService.getNumber('listing.duration.default', listing.durationDays ?? 30)
    const expiresAt = new Date(publishedAt.getTime() + durationDays * 24 * 60 * 60 * 1000)

    const [updated] = await this.db
      .update(schema.listings)
      .set({
        moderationStatus: 'approved',
        status: 'active',
        publishedAt,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.listings.id, listingId))
      .returning()

    void moderatorId
    return updated
  }

  async reject(listingId: string, moderatorId: string) {
    const [listing] = await this.db
      .select({ id: schema.listings.id, moderationStatus: schema.listings.moderationStatus })
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1)

    if (!listing) throw new NotFoundException('LISTING_NOT_FOUND')
    if (listing.moderationStatus !== 'pending') {
      throw new BadRequestException('LISTING_NOT_PENDING')
    }

    const [updated] = await this.db
      .update(schema.listings)
      .set({
        moderationStatus: 'rejected',
        status: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(schema.listings.id, listingId))
      .returning()

    void moderatorId
    return updated
  }

  async flag(listingId: string, moderatorId: string) {
    const [listing] = await this.db
      .select({ id: schema.listings.id })
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1)

    if (!listing) throw new NotFoundException('LISTING_NOT_FOUND')

    const [updated] = await this.db
      .update(schema.listings)
      .set({ moderationStatus: 'flagged', updatedAt: new Date() })
      .where(eq(schema.listings.id, listingId))
      .returning()

    void moderatorId
    return updated
  }
}
