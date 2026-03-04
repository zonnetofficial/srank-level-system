import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';

const DailyQuest = () => {
  const { state, today, todayQuest, restDay, startQuest, completeQuest } = useGameState();
  const navigate = useNavigate();

  // Auto-start if no quest today
  const hasQuest = !!todayQuest;

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6">
        ⚔️ Daily Quest
      </h1>

      <div className="text-center text-xs font-display text-muted-foreground mb-4 uppercase tracking-wider">
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      {/* Rest Day */}
      {restDay && !hasQuest && (
        <div className="rpg-panel-glow text-center py-8">
          <div className="text-5xl mb-3">💤</div>
          <h2 className="font-display text-lg font-bold text-accent mb-2">Día de Descanso</h2>
          <p className="text-sm text-muted-foreground mb-4">Recovery Mission – Tu cuerpo se regenera</p>
          <button
            onClick={startQuest}
            className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Registrar Descanso
          </button>
        </div>
      )}

      {/* No quest started */}
      {!restDay && !hasQuest && (
        <div className="rpg-panel-glow text-center py-8">
          <div className="text-5xl mb-3 animate-float">⚔️</div>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Misión Disponible</h2>

          {/* Quest details */}
          <div className="text-left rpg-panel mb-4 space-y-2">
            <div className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              🏃 Carrera
            </div>
            <div className="text-sm text-foreground">
              {state.runMode === 'time'
                ? `Correr ${state.runProgression} minutos`
                : 'Correr 5 km (registrar tiempo)'}
            </div>

            <div className="text-xs font-display uppercase tracking-wider text-muted-foreground mt-3 mb-2">
              💪 Ejercicios
            </div>
            {state.exerciseProgression.map((ex, i) => (
              <div key={i} className="text-sm text-foreground">
                {ex.name}: {ex.reps} reps
              </div>
            ))}
          </div>

          <button
            onClick={startQuest}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider glow-primary hover:opacity-90 transition-opacity"
          >
            Aceptar Misión
          </button>
        </div>
      )}

      {/* Quest in progress */}
      {todayQuest?.status === 'pending' && (
        <div className="space-y-4">
          <div className="rpg-panel animate-pulse-glow">
            <div className="text-xs font-display uppercase tracking-wider text-primary mb-3">
              🏃 Carrera
            </div>
            <div className="text-sm text-foreground mb-1">
              {state.runMode === 'time'
                ? `Correr ${state.runProgression} minutos`
                : 'Correr 5 km'}
            </div>
            <div className="stat-bar-track h-2">
              <div className="stat-bar-fill bg-primary animate-shimmer" style={{ width: '0%' }} />
            </div>
          </div>

          <div className="rpg-panel">
            <div className="text-xs font-display uppercase tracking-wider text-stat-str mb-3">
              💪 Ejercicios
            </div>
            {state.exerciseProgression.map((ex, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{ex.name}</span>
                <span className="text-sm font-display text-muted-foreground">{ex.reps} reps</span>
              </div>
            ))}
          </div>

          <button
            onClick={completeQuest}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.2em] glow-primary hover:opacity-90 transition-opacity"
          >
            ✅ Misión Completada
          </button>
        </div>
      )}

      {/* Quest completed */}
      {todayQuest?.status === 'completed' && (
        <div className="rpg-panel-glow text-center py-8">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="font-display text-lg font-bold text-accent text-glow-accent mb-2">
            ¡Misión Completada!
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            +{10 + Math.floor(state.level * 2)} XP ganados
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Volver al Home
          </button>
        </div>
      )}

      {/* Rest registered */}
      {todayQuest?.status === 'rest' && (
        <div className="rpg-panel text-center py-8">
          <div className="text-5xl mb-3">💤</div>
          <h2 className="font-display text-lg font-bold text-accent mb-2">Día de Descanso</h2>
          <p className="text-sm text-muted-foreground">Recuperación registrada</p>
        </div>
      )}
    </div>
  );
};

export default DailyQuest;
