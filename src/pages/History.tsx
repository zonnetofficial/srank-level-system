import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import SlotNumber from '@/components/SlotNumber';

const statusIcons: Record<string, string> = {
  completed: '✅',
  failed: '❌',
  rest: '💤',
  pending: '⏳',
};

const statusLabels: Record<string, string> = {
  completed: 'Completada',
  failed: 'Fallida',
  rest: 'Descanso',
  pending: 'Pendiente',
};

const History = () => {
  const { state, resetGame } = useGameState();
  const navigate = useNavigate();
  const sortedLog = [...state.questLog].reverse();

  return (
    <VictorianFrame>
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors animate-slide-down"
      >
        ← Volver
      </button>
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6 animate-glitch-in delay-100">
        📜 Historial
      </h1>

      {/* Records */}
      <div className="rpg-panel mb-4 animate-slide-up delay-200">
        <h2 className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-3">
          🏆 Récords Personales
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="font-display text-xl font-bold text-accent">
              <SlotNumber value={state.personalRecords.longestStreak} delay={400} />
            </div>
            <div className="text-[10px] text-muted-foreground font-display uppercase">Mejor Racha</div>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-primary">
              <SlotNumber value={state.personalRecords.maxLevel} delay={500} />
            </div>
            <div className="text-[10px] text-muted-foreground font-display uppercase">Max Nivel</div>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-foreground">
              <SlotNumber value={state.totalCompleted} delay={600} />
            </div>
            <div className="text-[10px] text-muted-foreground font-display uppercase">Total</div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="rpg-panel mb-4 animate-slide-up delay-300">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completadas</span>
          <span className="text-foreground font-display"><SlotNumber value={state.totalCompleted} delay={500} /></span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Fallidas</span>
          <span className="text-destructive font-display"><SlotNumber value={state.totalFailed} delay={600} /></span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Racha actual</span>
          <span className="text-primary font-display"><SlotNumber value={state.currentStreak} delay={700} /></span>
        </div>
      </div>

      {/* Quest Log */}
      <div className="rpg-panel animate-slide-up delay-400">
        <h2 className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Registro de Misiones
        </h2>
        {sortedLog.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 animate-fade-in">
            Sin misiones registradas aún
          </p>
        ) : (
          <div className="space-y-2">
            {sortedLog.map((q, i) => (
              <div
                key={q.date}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 animate-slide-up"
                style={{ animationDelay: `${500 + i * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span>{statusIcons[q.status]}</span>
                  <span className="text-sm font-display text-foreground">{q.date}</span>
                </div>
                <span className="text-xs text-muted-foreground">{statusLabels[q.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="mt-8 text-center animate-fade-in delay-600">
        <button
          onClick={() => {
            if (window.confirm('¿Resetear todo el progreso? Esta acción no se puede deshacer.')) {
              resetGame();
            }
          }}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors font-display uppercase tracking-wider"
        >
          Resetear Progreso
        </button>
      </div>
    </VictorianFrame>
  );
};

export default History;
