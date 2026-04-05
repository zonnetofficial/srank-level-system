
-- Fix dungeon_profiles INSERT to enforce default stat values
DROP POLICY IF EXISTS "Users can insert own dungeon profile" ON dungeon_profiles;
CREATE POLICY "Users can insert own dungeon profile" ON dungeon_profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND deaths = 0
  AND dungeons_cleared = 0
  AND total_xp_earned = 0
  AND highest_rank = 'E'
);

-- Fix dungeon_profiles UPDATE to only allow cosmetic changes
DROP POLICY IF EXISTS "Users can update own dungeon profile" ON dungeon_profiles;
CREATE POLICY "Users can update own dungeon profile" ON dungeon_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND deaths = (SELECT deaths FROM dungeon_profiles WHERE user_id = auth.uid())
  AND dungeons_cleared = (SELECT dungeons_cleared FROM dungeon_profiles WHERE user_id = auth.uid())
  AND total_xp_earned = (SELECT total_xp_earned FROM dungeon_profiles WHERE user_id = auth.uid())
  AND highest_rank = (SELECT highest_rank FROM dungeon_profiles WHERE user_id = auth.uid())
);
