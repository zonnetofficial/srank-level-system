import { useState, useEffect, useCallback } from 'react';
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
  CLASS_INFO,
  type LuckBoxReward,
} from '@/lib/dungeonData';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ranks: DungeonRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
const RANK_ORDER: Record<string, number> = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };

type View = 'lobby' | 'create' | 'dungeon' | 'reward' | 'result';
type Tab = 'dungeons' | 'ranking';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  character_name: string | null;
  character_class: string | null;
  character_sprite: string | null;
  dungeons_cleared: number;
  highest_rank: string;
  total_xp_earned: number;
  deaths: number;
}

export default function Dungeons() {
  const { state } = useGameState();
  const { user } = useAuth();
  const {
    dungeonState, createCharacter, startDungeon,
    completeRoom, advanceRoom, escapeDungeon,
    healCharacter, clearRun,
  } = useDungeon(state.stats, state.level);

  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dungeons');
  const [view, setView] = useState<View>(dungeonState.character ? (dungeonState.currentRun?.status === 'active' ? 'dungeon' : 'lobby') : 'create');
  const [rewardChoice, setRewardChoice] = useState<'heal' | 'luckbox' | null>(null);
  const [luckBoxResult, setLuckBoxResult] = useState<LuckBoxReward | null>(null);
  const [xpToApply, setXpToApply] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  const char = dungeonState.character;
  const run = dungeonState.currentRun;

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLb(true);
    const { data } = await supabase
      .from('dungeon_profiles')
      .select('*')
      .order('dungeons_cleared', { ascending: false })
      .limit(50);
    if (data) setLeaderboard(data as LeaderboardEntry[]);
    setLoadingLb(false);
  }, []);

  useEffect(() => {
    if (tab === 'ranking') fetchLeaderboard();
  }, [tab, fetchLeaderboard]);

  // Sync dungeon profile to DB
  const syncProfile = useCallback(async (dungeonsCleared: number, rank: DungeonRank, xpEarned: number, died: boolean) => {
    if (!user || !char) return;
    try {
      // Get display name from profiles
      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
      const displayName = profile?.display_name || 'Cazador';

      // Upsert dungeon profile
      const { data: existing } = await supabase
        .from('dungeon_profiles')
        .select('dungeons_cleared, highest_rank, total_xp_earned, deaths')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const newHighest = RANK_ORDER[rank] > RANK_ORDER[existing.highest_rank] ? rank : existing.highest_rank;
        await supabase.from('dungeon_profiles').update({
          display_name: displayName,
          character_name: char.name,
          character_class: char.className,
          character_sprite: char.sprite,
          dungeons_cleared: existing.dungeons_cleared + (died ? 0 : 1),
          highest_rank: newHighest,
          total_xp_earned: existing.total_xp_earned + xpEarned,
          deaths: existing.deaths + (died ? 1 : 0),
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
      } else {
        await supabase.from('dungeon_profiles').insert({
          user_id: user.id,
          display_name: displayName,
          character_name: char.name,
          character_class: char.className,
          character_sprite: char.sprite,
          dungeons_cleared: died ? 0 : 1,
          highest_rank: rank,
          total_xp_earned: xpEarned,
          deaths: died ? 1 : 0,
        });
      }
    } catch { /* ignore */ }
  }, [user, char]);

  const handleCreateCharacter = async (name: string, cls: any, sprite: string) => {
    createCharacter(name, cls, sprite);
    setView('lobby');
  };

  const handleStartDungeon = (rank: DungeonRank) => {
    startDungeon(rank);
    setView('dungeon');
  };

  const handleRoomComplete = (success: boolean) => {
    completeRoom(success);
    // Use a small delay then check updated state via the setter pattern
    setTimeout(() => {
      // We need to read current state - dungeonState may be stale in this closure
      // Instead, check run status which is updated synchronously by completeRoom
    }, 1800);
  };

  // Watch for death or room completion after completeRoom runs
  useEffect(() => {
    if (!run) return;
    if (view !== 'dungeon') return;
    
    if (run.status === 'dead') {
      syncProfile(0, run.rank, run.xpEarned, true);
      setView('result');
      return;
    }

    // Check if current room was just completed
    const currentRoom = run.rooms[run.currentRoom];
    if (currentRoom?.completed) {
      const timer = setTimeout(() => {
        if (run.currentRoom + 1 >= run.rooms.length) {
          advanceRoom();
          setXpToApply(run.xpEarned);
          setView('reward');
        } else {
          advanceRoom();
          setView('dungeon');
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [run?.status, run?.rooms, run?.currentRoom, view]);

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

  const handleAfterReward = async () => {
    // Sync completed dungeon to leaderboard
    if (run) await syncProfile(1, run.rank, run.xpEarned, false);
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

  // When in dungeon or result, hide tabs
  const showTabs = view === 'lobby' || view === 'create';

  return (
    <VictorianFrame>
      <div className="text-center mb-4 animate-slide-down">
        <h1 className="font-display text-xl uppercase tracking-[0.3em] text-primary text-glow-primary">
          ⚔️ Mazmorras
        </h1>
      </div>

      {/* Tabs */}
      {showTabs && (
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => setTab('dungeons')}
            className={`flex-1 py-2 text-[10px] font-display uppercase tracking-wider transition-all ${
              tab === 'dungeons' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            🏰 Mazmorras
          </button>
          <button
            onClick={() => setTab('ranking')}
            className={`flex-1 py-2 text-[10px] font-display uppercase tracking-wider transition-all ${
              tab === 'ranking' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'
            }`}
          >
            🏆 Ranking
          </button>
        </div>
      )}

      {/* Character HUD */}
      {char && view !== 'create' && tab === 'dungeons' && (
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

      {/* RANKING TAB */}
      {tab === 'ranking' && showTabs && (
        <div className="space-y-3 animate-slide-up">
          {loadingLb ? (
            <div className="text-center py-8 text-muted-foreground text-xs font-display animate-pulse">
              Cargando ranking...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs font-display">
              No hay cazadores registrados aún
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const isMe = user?.id === entry.user_id;
              return (
                <div
                  key={entry.id}
                  className={`rpg-panel p-3 flex items-center gap-3 ${isMe ? 'border-primary/40' : ''}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-display text-sm ${
                    i === 0 ? 'bg-accent/20 text-accent' : i === 1 ? 'bg-muted text-foreground' : i === 2 ? 'bg-stat-end/20 text-stat-end' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-xl">{entry.character_sprite || '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs text-foreground truncate">
                        {entry.character_name || entry.display_name}
                      </span>
                      {entry.character_class && (
                        <span className="text-[9px] text-muted-foreground">
                          {CLASS_INFO[entry.character_class as keyof typeof CLASS_INFO]?.icon}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-[9px] text-muted-foreground">
                      <span>🏰 {entry.dungeons_cleared}</span>
                      <span className={DUNGEON_RANKS[entry.highest_rank as DungeonRank]?.color || ''}>
                        Max: {entry.highest_rank}
                      </span>
                      <span>💀 {entry.deaths}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-display text-accent">{entry.total_xp_earned}</div>
                    <div className="text-[8px] text-muted-foreground">XP total</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DUNGEONS TAB */}
      {tab === 'dungeons' && (
        <>
          {/* CHARACTER CREATION */}
          {view === 'create' && (
            <CharacterCreation onCreate={handleCreateCharacter} />
          )}

          {/* LOBBY */}
          {view === 'lobby' && (
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigate('/')}
                  className="text-[10px] font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Volver
                </button>
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
                <div className="hud-label">🏆 Mazmorra Completada</div>
                <div className="text-xs text-accent font-display mt-1">+{run.xpEarned} XP total</div>
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
                    <span className="text-[8px] text-muted-foreground">HP al máximo</span>
                  </button>
                  <button
                    onClick={() => handleRewardChoice('luckbox')}
                    className="rpg-panel-glow py-6 flex flex-col items-center gap-2 hover:border-accent/40 transition-all"
                  >
                    <span className="text-3xl">🎁</span>
                    <span className="font-display text-[10px] uppercase tracking-wider text-accent">
                      Caja de Suerte
                    </span>
                    <span className="text-[8px] text-muted-foreground">Items y recompensas</span>
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
                    <div className="text-xs text-destructive">-50% XP del nivel actual</div>
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
                  <div className="text-sm text-accent font-display">XP ganada: +{run.xpEarned}</div>
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
        </>
      )}
    </VictorianFrame>
  );
}
