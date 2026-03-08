import { useState } from 'react';
import VictorianFrame from '@/components/VictorianFrame';
import CharacterCreation from '@/components/dungeon/CharacterCreation';
import DungeonRoom from '@/components/dungeon/DungeonRoom';
import { useGameState } from '@/hooks/useGameState';
import { useDungeon } from '@/hooks/useDungeon';
import {
  DungeonRank,
  DUNGEON_RANKS,
  isDungeonAvailable,
  getCooldownRemaining,
  getEscapeCost,
  rollLuckBox,
  RARITY_COLORS,
  type LuckBoxReward,
} from '@/lib/dungeonData';
import { xpForLevel } from '@/lib/gameData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const ranks: DungeonRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

type View = 'lobby' | 'create' | 'dungeon' | 'reward' | 'result';

export default function Dungeons() {
  const { state } = useGameState();
  const { user } = useAuth();
  const {
    dungeonState, createCharacter, startDungeon,
    completeRoom, advanceRoom, escapeDungeon,
    healCharacter, clearRun, usePotion,
  } = useDungeon(state.stats, state.level);

  const [view, setView] = useState<View>(dungeonState.character ? (dungeonState.currentRun?.status === 'active' ? 'dungeon' : 'lobby') : 'create');
  const [rewardChoice, setRewardChoice] = useState<'heal' | 'luckbox' | null>(null);
  const [luckBoxResult, setLuckBoxResult] = useState<LuckBoxReward | null>(null);
  const [xpToApply, setXpToApply] = useState(0);

  const char = dungeonState.character;
  const run = dungeonState.currentRun;

  const handleCreateCharacter = (name: string, cls: any, sprite: string) => {
    createCharacter(name, cls, sprite);
    setView('lobby');
  };

  const handleStartDungeon = (rank: DungeonRank) => {
    startDungeon(rank);
    setView('dungeon');
  };

  const handleRoomComplete = (success: boolean) => {
    completeRoom(success);
    setTimeout(() => {
      // Check death
      if (dungeonState.character && dungeonState.character.currentHp <= 0) {
        setView('result');
        return;
      }
      // Auto-advance to next room or finish
      if (run && run.currentRoom + 1 >= run.rooms.length) {
        advanceRoom(); // marks dungeon complete
        setXpToApply(run.xpEarned);
        setView('reward'); // reward choice after full dungeon
      } else {
        advanceRoom();
        setView('dungeon');
      }
    }, 1800);
  };

  const handleRewardChoice = async (choice: 'heal' | 'luckbox') => {
    setRewardChoice(choice);
    if (choice === 'heal') {
      healCharacter();
    } else {
      if (!run) return;
      const reward = rollLuckBox(run.rank);
      setLuckBoxResult(reward);

      if (reward.type === 'dp' && reward.value && user) {
        try {
          const { data: dp } = await supabase
            .from('dark_points')
            .select('balance')
            .eq('user_id', user.id)
            .single();
          if (dp) {
            await supabase.from('dark_points').update({ balance: dp.balance + reward.value }).eq('user_id', user.id);
            await supabase.from('dp_transactions').insert({
              user_id: user.id, amount: reward.value, type: 'dungeon_reward',
              description: `Recompensa de mazmorra ${run.rank}`,
            });
          }
        } catch { /* ignore */ }
      }
    }
  };

  const handleAfterReward = () => {
    setView('result');
  };

  const handleEscape = () => {
    if (!char || !run) return;
    const cost = getEscapeCost(char);
    if (char.currentStamina < cost) return;
    escapeDungeon();
    setXpToApply(run.xpEarned);
    setView('result');
  };

  const handleFinish = () => {
    clearRun();
    setView(dungeonState.character ? 'lobby' : 'create');
    setRewardChoice(null);
    setLuckBoxResult(null);
    setXpToApply(0);
  };

  return (
    <VictorianFrame>
      <div className="text-center mb-4 animate-slide-down">
        <h1 className="font-display text-xl uppercase tracking-[0.3em] text-primary text-glow-primary">
          ⚔️ Mazmorras
        </h1>
      </div>

      {/* Character HUD */}
      {char && view !== 'create' && (
        <div className="rpg-panel mb-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{char.sprite}</span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm text-foreground">{char.name}</span>
                <span className="text-[9px] font-display text-muted-foreground uppercase">
                  Mazmorras: {char.dungeonsCleared}
                </span>
              </div>
              {/* HP Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-[9px] font-display text-stat-vit">❤️ HP</span>
                  <span className="text-[9px] font-display text-muted-foreground">{char.currentHp}/{char.maxHp}</span>
                </div>
                <div className="stat-bar-track h-2">
                  <div
                    className="stat-bar-fill transition-all duration-500"
                    style={{
                      width: `${(char.currentHp / char.maxHp) * 100}%`,
                      backgroundColor: char.currentHp / char.maxHp > 0.5 ? 'hsl(var(--stat-agi))' : char.currentHp / char.maxHp > 0.25 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))',
                    }}
                  />
                </div>
              </div>
              {/* Stamina Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-[9px] font-display text-primary">💨 Stamina</span>
                  <span className="text-[9px] font-display text-muted-foreground">{char.currentStamina}/{char.maxStamina}</span>
                </div>
                <div className="stat-bar-track h-1.5">
                  <div className="stat-bar-fill bg-primary transition-all duration-500" style={{ width: `${(char.currentStamina / char.maxStamina) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARACTER CREATION */}
      {view === 'create' && (
        <CharacterCreation onCreate={handleCreateCharacter} />
      )}

      {/* LOBBY */}
      {view === 'lobby' && (
        <div className="space-y-3 animate-slide-up">
          <div className="text-center mb-2">
            <p className="text-xs text-muted-foreground">Selecciona una mazmorra</p>
          </div>

          {ranks.map(rank => {
            const config = DUNGEON_RANKS[rank];
            const available = isDungeonAvailable(rank, dungeonState.cooldowns);
            const cooldown = getCooldownRemaining(rank, dungeonState.cooldowns);
            const danger = state.level < config.recommendedLevel;

            return (
              <button
                key={rank}
                onClick={() => available && handleStartDungeon(rank)}
                disabled={!available}
                className={`w-full p-4 border rounded-lg text-left transition-all ${
                  available
                    ? 'border-border hover:border-primary/40 bg-secondary/20 hover:bg-secondary/40'
                    : 'border-border/30 bg-secondary/10 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-display text-sm uppercase tracking-wider ${config.color}`}>
                          {config.label}
                        </span>
                        {danger && <span className="text-[8px] text-destructive font-display animate-pulse">⚠️ PELIGRO</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {config.rooms} salas · Nv. {config.recommendedLevel}+
                      </div>
                    </div>
                  </div>
                  {cooldown ? (
                    <span className="text-[10px] font-display text-muted-foreground">{cooldown}</span>
                  ) : (
                    <span className="text-[10px] font-display text-accent">→</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DUNGEON RUN */}
      {view === 'dungeon' && run && run.status === 'active' && char && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex gap-1">
            {run.rooms.map((r, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i < run.currentRoom ? (r.completed ? 'bg-accent' : 'bg-destructive')
                    : i === run.currentRoom ? 'bg-primary animate-pulse'
                    : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          <DungeonRoom
            room={run.rooms[run.currentRoom]}
            roomNumber={run.currentRoom + 1}
            totalRooms={run.rooms.length}
            charClass={char.className}
            onComplete={handleRoomComplete}
          />

          {/* Escape button */}
          <button
            onClick={handleEscape}
            disabled={char.currentStamina < getEscapeCost(char)}
            className="w-full py-2 text-[10px] font-display uppercase tracking-[0.15em] border border-destructive/30 text-destructive/70 hover:bg-destructive/10 transition-all disabled:opacity-30"
          >
            🏃 Escapar ({getEscapeCost(char)} stamina)
          </button>
        </div>
      )}

      {/* REWARD CHOICE */}
      {view === 'reward' && run && char && (
        <div className="space-y-4 animate-slide-up">
          <div className="text-center">
            <div className="hud-label">Sala completada</div>
            <div className="text-xs text-accent font-display mt-1">+{run.rooms[run.currentRoom]?.xpReward || 0} XP</div>
          </div>

          {!rewardChoice ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRewardChoice('heal')}
                className="rpg-panel-glow py-6 flex flex-col items-center gap-2 hover:border-stat-agi/40 transition-all"
              >
                <span className="text-3xl">❤️‍🩹</span>
                <span className="font-display text-[10px] uppercase tracking-wider text-stat-agi">
                  Recuperación Total
                </span>
                <span className="text-[8px] text-muted-foreground">
                  HP al máximo
                </span>
              </button>
              <button
                onClick={() => handleRewardChoice('luckbox')}
                className="rpg-panel-glow py-6 flex flex-col items-center gap-2 hover:border-accent/40 transition-all"
              >
                <span className="text-3xl">🎁</span>
                <span className="font-display text-[10px] uppercase tracking-wider text-accent">
                  Caja de Suerte
                </span>
                <span className="text-[8px] text-muted-foreground">
                  Items y recompensas
                </span>
              </button>
            </div>
          ) : rewardChoice === 'heal' ? (
            <div className="rpg-panel-glow py-6 text-center animate-scale-up">
              <span className="text-4xl">❤️‍🩹</span>
              <div className="font-display text-sm text-stat-agi mt-2">HP Restaurado</div>
            </div>
          ) : luckBoxResult ? (
            <div className="rpg-panel-glow py-6 text-center space-y-2 animate-scale-up">
              <span className="text-4xl">{luckBoxResult.icon}</span>
              <div className={`font-display text-sm ${RARITY_COLORS[luckBoxResult.rarity]}`}>
                {luckBoxResult.label}
              </div>
              <div className={`text-[10px] font-display uppercase tracking-wider ${RARITY_COLORS[luckBoxResult.rarity]}`}>
                {luckBoxResult.rarity}
              </div>
            </div>
          ) : null}

          {rewardChoice && (
            <button
              onClick={handleAfterReward}
              className="w-full py-3 font-display text-xs uppercase tracking-[0.2em] border border-primary/40 text-primary hover:bg-primary/10 transition-all"
              style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
            >
              Finalizar Mazmorra
            </button>
          )}
        </div>
      )}

      {/* RESULT */}
      {view === 'result' && (
        <div className="space-y-4 animate-slide-up">
          <div className="rpg-panel-glow py-8 text-center space-y-3">
            {run?.status === 'completed' ? (
              <>
                <span className="text-5xl">🏆</span>
                <div className="font-display text-lg text-accent uppercase tracking-wider">
                  ¡Mazmorra Completada!
                </div>
              </>
            ) : run?.status === 'dead' ? (
              <>
                <span className="text-5xl">💀</span>
                <div className="font-display text-lg text-destructive uppercase tracking-wider">
                  Personaje Eliminado
                </div>
                <div className="text-xs text-muted-foreground">
                  Tu personaje ha caído. Deberás crear uno nuevo.
                </div>
                <div className="text-xs text-destructive">
                  -50% XP del nivel actual
                </div>
              </>
            ) : run?.status === 'fled' ? (
              <>
                <span className="text-5xl">🏃</span>
                <div className="font-display text-lg text-muted-foreground uppercase tracking-wider">
                  Escapaste
                </div>
              </>
            ) : null}

            {run && (
              <div className="text-sm text-accent font-display">
                XP ganada: +{run.xpEarned}
              </div>
            )}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 font-display text-xs uppercase tracking-[0.2em] border border-primary/40 text-primary hover:bg-primary/10 transition-all"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            {dungeonState.character ? 'Volver al Lobby' : 'Crear Nuevo Personaje'}
          </button>
        </div>
      )}
    </VictorianFrame>
  );
}
