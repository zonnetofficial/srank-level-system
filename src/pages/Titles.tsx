import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import ClassChallengeDialog from '@/components/ClassChallengeDialog';
import {
  STAT_LABELS,
  STAT_ICONS,
  StatKey,
  getSkillTitle,
  getNextSkillTitle,
  getClassTitle,
  getNextClassTitle,
} from '@/lib/gameData';
import { getClassChallenge } from '@/lib/classChallenges';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Titles = () => {
  const { state, completeClassChallengeTask } = useGameState();
  const navigate = useNavigate();
  const currentClass = getClassTitle(state.level, state.classTitles);
  const nextClass = getNextClassTitle(state.level, state.classTitles);
  const obtainedClasses = state.classTitles.filter(t => t.obtained);

  // Find eligible (level reached but not obtained) classes
  const eligibleClasses = state.classTitles.filter(
    t => !t.obtained && state.level >= t.requiredLevel
  );

  const [challengeClass, setChallengeClass] = useState<string | null>(null);
  const activeChallenge = challengeClass ? getClassChallenge(challengeClass) : null;
  const completedStats = challengeClass ? (state.classChangeProgress[challengeClass] || []) : [];

  const handleCompleteTask = (stat: StatKey) => {
    if (challengeClass) {
      completeClassChallengeTask(challengeClass, stat);
    }
  };

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

        {/* Eligible classes - challenge available */}
        {eligibleClasses.length > 0 && (
          <div className="mt-4 space-y-2">
            {eligibleClasses.map(t => {
              const progress = state.classChangeProgress[t.name] || [];
              return (
                <button
                  key={t.name}
                  onClick={() => setChallengeClass(t.name)}
                  className="w-full text-left p-3 rounded-lg border border-accent/40 bg-accent/5 hover:bg-accent/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="font-display text-sm font-bold text-accent">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Desafío disponible • {progress.length}/5 completados
                      </div>
                    </div>
                    <span className="text-xs font-display text-accent animate-pulse">⚔️</span>
                  </div>
                  {progress.length > 0 && (
                    <div className="mt-2 stat-bar-track h-1.5">
                      <div className="stat-bar-fill bg-accent/60" style={{ width: `${(progress.length / 5) * 100}%` }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {nextClass && !eligibleClasses.find(t => t.name === nextClass.name) && (
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

      {/* Class Challenge Dialog */}
      <ClassChallengeDialog
        challenge={activeChallenge}
        completedStats={completedStats}
        open={!!challengeClass}
        onCompleteTask={handleCompleteTask}
        onClose={() => setChallengeClass(null)}
      />
    </VictorianFrame>
  );
};

export default Titles;
