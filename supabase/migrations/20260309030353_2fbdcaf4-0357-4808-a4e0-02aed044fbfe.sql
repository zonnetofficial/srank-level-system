
-- Character equipment table for visual customization
CREATE TABLE public.character_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slot TEXT NOT NULL, -- weapon, armor, aura, frame, title, accessory
  item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
  title_key TEXT, -- for class/skill titles (e.g. 'Cazador Novato')
  equipped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, slot)
);

ALTER TABLE public.character_equipment ENABLE ROW LEVEL SECURITY;

-- Anyone can view equipment (public profiles)
CREATE POLICY "Anyone can view character equipment"
  ON public.character_equipment FOR SELECT
  USING (true);

-- Users can manage their own equipment
CREATE POLICY "Users can insert own equipment"
  ON public.character_equipment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment"
  ON public.character_equipment FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment"
  ON public.character_equipment FOR DELETE
  USING (auth.uid() = user_id);
