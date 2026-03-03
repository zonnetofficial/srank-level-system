import { XPBar } from '@/components/XPBar';
import { StatBar } from '@/components/StatBar';
import { useGameState } from '@/hooks/useGameState';
import {
  STAT_LABELS,
  STAT_ICONS,
  StatKey,
  getSkillTitle,
  getNextSkillTitle,
  getClassTitle,
  getNextClassTitle,
} from '@/lib/gameData';
import { useNavigate } from 'react-router-dom';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Index = () => {
  const { state, todayQuest, restDay, timeWarning, dismissTimeWarning } = useGameState();
  const navigate = useNavigate();

  const currentClass = getClassTitle(state.level, state.classTitles);
  const nextClass = getNextClassTitle(state.level, state.classTitles);

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
      {/* Time warning */}
      {timeWarning && (
        <div
          className="mb-4 p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm font-body cursor-pointer"
          onClick={dismissTimeWarning}
        >
          ⚠️ Time manipulation detected. Progress may be locked.
        </div>
      )}

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
            label={STAT_LABELS[key]}
            icon={STAT_ICONS[key]}
          />
        ))}
      </div>

      {/* Skill Titles Preview */}
      <div className="mt-4 rpg-panel">
        <h2 className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Títulos de Skill
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {statKeys.map(key => {
            const current = getSkillTitle(key, state.statPoints[key]);
            return (
              <div key={key} className="text-xs">
                <span className="text-muted-foreground">{STAT_ICONS[key]}</span>{' '}
                <span className="font-display font-semibold text-foreground">{current.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
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
    </div>
  );
};

export default Index;
