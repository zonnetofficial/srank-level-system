ALTER TABLE public.shop_items DROP CONSTRAINT shop_items_category_check;
ALTER TABLE public.shop_items ADD CONSTRAINT shop_items_category_check CHECK (category = ANY (ARRAY['vanity'::text, 'booster'::text, 'consumable'::text, 'special'::text, 'dungeon'::text]));
