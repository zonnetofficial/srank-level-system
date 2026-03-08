import { useState, useEffect } from 'react';
import { XPBar } from '@/components/XPBar';
import VictorianFrame from '@/components/VictorianFrame';
import { StatBar } from '@/components/StatBar';
import { useGameState } from '@/hooks/useGameState';
import {
  STAT_LABELS,
  STAT_ICONS,
  StatKey,
  getClassTitle,
  getNextClassTitle,
} from '@/lib/gameData';
import { useNavigate } from 'react-router-dom';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Index = () => {
  const { state, todayQuest, restDay, timeWarning, dismissTimeWarning } = useGameState();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentClass = getClassTitle(state.level, state.classTitles);
  const nextClass = getNextClassTitle(state.level, state.classTitles);

  return (
    <VictorianFrame>
      {/* Time warning */}
      {timeWarning && (
        <div
          className="mb-4 p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm font-body cursor-pointer"
          onClick={dismissTimeWarning}
        >
          ⚠️ Time manipulation detected. Progress may be locked.
        </div>
      )}

      {/* Time display */}
      <div className="text-center mb-4">
        <div className="text-xs font-display text-muted-foreground uppercase tracking-wider">
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="text-lg font-display text-primary text-glow-primary">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Level & XP */}
      <XPBar xp={state.xp} xpToNext={state.xpToNext} level={state.level} />

      {/* Class Title */}
      <div className="mt-4 text-center">
        <div className="text-xs font-display uppercase tracking-[0.2em] text-muted-foreground">
          Clase Actual
        </div>
        <div className="text-xl font-display font-bold text-accent text-glow-accent mt-1">
          {currentClass.icon} {currentClass.name}
        </div>
        {nextClass && (
          <div className="mt-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Siguiente: {nextClass.name} (Nv. {nextClass.requiredLevel})
            </div>
            <div className="stat-bar-track h-1.5 mt-1 max-w-48 mx-auto">
              <div
                className="stat-bar-fill bg-accent/60"
                style={{
                  width: `${Math.min((state.level / nextClass.requiredLevel) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 rpg-panel space-y-3">
        <h2 className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Stats
        </h2>
        {statKeys.map(key => (
          <StatBar
            key={key}
            stat={key}
            value={state.stats[key]}
            points={state.statPoints[key]}
            label={STAT_LABELS[key]}
            icon={STAT_ICONS[key]}
          />
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/quest')}
          className="rpg-panel animate-pulse-glow flex flex-col items-center gap-2 py-5 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">{restDay ? '💤' : '⚔️'}</span>
          <span className="font-display text-xs uppercase tracking-wider text-primary">
            {todayQuest?.status === 'completed'
              ? '✅ Completada'
              : restDay
              ? 'Día de Descanso'
              : 'Daily Quest'}
          </span>
        </button>
        <button
          onClick={() => navigate('/skills')}
          className="rpg-panel flex flex-col items-center gap-2 py-5 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">✨</span>
          <span className="font-display text-xs uppercase tracking-wider text-foreground">
            Skills
          </span>
        </button>
        <button
          onClick={() => navigate('/titles')}
          className="rpg-panel flex flex-col items-center gap-2 py-5 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">🏷️</span>
          <span className="font-display text-xs uppercase tracking-wider text-foreground">
            Títulos
          </span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="rpg-panel flex flex-col items-center gap-2 py-5 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">📜</span>
          <span className="font-display text-xs uppercase tracking-wider text-foreground">
            Historial
          </span>
        </button>
      </div>

      {/* Streak */}
      <div className="mt-4 flex justify-center gap-6 text-center">
        <div>
          <div className="font-display text-2xl font-bold text-primary">{state.currentStreak}</div>
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Racha</div>
        </div>
        <div>
          <div className="font-display text-2xl font-bold text-accent">{state.totalCompleted}</div>
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Completadas</div>
        </div>
        <div>
          <div className="font-display text-2xl font-bold text-foreground">{state.personalRecords.longestStreak}</div>
          <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Mejor Racha</div>
        </div>
      </div>
    </VictorianFrame>
  );
};

export default Index;
