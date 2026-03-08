import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';
import RunTimer from '@/components/RunTimer';
import VictorianFrame from '@/components/VictorianFrame';

const DailyQuest = () => {
  const { state, today, todayQuest, restDay, completeQuest, completeExercise, completeRun } = useGameState();
  const navigate = useNavigate();
  const [timerOpen, setTimerOpen] = useState(false);

  const allExercisesDone = todayQuest?.exercises?.every(e => e.completed) ?? false;
  const runDone = todayQuest?.runCompleted ?? false;
  const canComplete = allExercisesDone && runDone;
  const completedCount = todayQuest?.exercises?.filter(e => e.completed).length ?? 0;
  const totalExercises = todayQuest?.exercises?.length ?? 0;

  return (
    <VictorianFrame>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors animate-slide-down"
      >
        ← Volver
      </button>

      {todayQuest?.status === 'pending' && (
        <div className="mb-4 flex items-center justify-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-display text-primary uppercase tracking-widest">En progreso</span>
        </div>
      )}

      {/* Rest Day */}
      {restDay && (
        <div className="rpg-panel-glow text-center py-10 animate-scale-up">
          <div className="text-6xl mb-4">💤</div>
          <h2 className="font-display text-xl font-bold text-accent text-glow-accent mb-2">Día de Descanso</h2>
          <p className="text-sm text-muted-foreground mb-2">Recovery Mission – Tu cuerpo se regenera</p>
          <p className="text-xs text-accent">+1 INT, +1 VIT registrados</p>
        </div>
      )}

      {/* Quest info header - shown when pending */}
      {todayQuest?.status === 'pending' && (
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="rpg-panel animate-slide-up delay-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Progreso General</span>
              <span className="text-xs font-display text-primary">
                {(runDone ? 1 : 0) + completedCount} / {1 + totalExercises}
              </span>
            </div>
            <div className="stat-bar-track h-2.5">
              <div
                className="stat-bar-fill bg-primary animate-bar-fill"
                style={{
                  width: `${(((runDone ? 1 : 0) + completedCount) / (1 + totalExercises)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Run section */}
          <div
            className={`rpg-panel cursor-pointer transition-all hover:border-primary/50 animate-slide-up delay-200 ${
              runDone ? 'border-accent/30' : 'animate-pulse-glow'
            }`}
            onClick={() => !runDone && setTimerOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                runDone
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-primary/10 border-primary/30'
              }`}>
                <span className="text-2xl">{runDone ? '✅' : '🏃'}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-display font-semibold uppercase tracking-wider ${
                    runDone ? 'text-accent' : 'text-primary'
                  }`}>
                    Carrera
                  </span>
                  {!runDone && (
                    <span className="text-[10px] font-display text-muted-foreground animate-pulse">
                      Toca para iniciar →
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {state.runMode === 'time'
                    ? `${state.runProgression} minutos`
                    : '5 km'}
                  {runDone && <span className="text-accent ml-2">• Completado</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="rpg-panel animate-slide-up delay-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stat-str/10 flex items-center justify-center border border-stat-str/20">
                  <span className="text-lg">💪</span>
                </div>
                <span className="text-sm font-display font-semibold uppercase tracking-wider text-stat-str">
                  Ejercicios
                </span>
              </div>
              <span className="text-xs font-display text-muted-foreground">
                {completedCount}/{totalExercises}
              </span>
            </div>

            <div className="space-y-1">
              {todayQuest.exercises?.map((ex, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-3 px-3 rounded-lg cursor-pointer transition-all animate-slide-up ${
                    ex.completed
                      ? 'bg-accent/5 border border-accent/15'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                  style={{ animationDelay: `${400 + i * 80}ms` }}
                  onClick={() => !ex.completed && completeExercise(i)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all ${
                      ex.completed
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-secondary border border-border text-muted-foreground'
                    }`}>
                      {ex.completed ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm transition-colors ${
                      ex.completed ? 'text-accent/80 line-through' : 'text-foreground'
                    }`}>
                      {ex.name}
                    </span>
                  </div>
                  <span className={`text-xs font-display ${
                    ex.completed ? 'text-accent/60' : 'text-muted-foreground'
                  }`}>
                    {ex.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete button */}
          <button
            onClick={completeQuest}
            disabled={!canComplete}
            className={`w-full py-4 rounded-lg font-display text-sm uppercase tracking-[0.2em] transition-all animate-slide-up delay-500 ${
              canComplete
                ? 'bg-accent text-accent-foreground glow-accent hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
            }`}
          >
            {canComplete ? '🏆 Completar Misión' : '⏳ Completa todas las tareas'}
          </button>

          <RunTimer
            totalMinutes={state.runMode === 'time' ? state.runProgression : 30}
            open={timerOpen}
            onClose={() => setTimerOpen(false)}
            onComplete={completeRun}
          />
        </div>
      )}

      {/* Quest completed */}
      {todayQuest?.status === 'completed' && (
        <div className="text-center">
          <div className="rpg-panel-glow py-10 animate-scale-up">
            <div className="text-6xl mb-4 animate-slide-nudge delay-200">🏆</div>
            <h2 className="font-display text-2xl font-bold text-accent text-glow-accent mb-2 animate-glitch-in delay-300">
              ¡Misión Completada!
            </h2>
            <div className="inline-block mt-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 animate-number-pop delay-500">
              <span className="text-sm font-display text-accent">
                +{10 + Math.floor(state.level * 2)} XP
              </span>
            </div>
          </div>
        </div>
      )}

    </VictorianFrame>
  );
};

export default DailyQuest;
