import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import { useGameState } from '@/hooks/useGameState';
import { getActiveMission, MandatoryMission as MissionType } from '@/lib/mandatoryMissions';
import MemoryGame from '@/components/minigames/MemoryGame';
import ReactionGame from '@/components/minigames/ReactionGame';
import MathGame from '@/components/minigames/MathGame';
import { RARITY_LABELS } from '@/components/shop/shopConstants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-stat-agi',
  rare: 'text-primary',
  epic: 'text-stat-vit',
  legendary: 'text-accent',
};

const MandatoryMissionPage = () => {
  const navigate = useNavigate();
  const { state, completeMandatoryMission, failMandatoryMission } = useGameState();
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<'won' | 'lost' | null>(null);
  const [droppedItem, setDroppedItem] = useState<{ name: string; icon: string; rarity: string } | null>(null);

  const mission = state.missionSchedule ? getActiveMission(state.missionSchedule) : null;

  const handleComplete = useCallback(async (success: boolean) => {
    if (success) {
      setResult('won');
      completeMandatoryMission();

      // Try to drop an item from the shop based on rarity
      if (user && mission) {
        try {
          const { data: items } = await supabase
            .from('shop_items')
            .select('*')
            .eq('is_active', true)
            .eq('rarity', mission.rewardRarity);

          if (items && items.length > 0) {
            const item = items[Math.floor(Math.random() * items.length)];

            // Check existing inventory
            const { data: existing } = await supabase
              .from('user_inventory')
              .select('*')
              .eq('user_id', user.id)
              .eq('item_id', item.id)
              .maybeSingle();

            if (existing) {
              await supabase
                .from('user_inventory')
                .update({ quantity: existing.quantity + 1 })
                .eq('id', existing.id);
            } else {
              await supabase.from('user_inventory').insert({
                user_id: user.id,
                item_id: item.id,
                quantity: 1,
                source: 'mission_drop',
              });
            }

            setDroppedItem({ name: item.name, icon: item.icon, rarity: item.rarity });
            toast({
              title: `${item.icon} ¡Item obtenido!`,
              description: `${item.name} (${RARITY_LABELS[item.rarity] || item.rarity})`,
            });
          }
        } catch (e) {
          console.error('Error dropping item:', e);
        }
      }
    } else {
      setResult('lost');
      failMandatoryMission();
    }
  }, [completeMandatoryMission, failMandatoryMission, user, mission]);

  if (!mission) {
    return (
      <VictorianFrame>
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors animate-slide-down"
        >
          ← Volver
        </button>
        <div className="text-center py-16 animate-slide-up">
          <span className="text-5xl block mb-3">🛡️</span>
          <h2 className="font-display text-lg text-muted-foreground">No hay misión obligatoria activa</h2>
          <p className="text-xs text-muted-foreground/60 mt-2">Las misiones aparecen 1-3 veces cada 2 semanas</p>
        </div>
      </VictorianFrame>
    );
  }

  return (
    <VictorianFrame>
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors animate-slide-down"
      >
        ← Volver
      </button>

      {/* Mission header */}
      {!playing && !result && (
        <div className="space-y-5 animate-slide-up">
          <div className="rpg-panel-glow text-center py-8">
            <div className="text-5xl mb-3">{mission.icon}</div>
            <h1 className="font-display text-xl font-bold text-destructive uppercase tracking-wider mb-1">
              ⚠️ Misión Obligatoria
            </h1>
            <h2 className="font-display text-lg text-foreground mb-2">{mission.title}</h2>
            <p className="text-sm text-muted-foreground">{mission.description}</p>
          </div>

          <div className="rpg-panel space-y-2">
            <div className="flex justify-between text-xs">
              <span className="hud-label">Dificultad</span>
              <span className="font-display text-foreground">{'⭐'.repeat(mission.difficulty)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="hud-label">Recompensa</span>
              <span className={`font-display ${RARITY_COLORS[mission.rewardRarity]}`}>
                Item {RARITY_LABELS[mission.rewardRarity]}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="hud-label">Penalización</span>
              <span className="font-display text-destructive">-50% XP del nivel</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="hud-label">Límite</span>
              <span className="font-display text-primary">Hoy antes de medianoche</span>
            </div>
          </div>

          <button
            onClick={() => setPlaying(true)}
            className="w-full py-4 bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.2em] hover:bg-destructive/30 transition-all animate-pulse-glow"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            ⚔️ Iniciar Misión
          </button>
        </div>
      )}

      {/* Playing */}
      {playing && !result && (
        <div className="animate-slide-up">
          <div className="mb-3 text-center">
            <span className="hud-label text-destructive">⚠️ {mission.title} — EN PROGRESO</span>
          </div>
          {mission.type === 'memory' && <MemoryGame difficulty={mission.difficulty} onComplete={handleComplete} />}
          {mission.type === 'reaction' && <ReactionGame difficulty={mission.difficulty} onComplete={handleComplete} />}
          {mission.type === 'math' && <MathGame difficulty={mission.difficulty} onComplete={handleComplete} />}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="text-center py-8 space-y-4 animate-scale-up">
          <div className="text-6xl">{result === 'won' ? '🏆' : '💀'}</div>
          <h2 className={`font-display text-2xl font-bold uppercase ${
            result === 'won' ? 'text-accent text-glow-accent' : 'text-destructive'
          }`}>
            {result === 'won' ? '¡Misión Superada!' : 'Misión Fallida'}
          </h2>

          {result === 'won' && droppedItem && (
            <div className="rpg-panel-glow py-4 animate-slide-up delay-300">
              <div className="text-3xl mb-1">{droppedItem.icon}</div>
              <div className={`font-display text-sm font-bold ${RARITY_COLORS[droppedItem.rarity]}`}>
                {droppedItem.name}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {RARITY_LABELS[droppedItem.rarity]} — Añadido al inventario
              </div>
            </div>
          )}

          {result === 'lost' && (
            <div className="rpg-panel py-4 border-destructive/30 animate-slide-up delay-300">
              <span className="text-sm text-destructive font-display">-50% XP del nivel actual</span>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 font-display text-xs uppercase tracking-[0.2em] border border-primary/30 text-primary hover:bg-primary/10 transition-all"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            Volver al Hub
          </button>
        </div>
      )}
    </VictorianFrame>
  );
};

export default MandatoryMissionPage;
