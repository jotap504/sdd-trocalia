CREATE TABLE "listing_bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"bidder_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "sale_type" text DEFAULT 'contact' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "stock" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "desired_price" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "contact_info" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "youtube_live_id" varchar(50);--> statement-breakpoint
ALTER TABLE "listing_bids" ADD CONSTRAINT "listing_bids_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_bids" ADD CONSTRAINT "listing_bids_bidder_id_users_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_questions" ADD CONSTRAINT "listing_questions_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_questions" ADD CONSTRAINT "listing_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_listing_questions_listing" ON "listing_questions" USING btree ("listing_id","created_at");