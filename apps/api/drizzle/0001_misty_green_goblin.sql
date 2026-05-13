CREATE TYPE "public"."conversation_status" AS ENUM('active', 'archived', 'blocked');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mp_preference_id" varchar(100),
	"mp_payment_id" varchar(100),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'ARS' NOT NULL,
	"tokens_granted" integer DEFAULT 0 NOT NULL,
	"package_id" varchar(50) NOT NULL,
	"description" varchar(200),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_mp_payment_id_unique" UNIQUE("mp_payment_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"status" "conversation_status" DEFAULT 'active' NOT NULL,
	"listing_title" varchar(150),
	"listing_price" varchar(20),
	"listing_currency" varchar(3) DEFAULT 'ARS',
	"listing_image" varchar(500),
	"last_message_at" timestamp with time zone,
	"last_message_text" text,
	"last_message_sender_id" uuid,
	"buyer_unread_count" integer DEFAULT 0 NOT NULL,
	"seller_unread_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payments_user" ON "payments" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_payments_mp_id" ON "payments" USING btree ("mp_payment_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_buyer" ON "conversations" USING btree ("buyer_id","last_message_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_seller" ON "conversations" USING btree ("seller_id","last_message_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_listing" ON "conversations" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_conversations_buyer_listing" ON "conversations" USING btree ("buyer_id","listing_id");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id","created_at");