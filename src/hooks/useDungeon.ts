import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  DungeonState,
  DungeonCharacter,
  DungeonRun,
  DungeonRank,
  CharacterClass,
  DungeonLoadoutItem,
  loadDungeonState,
  saveDungeonState,
  calculateCharacterHP,
  calculateCharacterStamina,
  generateDungeonRooms,
  applyHPRegen,
  getEscapeCost,
  isDungeonAvailable,
  DUNGEON_RANKS,
  getCooldownReduction,
  getLoadoutBonuses,
} from '@/lib/dungeonData';
import type { PlayerStats } from '@/lib/gameData';

export function useDungeon(stats: PlayerStats, playerLevel: number) {
  const { user } = useAuth();
  const [dungeonState, setDungeonState] = useState<DungeonState>(() => loadDungeonState());

  useEffect(() => { saveDungeonState(dungeonState); }, [dungeonState]);

  // ─── Cloud Sync ───
  const cloudLoaded = useRef(false);
  const cloudSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || cloudLoaded.current) return;
    cloudLoaded.current = true;

    supabase
      .from('user_game_state' as any)
      .select('dungeon_state')
      .eq('user_id', user.id)
      .single()
      .then(({ data }: any) => {
        if (data?.dungeon_state && typeof data.dungeon_state === 'object' &&
            (data.dungeon_state.character || data.dungeon_state.totalCleared !== undefined)) {
          let cloudState = data.dungeon_state as unknown as DungeonState;
          if (cloudState.character) cloudState.character = applyHPRegen(cloudState.character);
          if (!cloudState.loadout) cloudState.loadout = [];
          setDungeonState(cloudState);
          saveDungeonState(cloudState);
        } else {
          // No cloud data — upload current state via RPC
          supabase.rpc('save_game_state' as any, {
            p_dungeon_state: dungeonState as any,
          });
        }
      });
  }, [user?.id]);

  // Debounced cloud save via secure RPC
  useEffect(() => {
    if (!user) return;
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(() => {
      supabase.rpc('save_game_state' as any, {
        p_dungeon_state: dungeonState as any,
      }).then(() => {});
    }, 3000);
    return () => { if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current); };
  }, [dungeonState, user?.id]);

  // Periodic HP regen
  useEffect(() => {
    if (!dungeonState.character) return;
    const interval = setInterval(() => {
      setDungeonState(prev => {
        if (!prev.character) return prev;
        const updated = applyHPRegen(prev.character);
        if (updated.currentHp === prev.character.currentHp) return prev;
        return { ...prev, character: updated };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [dungeonState.character?.name]);

  const createCharacter = useCallback((name: string, charClass: CharacterClass, sprite: string) => {
    const maxHp = calculateCharacterHP(stats, charClass);
    const maxStamina = calculateCharacterStamina(stats, charClass);
    const character: DungeonCharacter = {
      name,
      className: charClass,
      sprite,
      maxHp,
      currentHp: maxHp,
      maxStamina,
      currentStamina: maxStamina,
      lastHpUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      dungeonsCleared: 0,
    };
    setDungeonState(prev => ({ ...prev, character }));
  }, [stats]);

  const setLoadout = useCallback((loadout: DungeonLoadoutItem[]) => {
    setDungeonState(prev => ({ ...prev, loadout }));
  }, []);

  const startDungeon = useCallback((rank: DungeonRank) => {
    if (!isDungeonAvailable(rank, dungeonState.cooldowns)) return;
    const rooms = generateDungeonRooms(rank);
    const run: DungeonRun = {
      rank,
      rooms,
      currentRoom: 0,
      startedAt: new Date().toISOString(),
      status: 'active',
      xpEarned: 0,
    };
    setDungeonState(prev => ({ ...prev, currentRun: run }));
  }, [dungeonState.cooldowns]);

  const completeRoom = useCallback((success: boolean) => {
    setDungeonState(prev => {
      if (!prev.currentRun || !prev.character) return prev;
      const run = { ...prev.currentRun };
      const room = run.rooms[run.currentRoom];
      let character = { ...prev.character };

      if (success) {
        run.xpEarned += room.xpReward;
        run.rooms = run.rooms.map((r, i) => i === run.currentRoom ? { ...r, completed: true } : r);
      } else {
        // Apply damage reduction from loadout
        const { damageReduction, hasRevive } = getLoadoutBonuses(prev.loadout);
        const effectiveDamage = Math.max(1, Math.floor(room.damage * (1 - damageReduction / 100)));
        character.currentHp = Math.max(0, character.currentHp - effectiveDamage);
        run.rooms = run.rooms.map((r, i) => i === run.currentRoom ? { ...r, completed: true } : r);

        // Check death - revive ring saves once
        if (character.currentHp <= 0 && hasRevive) {
          character.currentHp = 1;
          // Remove revive item from loadout
          const newLoadout = prev.loadout.filter(i => i.effect_type !== 'revive');
          return {
            ...prev,
            character,
            currentRun: run,
            loadout: newLoadout,
          };
        }
      }

      // Check death
      if (character.currentHp <= 0) {
        return {
          ...prev,
          character: null,
          currentRun: { ...run, status: 'dead' },
          loadout: [], // lose all equipped items
        };
      }

      return { ...prev, currentRun: run, character };
    });
  }, []);

  const advanceRoom = useCallback(() => {
    setDungeonState(prev => {
      if (!prev.currentRun) return prev;
      const run = { ...prev.currentRun };
      const nextRoom = run.currentRoom + 1;

      if (nextRoom >= run.rooms.length) {
        const config = DUNGEON_RANKS[run.rank];
        const reduction = getCooldownReduction(playerLevel, config.recommendedLevel);
        const cooldownMs = config.cooldownHours * 3600000 * reduction;
        const nextAvailable = new Date(Date.now() + cooldownMs).toISOString();

        return {
          ...prev,
          currentRun: { ...run, status: 'completed' },
          cooldowns: { ...prev.cooldowns, [run.rank]: nextAvailable },
          totalCleared: prev.totalCleared + 1,
          character: prev.character ? { ...prev.character, dungeonsCleared: prev.character.dungeonsCleared + 1 } : null,
        };
      }

      return { ...prev, currentRun: { ...run, currentRoom: nextRoom } };
    });
  }, [playerLevel]);

  const escapeDungeon = useCallback(() => {
    setDungeonState(prev => {
      if (!prev.currentRun || !prev.character) return prev;
      const cost = getEscapeCost(prev.character);
      if (prev.character.currentStamina < cost) return prev;

      const config = DUNGEON_RANKS[prev.currentRun.rank];
      const reduction = getCooldownReduction(playerLevel, config.recommendedLevel);
      const cooldownMs = config.cooldownHours * 3600000 * reduction * 0.15;
      const nextAvailable = new Date(Date.now() + cooldownMs).toISOString();

      return {
        ...prev,
        character: { ...prev.character, currentStamina: prev.character.currentStamina - cost },
        currentRun: { ...prev.currentRun, status: 'fled' },
        cooldowns: { ...prev.cooldowns, [prev.currentRun.rank]: nextAvailable },
      };
    });
  }, [playerLevel]);

  const healCharacter = useCallback(() => {
    setDungeonState(prev => {
      if (!prev.character) return prev;
      return {
        ...prev,
        character: {
          ...prev.character,
          currentHp: prev.character.maxHp,
          lastHpUpdate: new Date().toISOString(),
        },
      };
    });
  }, []);

  const clearRun = useCallback(() => {
    setDungeonState(prev => ({ ...prev, currentRun: null }));
  }, []);

  const usePotion = useCallback((type: 'hp' | 'stamina') => {
    setDungeonState(prev => {
      if (!prev.character) return prev;
      // Find potion in loadout
      const potionType = type === 'hp' ? 'hp_potion' : 'stamina_potion';
      const potionIdx = prev.loadout.findIndex(i => i.effect_type === potionType && i.quantity > 0);
      if (potionIdx === -1) return prev;

      const potion = prev.loadout[potionIdx];
      const healPercent = potion.effect_value / 100;

      const newLoadout = [...prev.loadout];
      if (potion.quantity <= 1) {
        newLoadout.splice(potionIdx, 1);
      } else {
        newLoadout[potionIdx] = { ...potion, quantity: potion.quantity - 1 };
      }

      if (type === 'hp') {
        return {
          ...prev,
          loadout: newLoadout,
          character: {
            ...prev.character,
            currentHp: Math.min(prev.character.maxHp, prev.character.currentHp + Math.floor(prev.character.maxHp * healPercent)),
            lastHpUpdate: new Date().toISOString(),
          },
        };
      } else {
        return {
          ...prev,
          loadout: newLoadout,
          character: {
            ...prev.character,
            currentStamina: Math.min(prev.character.maxStamina, prev.character.currentStamina + Math.floor(prev.character.maxStamina * healPercent)),
          },
        };
      }
    });
  }, []);

  return {
    dungeonState,
    createCharacter,
    startDungeon,
    completeRoom,
    advanceRoom,
    escapeDungeon,
    healCharacter,
    clearRun,
    usePotion,
    setLoadout,
  };
}
