
-- Add support for DP listings in marketplace
ALTER TABLE public.marketplace_listings 
  ADD COLUMN listing_type text NOT NULL DEFAULT 'item',
  ADD COLUMN dp_amount integer DEFAULT NULL;

-- Make item_id nullable for DP listings
ALTER TABLE public.marketplace_listings ALTER COLUMN item_id DROP NOT NULL;
