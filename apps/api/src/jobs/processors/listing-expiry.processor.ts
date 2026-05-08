import type { Job } from 'bullmq'
import { lte, eq, and } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../../database/schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processListingExpiry(_job: Job, db: NodePgDatabase<any>): Promise<{ expired: number }> {
  const now = new Date()

  const result = await db
    .update(schema.listings)
    .set({ status: 'expired', updatedAt: now })
    .where(
      and(
        eq(schema.listings.status, 'active'),
        lte(schema.listings.expiresAt, now),
      ),
    )
    .returning({ id: schema.listings.id })

  return { expired: result.length }
}
