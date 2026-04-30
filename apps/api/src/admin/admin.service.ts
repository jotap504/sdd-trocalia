import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { eq, desc, and, gte } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DRIZZLE_TOKEN } from '../database/database.module'
import * as schema from '../database/schema'

type DB = NodePgDatabase<typeof schema>

@Injectable()
export class AdminService {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DB) {}

  async getDashboardStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000)

    const [totalUsers, recentUsers, activeListings, pendingListings, pendingKyc] =
      await Promise.all([
        this.db.select({ id: schema.users.id }).from(schema.users).limit(1000),
        this.db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(gte(schema.users.createdAt, thirtyDaysAgo)),
        this.db
          .select({ id: schema.listings.id })
          .from(schema.listings)
          .where(eq(schema.listings.status, 'active')),
        this.db
          .select({ id: schema.listings.id })
          .from(schema.listings)
          .where(eq(schema.listings.moderationStatus, 'pending')),
        this.db
          .select({ id: schema.userVerifications.id })
          .from(schema.userVerifications)
          .where(eq(schema.userVerifications.status, 'pending')),
      ])

    return {
      users: {
        total: totalUsers.length,
        lastThirtyDays: recentUsers.length,
      },
      listings: {
        active: activeListings.length,
        pendingModeration: pendingListings.length,
      },
      kyc: {
        pending: pendingKyc.length,
      },
    }
  }

  async listUsers(limit = 50, offset = 0) {
    return this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        role: schema.users.role,
        status: schema.users.status,
        kycLevel: schema.users.kycLevel,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset)
  }

  async updateUserRole(targetUserId: string, role: string, adminId: string) {
    const validRoles = ['user', 'verified_user', 'moderator', 'support', 'finance', 'partner', 'super_admin']
    if (!validRoles.includes(role)) {
      throw new NotFoundException('INVALID_ROLE')
    }

    const [user] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, targetUserId))
      .limit(1)

    if (!user) throw new NotFoundException('USER_NOT_FOUND')

    void adminId
    const [updated] = await this.db
      .update(schema.users)
      .set({ role: role as typeof schema.users.$inferInsert['role'], updatedAt: new Date() })
      .where(eq(schema.users.id, targetUserId))
      .returning({ id: schema.users.id, email: schema.users.email, role: schema.users.role })

    return updated
  }

  async suspendUser(targetUserId: string, adminId: string) {
    const [user] = await this.db
      .select({ id: schema.users.id, status: schema.users.status })
      .from(schema.users)
      .where(eq(schema.users.id, targetUserId))
      .limit(1)

    if (!user) throw new NotFoundException('USER_NOT_FOUND')

    void adminId
    const [updated] = await this.db
      .update(schema.users)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(
        and(
          eq(schema.users.id, targetUserId),
          eq(schema.users.status, 'active'),
        ),
      )
      .returning({ id: schema.users.id, status: schema.users.status })

    return updated ?? { id: targetUserId, status: user.status }
  }

  async listFlaggedListings(limit = 50) {
    return this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.moderationStatus, 'flagged'))
      .orderBy(desc(schema.listings.updatedAt))
      .limit(Math.min(limit, 100))
  }
}
