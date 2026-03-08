import { useState, useMemo } from 'react';
import SudokuGame from './SudokuGame';
import { sfxPunishment } from '@/lib/audioEngine';

const PUNISHMENT_PHRASES = [
  'Es lamentable ver tu falta de compromiso. Si no deseas entrenar tu cuerpo, entonces entrenarás tu mente.',
  'Daily Quest fallida. Iniciando entrenamiento cognitivo.',
  'Tu crecimiento se ha detenido. Completa este ejercicio para restaurar tu progreso.',
  'La disciplina falló. Activando entrenamiento alternativo.',
  'No completaste tu misión. Tu castigo será poner a prueba tu intelecto.',
  'El guerrero que no entrena su cuerpo, deberá entrenar su mente.',
  'Has fallado. La debilidad tiene consecuencias. Demuestra tu valor mental.',
  'Tu falta de acción tiene un precio. Resuelve este desafío o paga las consecuencias.',
];

interface PunishmentOverlayProps {
  pendingCount: number;
  level: number;
  statPenalty: number;
  onComplete: () => void;
  onFail: () => void;
}

const PunishmentOverlay = ({ pendingCount, level, statPenalty, onComplete, onFail }: PunishmentOverlayProps) => {
  const [phase, setPhase] = useState<'phrase' | 'sudoku'>('phrase');

  const phrase = useMemo(
    () => PUNISHMENT_PHRASES[Math.floor(Math.random() * PUNISHMENT_PHRASES.length)],
    []
  );

  const difficulty: 'medium' | 'hard' = level >= 31 ? 'hard' : 'medium';
  const timeLimitSeconds = level <= 10 ? 600 : 300; // 10min for lvl1-10, 5min for 11+

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="w-full max-w-md px-4">
        {phase === 'phrase' ? (
          <div className="text-center space-y-6 animate-fade-in">
            {/* Dramatic icon */}
            <div className="text-7xl mb-4">⚠️</div>

            {/* Punishment count */}
            <div className="font-display text-xs uppercase tracking-[0.3em] text-destructive">
              Castigo {pendingCount > 1 ? `(${pendingCount} pendientes)` : ''}
            </div>

            {/* Stat penalty info */}
            <div className="rpg-panel border-destructive/40 bg-destructive/5">
              <div className="text-xs font-display text-destructive uppercase tracking-wider mb-1">
                Penalización aplicada
              </div>
              <div className="text-sm text-foreground">
                -{statPenalty} puntos en todas las estadísticas
              </div>
            </div>

            {/* Phrase */}
            <p className="font-display text-base text-foreground leading-relaxed italic">
              "{phrase}"
            </p>

            {/* Sudoku info */}
            <div className="text-xs text-muted-foreground">
              Dificultad: <span className="text-primary font-display uppercase">{difficulty === 'hard' ? 'Difícil' : 'Media'}</span>
              {' · '}
              Tiempo: <span className="text-primary font-display">{timeLimitSeconds / 60} min</span>
            </div>

            <button
              onClick={() => setPhase('sudoku')}
              className="px-8 py-3 rounded-lg bg-destructive text-destructive-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity glow-str"
            >
              Aceptar Castigo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-destructive mb-1">
                ⚠️ Sudoku de Castigo
              </h2>
              <p className="text-xs text-muted-foreground">
                Complétalo para recuperar +1 INT y ganar XP
              </p>
            </div>

            <SudokuGame
              difficulty={difficulty}
              timeLimitSeconds={timeLimitSeconds}
              onComplete={onComplete}
              onFail={onFail}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PunishmentOverlay;
