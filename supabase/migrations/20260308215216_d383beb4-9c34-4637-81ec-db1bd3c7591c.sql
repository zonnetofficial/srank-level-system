
CREATE TABLE public.dungeon_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT 'Cazador',
  character_name text,
  character_class text,
  character_sprite text,
  dungeons_cleared integer NOT NULL DEFAULT 0,
  highest_rank text NOT NULL DEFAULT 'E',
  total_xp_earned integer NOT NULL DEFAULT 0,
  deaths integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.dungeon_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view the leaderboard
CREATE POLICY "Anyone can view dungeon profiles"
  ON public.dungeon_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own
CREATE POLICY "Users can insert own dungeon profile"
  ON public.dungeon_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "Users can update own dungeon profile"
  ON public.dungeon_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
