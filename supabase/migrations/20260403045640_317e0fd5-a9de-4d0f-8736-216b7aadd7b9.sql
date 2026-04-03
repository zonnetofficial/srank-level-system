
-- Create cloud sync table for game state
CREATE TABLE IF NOT EXISTS public.user_game_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  game_state jsonb NOT NULL DEFAULT '{}',
  dungeon_state jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own game state"
  ON public.user_game_state FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state"
  ON public.user_game_state FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
  ON public.user_game_state FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Wipe all existing progress (user requested clean slate)
DELETE FROM public.character_equipment;
DELETE FROM public.marketplace_listings;
DELETE FROM public.user_inventory;
DELETE FROM public.dp_transactions;
DELETE FROM public.tp_transactions;
DELETE FROM public.dark_points;
DELETE FROM public.t_points;
DELETE FROM public.dungeon_profiles;

-- Seed luckbox reward items for dungeons
INSERT INTO public.shop_items (name, description, category, rarity, price, icon, effect_type, effect_value, is_active) VALUES
('Poción de Vida', 'Restaura 30% HP en mazmorra', 'dungeon', 'common', 50, '❤️‍🩹', 'hp_potion', 30, true),
('Poción de Stamina', 'Restaura 30% Stamina en mazmorra', 'dungeon', 'common', 50, '💨', 'stamina_potion', 30, true),
('Elixir de Vitalidad', 'Restaura 50% HP en mazmorra', 'dungeon', 'uncommon', 100, '🧪', 'hp_potion', 50, true),
('Multiplicador XP x1.5', 'Siguiente quest otorga x1.5 XP', 'consumable', 'rare', 150, '⚡', 'xp_multiplier', 150, true),
('Multiplicador XP x2', 'Siguiente quest otorga x2 XP', 'consumable', 'epic', 300, '🔥', 'xp_multiplier', 200, true),
('Marco Dorado', 'Marco decorativo para perfil', 'vanity', 'rare', 200, '🖼️', 'frame', 0, true),
('Aura Oscura', 'Aura para personaje', 'vanity', 'epic', 350, '🌑', 'aura', 0, true),
('Corona de Fuego', 'Corona decorativa', 'vanity', 'epic', 400, '🔥', 'crown', 0, true),
('Halo Divino', 'Halo decorativo', 'vanity', 'legendary', 500, '😇', 'halo', 0, true),
('Marca del Cazador', 'Marca decorativa', 'vanity', 'rare', 180, '🎯', 'mark', 0, true);
