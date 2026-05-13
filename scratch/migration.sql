ALTER TABLE listings ADD COLUMN IF NOT EXISTS sale_type text NOT NULL DEFAULT 'contact';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS stock integer;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS desired_price integer;

ALTER TABLE listings ADD CONSTRAINT sale_type_check CHECK (sale_type IN ('contact', 'stock', 'auction'));
ALTER TABLE listings ADD CONSTRAINT stock_check CHECK (stock IS NULL OR stock >= 0);

CREATE TABLE IF NOT EXISTS listing_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'won', 'lost')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_bids_listing ON listing_bids(listing_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_listing_bids_bidder ON listing_bids(bidder_id);
