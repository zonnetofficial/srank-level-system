
CREATE OR REPLACE FUNCTION public.sync_dungeon_profile(
  p_display_name text,
  p_character_name text,
  p_character_class text,
  p_character_sprite text,
  p_rank text,
  p_xp_earned int,
  p_died boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_existing record;
  v_rank_order jsonb := '{"E":0,"D":1,"C":2,"B":3,"A":4,"S":5}'::jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate inputs
  IF p_rank NOT IN ('E','D','C','B','A','S') THEN
    RAISE EXCEPTION 'Invalid rank';
  END IF;
  IF p_xp_earned < 0 OR p_xp_earned > 10000 THEN
    RAISE EXCEPTION 'Invalid XP value';
  END IF;
  IF length(p_display_name) > 100 OR length(p_character_name) > 100 THEN
    RAISE EXCEPTION 'Name too long';
  END IF;

  SELECT * INTO v_existing FROM dungeon_profiles WHERE user_id = v_user_id;

  IF FOUND THEN
    UPDATE dungeon_profiles SET
      display_name = p_display_name,
      character_name = p_character_name,
      character_class = p_character_class,
      character_sprite = p_character_sprite,
      dungeons_cleared = v_existing.dungeons_cleared + (CASE WHEN p_died THEN 0 ELSE 1 END),
      highest_rank = CASE 
        WHEN (v_rank_order->>p_rank)::int > (v_rank_order->>v_existing.highest_rank)::int THEN p_rank 
        ELSE v_existing.highest_rank 
      END,
      total_xp_earned = v_existing.total_xp_earned + p_xp_earned,
      deaths = v_existing.deaths + (CASE WHEN p_died THEN 1 ELSE 0 END),
      updated_at = now()
    WHERE user_id = v_user_id;
  ELSE
    INSERT INTO dungeon_profiles (user_id, display_name, character_name, character_class, character_sprite, dungeons_cleared, highest_rank, total_xp_earned, deaths)
    VALUES (v_user_id, p_display_name, p_character_name, p_character_class, p_character_sprite, 
            CASE WHEN p_died THEN 0 ELSE 1 END, p_rank, p_xp_earned, CASE WHEN p_died THEN 1 ELSE 0 END);
  END IF;
END;
$$;
