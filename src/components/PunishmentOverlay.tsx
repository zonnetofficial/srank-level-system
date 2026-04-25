import { useState, useMemo } from 'react';
import SudokuGame from './SudokuGame';
import MathGame from './minigames/MathGame';
import MemoryGame from './minigames/MemoryGame';
import PatternGame from './minigames/PatternGame';
import LogicGame from './minigames/LogicGame';
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

type ChallengeType = 'sudoku' | 'math' | 'memory' | 'pattern' | 'logic';

interface ChallengeInfo {
  type: ChallengeType;
  name: string;
  icon: string;
  description: string;
}

const CHALLENGES: ChallengeInfo[] = [
  {
    type: 'sudoku',
    name: 'Sudoku',
    icon: '🔢',
    description: 'Completa la cuadrícula de 9×9 de modo que cada fila, cada columna y cada caja de 3×3 contenga los números del 1 al 9 sin repetir. Los números ya colocados son pistas fijas. Toca una celda vacía y selecciona un número para colocarlo.',
  },
  {
    type: 'math',
    name: 'Cálculo Veloz',
    icon: '➗',
    description: 'Se te mostrarán operaciones matemáticas (suma, resta, multiplicación, división). Escribe la respuesta correcta antes de que se acabe el tiempo. Debes acertar la mayoría para pasar.',
  },
  {
    type: 'memory',
    name: 'Memoria',
    icon: '🧩',
    description: 'Se mostrarán cartas boca abajo. Voltea dos cartas por turno intentando encontrar pares iguales. Las cartas se muestran brevemente al inicio. Encuentra todos los pares antes de que se agote el tiempo.',
  },
  {
    type: 'pattern',
    name: 'Patrón de Secuencia',
    icon: '🔮',
    description: 'Se mostrará una secuencia de símbolos de colores por unos segundos. Memorízala y luego reprodúcela en el mismo orden tocando los símbolos. Debes completar varias rondas.',
  },
  {
    type: 'logic',
    name: 'Lógica',
    icon: '🧠',
    description: 'Responde preguntas de razonamiento lógico: secuencias numéricas, elemento intruso, analogías y más. Selecciona la respuesta correcta entre las opciones antes de que se agote el tiempo.',
  },
];

function getIntDifficulty(intStat: number): number {
  // INT 1-10 = easy (child level), 11-30 = medium, 31+ = hard
  if (intStat <= 10) return 1;
  if (intStat <= 30) return 2;
  return 3;
}

interface PunishmentOverlayProps {
  pendingCount: number;
  level: number;
  intStat: number;
  statPenalty: number;
  onComplete: () => void;
  onFail: () => void;
}

const PunishmentOverlay = ({ pendingCount, level, intStat, statPenalty, onComplete, onFail }: PunishmentOverlayProps) => {
  const [phase, setPhase] = useState<'phrase' | 'instructions' | 'challenge'>(() => { sfxPunishment(); return 'phrase'; });

  const phrase = useMemo(
    () => PUNISHMENT_PHRASES[Math.floor(Math.random() * PUNISHMENT_PHRASES.length)],
    []
  );

  const challenge = useMemo(
    () => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)],
    []
  );

  const difficulty = getIntDifficulty(intStat);
  const difficultyLabel = difficulty === 1 ? 'Fácil' : difficulty === 2 ? 'Media' : 'Difícil';
  const sudokuDifficulty: 'medium' | 'hard' = difficulty >= 3 ? 'hard' : 'medium';
  const timeLimitSeconds = difficulty === 1 ? 600 : difficulty === 2 ? 420 : 300;

  const handleMinigameComplete = (success: boolean) => {
    if (success) {
      onComplete();
    } else {
      onFail();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm overflow-y-auto py-4">
      {/* DEV ONLY: skip punishment button for preview/testing */}
      <button
        onClick={onComplete}
        className="fixed top-3 right-3 z-[110] px-3 py-1.5 rounded-md bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-[10px] font-display uppercase tracking-wider hover:bg-yellow-500/30 transition-colors"
      >
        ⏭ Saltar (DEV)
      </button>
      <div className="w-full max-w-md px-4">
        {phase === 'phrase' ? (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-7xl mb-4">⚠️</div>

            <div className="font-display text-xs uppercase tracking-[0.3em] text-destructive">
              Castigo {pendingCount > 1 ? `(${pendingCount} pendientes)` : ''}
            </div>

            <div className="rpg-panel border-destructive/40 bg-destructive/5">
              <div className="text-xs font-display text-destructive uppercase tracking-wider mb-1">
                Penalización aplicada
              </div>
              <div className="text-sm text-foreground">
                -{statPenalty} puntos en todas las estadísticas
              </div>
            </div>

            <p className="font-display text-base text-foreground leading-relaxed italic">
              "{phrase}"
            </p>

            <div className="text-xs text-muted-foreground">
              Reto: <span className="text-primary font-display">{challenge.icon} {challenge.name}</span>
              {' · '}
              Dificultad: <span className="text-primary font-display uppercase">{difficultyLabel}</span>
              {' · '}
              INT: <span className="text-primary font-display">{intStat}</span>
            </div>

            <button
              onClick={() => setPhase('instructions')}
              className="px-8 py-3 rounded-lg bg-destructive text-destructive-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity glow-str"
            >
              Aceptar Castigo
            </button>
          </div>
        ) : phase === 'instructions' ? (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-6xl mb-2">{challenge.icon}</div>
            
            <h2 className="font-display text-lg uppercase tracking-[0.2em] text-destructive">
              {challenge.name}
            </h2>

            <div className="rpg-panel text-left">
              <div className="text-xs font-display text-primary uppercase tracking-wider mb-2">
                ¿En qué consiste?
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {challenge.description}
              </p>
            </div>

            <div className="rpg-panel border-primary/30">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Dificultad: <span className="text-primary font-display uppercase">{difficultyLabel}</span></span>
                {challenge.type === 'sudoku' && (
                  <span>Tiempo: <span className="text-primary font-display">{timeLimitSeconds / 60} min</span></span>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground italic">
              Complétalo para recuperar +1 INT y ganar XP. Si fallas, perderás el 50% de tu XP actual.
            </div>

            <button
              onClick={() => setPhase('challenge')}
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-destructive mb-1">
                ⚠️ {challenge.name} de Castigo
              </h2>
              <p className="text-xs text-muted-foreground">
                Complétalo para recuperar +1 INT y ganar XP
              </p>
            </div>

            {challenge.type === 'sudoku' && (
              <SudokuGame
                difficulty={sudokuDifficulty}
                timeLimitSeconds={timeLimitSeconds}
                onComplete={onComplete}
                onFail={onFail}
              />
            )}
            {challenge.type === 'math' && (
              <MathGame
                difficulty={difficulty}
                onComplete={handleMinigameComplete}
              />
            )}
            {challenge.type === 'memory' && (
              <MemoryGame
                difficulty={difficulty}
                onComplete={handleMinigameComplete}
              />
            )}
            {challenge.type === 'pattern' && (
              <PatternGame
                difficulty={difficulty}
                onComplete={handleMinigameComplete}
              />
            )}
            {challenge.type === 'logic' && (
              <LogicGame
                difficulty={difficulty}
                onComplete={handleMinigameComplete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PunishmentOverlay;
