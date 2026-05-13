import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { conversationStatusEnum } from './enums';
import { users } from './users.schema';
import { listings } from './listings.schema';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: conversationStatusEnum('status').notNull().default('active'),

    // Listing snapshot (survives deletion)
    listingTitle: varchar('listing_title', { length: 150 }),
    listingPrice: varchar('listing_price', { length: 20 }),
    listingCurrency: varchar('listing_currency', { length: 3 }).default('ARS'),
    listingImage: varchar('listing_image', { length: 500 }),

    // Denormalized last-message fields
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    lastMessageText: text('last_message_text'),
    lastMessageSenderId: uuid('last_message_sender_id'),

    // Per-participant unread counts
    buyerUnreadCount: integer('buyer_unread_count').notNull().default(0),
    sellerUnreadCount: integer('seller_unread_count').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_conversations_buyer').on(table.buyerId, table.lastMessageAt),
    index('idx_conversations_seller').on(table.sellerId, table.lastMessageAt),
    index('idx_conversations_listing').on(table.listingId),
    uniqueIndex('idx_conversations_buyer_listing').on(
      table.buyerId,
      table.listingId,
    ),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_messages_conversation').on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);
