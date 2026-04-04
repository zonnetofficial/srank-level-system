
-- Create a secure RPC for saving game state with bounds validation
CREATE OR REPLACE FUNCTION public.save_game_state(p_game_state jsonb, p_dungeon_state jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_level int;
  v_xp int;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Basic bounds validation on game_state
  IF p_game_state IS NOT NULL THEN
    v_level := (p_game_state->>'level')::int;
    v_xp := (p_game_state->>'xp')::int;

    IF v_level IS NULL OR v_level < 1 OR v_level > 999 THEN
      RAISE EXCEPTION 'Invalid level value';
    END IF;
    IF v_xp IS NULL OR v_xp < 0 OR v_xp > 99999 THEN
      RAISE EXCEPTION 'Invalid xp value';
    END IF;

    -- Validate stats are within reasonable bounds
    IF (p_game_state->'stats'->>'int')::int > 9999 OR
       (p_game_state->'stats'->>'str')::int > 9999 OR
       (p_game_state->'stats'->>'agi')::int > 9999 OR
       (p_game_state->'stats'->>'vit')::int > 9999 OR
       (p_game_state->'stats'->>'end')::int > 9999 THEN
      RAISE EXCEPTION 'Stat values exceed maximum';
    END IF;

    IF (p_game_state->'stats'->>'int')::int < 0 OR
       (p_game_state->'stats'->>'str')::int < 0 OR
       (p_game_state->'stats'->>'agi')::int < 0 OR
       (p_game_state->'stats'->>'vit')::int < 0 OR
       (p_game_state->'stats'->>'end')::int < 0 THEN
      RAISE EXCEPTION 'Stat values cannot be negative';
    END IF;
  END IF;

  -- Upsert
  INSERT INTO user_game_state (user_id, game_state, dungeon_state, updated_at)
  VALUES (
    v_user_id,
    COALESCE(p_game_state, '{}'::jsonb),
    COALESCE(p_dungeon_state, '{}'::jsonb),
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    game_state = CASE WHEN p_game_state IS NOT NULL THEN p_game_state ELSE user_game_state.game_state END,
    dungeon_state = CASE WHEN p_dungeon_state IS NOT NULL THEN p_dungeon_state ELSE user_game_state.dungeon_state END,
    updated_at = now();
END;
$$;

-- Remove the direct UPDATE policy to prevent client-side manipulation
DROP POLICY IF EXISTS "Users can update own game state" ON user_game_state;

-- Remove the direct INSERT policy (RPC handles upsert now)
DROP POLICY IF EXISTS "Users can insert own game state" ON user_game_state;
