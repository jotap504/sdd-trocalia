import {
  pgTable, uuid, varchar, decimal, integer, jsonb, timestamp, index,
} from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const payments = pgTable('payments', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => users.id),
  mpPreferenceId:  varchar('mp_preference_id', { length: 100 }),
  mpPaymentId:     varchar('mp_payment_id', { length: 100 }).unique(),
  status:          varchar('status', { length: 50 }).notNull().default('pending'),
  amount:          decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency:        varchar('currency', { length: 3 }).notNull().default('ARS'),
  tokensGranted:   integer('tokens_granted').notNull().default(0),
  packageId:       varchar('package_id', { length: 50 }).notNull(),
  description:     varchar('description', { length: 200 }),
  metadata:        jsonb('metadata'),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_payments_user').on(table.userId, table.createdAt),
  index('idx_payments_mp_id').on(table.mpPaymentId),
])
