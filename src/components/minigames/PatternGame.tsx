import { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
  timeMultiplier?: number;
}

const SYMBOLS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '🟤'];

export default function PatternGame({ difficulty, onComplete, timeMultiplier = 1 }: Props) {
  const seqLength = difficulty === 1 ? 4 : difficulty === 2 ? 6 : 8;
  const rounds = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
  const showTime = Math.floor((difficulty === 1 ? 3000 : difficulty === 2 ? 2500 : 2000) * timeMultiplier);

  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [phase, setPhase] = useState<'show' | 'input' | 'result' | 'done'>('show');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);

  const generateSequence = useCallback(() => {
    const available = SYMBOLS.slice(0, Math.min(seqLength + 2, SYMBOLS.length));
    return Array.from({ length: seqLength }, () =>
      available[Math.floor(Math.random() * available.length)]
    );
  }, [seqLength]);

  useEffect(() => {
    const seq = generateSequence();
    setSequence(seq);
    setPhase('show');
    const timer = setTimeout(() => setPhase('input'), showTime);
    return () => clearTimeout(timer);
  }, [round, generateSequence, showTime]);

  const handleSymbolClick = (symbol: string) => {
    if (phase !== 'input') return;
    const next = [...playerInput, symbol];
    setPlayerInput(next);

    if (next.length === sequence.length) {
      const isCorrect = next.every((s, i) => s === sequence[i]);
      if (isCorrect) setCorrect(c => c + 1);
      else setWrong(w => w + 1);
      setPhase('result');

      setTimeout(() => {
        if (round + 1 >= rounds) {
          const finalCorrect = correct + (isCorrect ? 1 : 0);
          setFinished(true);
          setPhase('done');
          onComplete(finalCorrect >= Math.ceil(rounds * 0.6));
        } else {
          setRound(r => r + 1);
          setPlayerInput([]);
        }
      }, 1200);
    }
  };

  const displaySymbols = SYMBOLS.slice(0, Math.min(seqLength + 2, SYMBOLS.length));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="hud-label">Ronda {round + 1}/{rounds}</span>
        <div className="flex gap-3 text-xs font-display">
          <span className="text-accent">✓ {correct}</span>
          <span className="text-destructive">✗ {wrong}</span>
        </div>
      </div>

      <div className="stat-bar-track h-1.5">
        <div className="stat-bar-fill bg-accent transition-all" style={{ width: `${(correct / rounds) * 100}%` }} />
      </div>

      {/* Sequence display */}
      <div className="rpg-panel-glow py-6 text-center min-h-[100px] flex items-center justify-center">
        {phase === 'show' && (
          <div className="space-y-2 animate-slide-up">
            <div className="text-[10px] font-display uppercase tracking-wider text-primary animate-pulse">
              ¡Memoriza la secuencia!
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {sequence.map((s, i) => (
                <span key={i} className="text-2xl animate-scale-up" style={{ animationDelay: `${i * 100}ms` }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {phase === 'input' && (
          <div className="space-y-2">
            <div className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
              Repite la secuencia ({playerInput.length}/{sequence.length})
            </div>
            <div className="flex gap-1 justify-center min-h-[40px]">
              {playerInput.map((s, i) => (
                <span key={i} className="text-xl">{s}</span>
              ))}
              {Array.from({ length: sequence.length - playerInput.length }).map((_, i) => (
                <span key={`empty-${i}`} className="text-xl opacity-20">⬜</span>
              ))}
            </div>
          </div>
        )}
        {phase === 'result' && (
          <div className={`font-display text-sm ${
            playerInput.every((s, i) => s === sequence[i]) ? 'text-accent' : 'text-destructive'
          }`}>
            {playerInput.every((s, i) => s === sequence[i]) ? '¡Correcto!' : 'Incorrecto'}
          </div>
        )}
        {phase === 'done' && (
          <div className={`font-display uppercase tracking-wider ${
            correct >= Math.ceil(rounds * 0.6) ? 'text-accent' : 'text-destructive'
          }`}>
            {correct >= Math.ceil(rounds * 0.6) ? '¡Victoria!' : 'Fallido'}
          </div>
        )}
      </div>

      {/* Input buttons */}
      {phase === 'input' && (
        <div className="grid grid-cols-4 gap-2">
          {displaySymbols.map((symbol, i) => (
            <button
              key={i}
              onClick={() => handleSymbolClick(symbol)}
              className="aspect-square text-2xl flex items-center justify-center rounded-lg border border-border bg-secondary/30 hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95"
            >
              {symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
