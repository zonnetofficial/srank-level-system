import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import {
  STAT_LABELS,
  STAT_ICONS,
  StatKey,
  getSkillTitle,
  getNextSkillTitle,
  getClassTitle,
  getNextClassTitle,
} from '@/lib/gameData';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Titles = () => {
  const { state } = useGameState();
  const navigate = useNavigate();
  const currentClass = getClassTitle(state.level, state.classTitles);
  const nextClass = getNextClassTitle(state.level, state.classTitles);
  const obtainedClasses = state.classTitles.filter(t => t.obtained);

  return (
    <VictorianFrame>
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors"
      >
        ← Volver
      </button>
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6">
        🏷️ Títulos
      </h1>

      {/* Class Titles */}
      <div className="rpg-panel mb-4">
        <h2 className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-4">
          🧙‍♂️ Clases
        </h2>

        <div className="space-y-2">
          {obtainedClasses.map(t => (
            <div
              key={t.name}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                t.name === currentClass.name
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-secondary/30'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <div>
                <div className="font-display text-sm font-bold text-foreground">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">Nv. {t.requiredLevel}</div>
              </div>
              {t.name === currentClass.name && (
                <span className="ml-auto text-xs font-display text-primary">ACTIVO</span>
              )}
            </div>
          ))}
        </div>

        {nextClass && (
          <div className="mt-4 p-3 rounded-lg border border-border border-dashed">
            <div className="text-xs text-muted-foreground mb-1">
              Siguiente: {nextClass.icon} {nextClass.name}
            </div>
            <div className="stat-bar-track h-2">
              <div
                className="stat-bar-fill bg-accent/60"
                style={{
                  width: `${Math.min((state.level / nextClass.requiredLevel) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Nv. {state.level} / {nextClass.requiredLevel}
            </div>
          </div>
        )}
      </div>

      {/* Skill Titles */}
      <div className="rpg-panel">
        <h2 className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-4">
          📊 Títulos por Skill
        </h2>

        <div className="space-y-4">
          {statKeys.map(key => {
            const current = getSkillTitle(key, state.statPoints[key]);
            const next = getNextSkillTitle(key, state.statPoints[key]);

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">
                    {STAT_ICONS[key]}{' '}
                    <span className={`font-display font-bold text-stat-${key}`}>
                      {current.name}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {state.statPoints[key]} pts
                  </span>
                </div>
                {next && (
                  <>
                    <div className="stat-bar-track h-1.5">
                      <div
                        className={`stat-bar-fill bg-stat-${key}/60`}
                        style={{
                          width: `${Math.min(
                            ((state.statPoints[key] - current.requiredPoints) /
                              (next.requiredPoints - current.requiredPoints)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Siguiente: {next.name} ({next.requiredPoints} pts)
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </VictorianFrame>
  );
};

export default Titles;
