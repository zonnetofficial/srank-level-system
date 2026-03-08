import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
}

export default function ReactionGame({ difficulty, onComplete }: Props) {
  const rounds = difficulty === 1 ? 5 : difficulty === 2 ? 7 : 10;
  const maxReactionMs = difficulty === 1 ? 800 : difficulty === 2 ? 600 : 450;
  const maxFails = difficulty === 1 ? 2 : difficulty === 2 ? 2 : 1;

  const [phase, setPhase] = useState<'waiting' | 'ready' | 'go' | 'result' | 'done'>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [fails, setFails] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [tooEarly, setTooEarly] = useState(false);
  const goTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finished = useRef(false);

  const startRound = useCallback(() => {
    setPhase('ready');
    setReactionTime(null);
    setTooEarly(false);
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      goTimeRef.current = Date.now();
      setPhase('go');
      // Auto-fail if no click within maxReactionMs * 2
      timeoutRef.current = setTimeout(() => {
        setPhase('result');
        setReactionTime(maxReactionMs * 2);
        setFails(f => f + 1);
      }, maxReactionMs * 2);
    }, delay);
  }, [maxReactionMs]);

  useEffect(() => {
    if (!finished.current) startRound();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    if (phase !== 'result') return;
    const total = successes + fails;
    if (total >= rounds || fails > maxFails) {
      finished.current = true;
      setPhase('done');
      onComplete(fails <= maxFails);
    }
  }, [successes, fails, phase, rounds, maxFails, onComplete]);

  const handleTap = () => {
    if (phase === 'done') return;

    if (phase === 'ready') {
      // Too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTooEarly(true);
      setFails(f => f + 1);
      setPhase('result');
      return;
    }

    if (phase === 'go') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const time = Date.now() - goTimeRef.current;
      setReactionTime(time);
      if (time <= maxReactionMs) {
        setSuccesses(s => s + 1);
      } else {
        setFails(f => f + 1);
      }
      setPhase('result');
    }
  };

  const nextRound = () => {
    if (phase === 'done') return;
    setCurrentRound(r => r + 1);
    startRound();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="hud-label">Ronda {Math.min(currentRound + 1, rounds)}/{rounds}</span>
        <div className="flex gap-3">
          <span className="text-accent text-xs font-display">✓ {successes}</span>
          <span className="text-destructive text-xs font-display">✗ {fails}/{maxFails + 1}</span>
        </div>
      </div>

      <div className="stat-bar-track h-1.5">
        <div className="stat-bar-fill bg-accent transition-all" style={{ width: `${(successes / rounds) * 100}%` }} />
      </div>

      <button
        onClick={handleTap}
        className={`w-full aspect-[2/1] rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
          phase === 'waiting' || phase === 'result' || phase === 'done'
            ? 'bg-secondary/30 border-border'
            : phase === 'ready'
              ? 'bg-destructive/10 border-destructive/40 cursor-pointer'
              : 'bg-accent/20 border-accent/60 cursor-pointer animate-pulse'
        }`}
        disabled={phase === 'done' || phase === 'waiting' || phase === 'result'}
      >
        {phase === 'ready' && (
          <>
            <span className="text-4xl">🔴</span>
            <span className="hud-label text-destructive">Espera...</span>
          </>
        )}
        {phase === 'go' && (
          <>
            <span className="text-4xl">🟢</span>
            <span className="hud-label text-accent">¡AHORA!</span>
          </>
        )}
        {phase === 'result' && (
          <>
            <span className="text-3xl">{tooEarly ? '💥' : reactionTime && reactionTime <= maxReactionMs ? '⚡' : '🐌'}</span>
            <span className={`font-display text-sm ${
              tooEarly ? 'text-destructive' : reactionTime && reactionTime <= maxReactionMs ? 'text-accent' : 'text-destructive'
            }`}>
              {tooEarly ? 'Demasiado pronto' : `${reactionTime}ms`}
            </span>
          </>
        )}
        {phase === 'done' && (
          <span className={`font-display text-lg ${fails <= maxFails ? 'text-accent' : 'text-destructive'}`}>
            {fails <= maxFails ? '¡Victoria!' : 'Misión fallida'}
          </span>
        )}
      </button>

      {phase === 'result' && !finished.current && (
        <button
          onClick={nextRound}
          className="w-full py-3 text-xs font-display uppercase tracking-[0.2em] border border-primary/30 text-primary hover:bg-primary/10 transition-all"
          style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          Siguiente Ronda →
        </button>
      )}
    </div>
  );
}
