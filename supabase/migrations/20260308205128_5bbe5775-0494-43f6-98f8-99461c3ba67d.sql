
-- T-Points balance table
CREATE TABLE public.t_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.t_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own t_points" ON public.t_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own t_points" ON public.t_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own t_points" ON public.t_points FOR UPDATE USING (auth.uid() = user_id);

-- T-Points transactions
CREATE TABLE public.tp_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text,
  reference_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tp_transactions" ON public.tp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tp_transactions" ON public.tp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- T-Points packages (85% value, 15% to creator)
CREATE TABLE public.tp_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  t_points integer NOT NULL,
  price_mxn numeric NOT NULL,
  bonus_points integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT '🔷',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tp_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active tp_packages" ON public.tp_packages FOR SELECT USING (is_active = true);
