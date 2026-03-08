import { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
}

function generateProblem(difficulty: number): { question: string; answer: number } {
  const ops = difficulty === 1 ? ['+', '-'] : difficulty === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  const max = difficulty === 1 ? 20 : difficulty === 2 ? 50 : 100;

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * max) + 1;
      answer = a + b;
      return { question: `${a} + ${b}`, answer };
    case '-':
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      return { question: `${a} - ${b}`, answer };
    case '×':
      a = Math.floor(Math.random() * (difficulty === 2 ? 12 : 20)) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
      return { question: `${a} × ${b}`, answer };
    case '÷':
      b = Math.floor(Math.random() * 12) + 2;
      answer = Math.floor(Math.random() * 12) + 1;
      a = b * answer;
      return { question: `${a} ÷ ${b}`, answer };
    default:
      return { question: '1 + 1', answer: 2 };
  }
}

export default function MathGame({ difficulty, onComplete }: Props) {
  const totalProblems = difficulty === 1 ? 8 : difficulty === 2 ? 12 : 15;
  const timeLimit = difficulty === 1 ? 60 : difficulty === 2 ? 75 : 90;
  const minCorrect = Math.ceil(totalProblems * 0.7);

  const [problems] = useState(() =>
    Array.from({ length: totalProblems }, () => generateProblem(difficulty))
  );
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [finished, setFinished] = useState(false);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);

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

  const submit = useCallback(() => {
    if (finished || !input.trim()) return;
    const num = parseInt(input.trim());
    const isCorrect = num === problems[current].answer;

    if (isCorrect) {
      setCorrect(c => c + 1);
      setLastResult('correct');
    } else {
      setWrong(w => w + 1);
      setLastResult('wrong');
    }

    setInput('');
    if (current + 1 >= totalProblems) {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      setFinished(true);
      onComplete(finalCorrect >= minCorrect);
    } else {
      setCurrent(c => c + 1);
      setTimeout(() => setLastResult(null), 500);
    }
  }, [input, current, problems, correct, totalProblems, minCorrect, finished, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="hud-label">Problema {Math.min(current + 1, totalProblems)}/{totalProblems}</span>
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
        <div className="rpg-panel-glow py-8 text-center space-y-6">
          <div className={`text-3xl font-display font-bold transition-all ${
            lastResult === 'correct' ? 'text-accent' : lastResult === 'wrong' ? 'text-destructive' : 'text-foreground'
          }`}>
            {problems[current].question} = ?
          </div>

          <div className="flex gap-2 max-w-48 mx-auto">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-center text-lg font-display text-foreground outline-none focus:border-primary/60"
              autoFocus
              placeholder="?"
            />
            <button
              onClick={submit}
              className="px-4 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg font-display text-sm hover:bg-primary/30 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      ) : (
        <div className={`text-center py-6 font-display uppercase tracking-wider ${
          correct >= minCorrect ? 'text-accent' : 'text-destructive'
        }`}>
          {correct >= minCorrect ? '¡Victoria!' : 'Misión fallida'}
          <div className="text-xs text-muted-foreground mt-1 normal-case">
            {correct}/{totalProblems} correctas
          </div>
        </div>
      )}
    </div>
  );
}
