
-- Dark Points balance per user
CREATE TABLE public.dark_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.dark_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dark_points" ON public.dark_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dark_points" ON public.dark_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dark_points" ON public.dark_points FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Transaction history
CREATE TABLE public.dp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'spend', 'earn', 'sale')),
  description text,
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.dp_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.dp_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Shop items (creator's shop)
CREATE TABLE public.shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('vanity', 'booster', 'consumable', 'special')),
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  price integer NOT NULL,
  icon text NOT NULL DEFAULT '📦',
  effect_type text,
  effect_value numeric,
  max_per_user integer,
  stock integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active shop items" ON public.shop_items FOR SELECT TO authenticated USING (is_active = true);

-- User inventory
CREATE TABLE public.user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.shop_items(id),
  quantity integer NOT NULL DEFAULT 1,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'shop' CHECK (source IN ('shop', 'drop', 'marketplace')),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON public.user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON public.user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON public.user_inventory FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Marketplace listings
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.shop_items(id),
  price integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active listings" ON public.marketplace_listings FOR SELECT TO authenticated USING (status = 'active' OR auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Users can insert own listings" ON public.marketplace_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON public.marketplace_listings FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

-- DP purchase packages
CREATE TABLE public.dp_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dark_points integer NOT NULL,
  price_mxn numeric NOT NULL,
  bonus_points integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT '💎',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dp_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active packages" ON public.dp_packages FOR SELECT TO authenticated USING (is_active = true);
