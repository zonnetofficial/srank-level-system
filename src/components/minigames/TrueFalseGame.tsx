import { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
  timeMultiplier?: number;
}

function generateStatement(difficulty: number): { text: string; isTrue: boolean } {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const max = difficulty === 1 ? 20 : difficulty === 2 ? 50 : 100;

  let a: number, b: number, correctAnswer: number;

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * max) + 1;
      correctAnswer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * a) + 1;
      correctAnswer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      correctAnswer = a * b;
      break;
    default:
      a = 1; b = 1; correctAnswer = 2;
  }

  const isTrue = Math.random() > 0.4;
  const shown = isTrue ? correctAnswer : correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);

  return {
    text: `${a} ${op} ${b} = ${shown}`,
    isTrue,
  };
}

export default function TrueFalseGame({ difficulty, onComplete, timeMultiplier = 1 }: Props) {
  const totalRounds = difficulty === 1 ? 10 : difficulty === 2 ? 14 : 18;
  const timeLimit = Math.floor((difficulty === 1 ? 40 : difficulty === 2 ? 50 : 60) * timeMultiplier);
  const minCorrect = Math.ceil(totalRounds * 0.7);

  const [statements] = useState(() =>
    Array.from({ length: totalRounds }, () => generateStatement(difficulty))
  );
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      onComplete(correct >= minCorrect);
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished, correct, minCorrect, onComplete]);

  const answer = useCallback((userSaysTrue: boolean) => {
    if (finished) return;
    const isCorrect = userSaysTrue === statements[current].isTrue;

    if (isCorrect) {
      setCorrect(c => c + 1);
      setFlash('correct');
    } else {
      setWrong(w => w + 1);
      setFlash('wrong');
    }

    setTimeout(() => setFlash(null), 300);

    if (current + 1 >= totalRounds) {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      setFinished(true);
      onComplete(finalCorrect >= minCorrect);
    } else {
      setCurrent(c => c + 1);
    }
  }, [current, correct, statements, totalRounds, minCorrect, finished, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="hud-label">{Math.min(current + 1, totalRounds)}/{totalRounds}</span>
        <span className={`hud-data text-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="stat-bar-track h-1.5">
        <div className="stat-bar-fill bg-primary transition-all duration-1000" style={{ width: `${(timeLeft / timeLimit) * 100}%` }} />
      </div>

      <div className="flex gap-3 justify-center text-xs font-display">
        <span className="text-accent">✓ {correct}</span>
        <span className="text-destructive">✗ {wrong}</span>
        <span className="text-muted-foreground">Necesitas: {minCorrect}</span>
      </div>

      {!finished ? (
        <div className={`rpg-panel-glow py-8 text-center space-y-6 transition-all ${
          flash === 'correct' ? 'border-accent/60' : flash === 'wrong' ? 'border-destructive/60' : ''
        }`}>
          <div className="text-3xl font-display font-bold text-foreground">
            {statements[current].text}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => answer(true)}
              className="px-6 py-3 bg-accent/20 border border-accent/40 text-accent rounded-lg font-display text-lg hover:bg-accent/30 transition-all"
            >
              ✓ Verdadero
            </button>
            <button
              onClick={() => answer(false)}
              className="px-6 py-3 bg-destructive/20 border border-destructive/40 text-destructive rounded-lg font-display text-lg hover:bg-destructive/30 transition-all"
            >
              ✗ Falso
            </button>
          </div>
        </div>
      ) : (
        <div className={`text-center py-6 font-display uppercase tracking-wider ${
          correct >= minCorrect ? 'text-accent' : 'text-destructive'
        }`}>
          {correct >= minCorrect ? '¡Victoria!' : 'Misión fallida'}
          <div className="text-xs text-muted-foreground mt-1 normal-case">
            {correct}/{totalRounds} correctas
          </div>
        </div>
      )}
    </div>
  );
}
