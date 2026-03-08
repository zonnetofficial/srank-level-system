import { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
  timeMultiplier?: number;
}

interface Puzzle {
  question: string;
  options: string[];
  correctIndex: number;
}

function generatePuzzle(difficulty: number): Puzzle {
  const puzzleTypes = difficulty === 1 ? 3 : difficulty === 2 ? 5 : 7;
  const type = Math.floor(Math.random() * puzzleTypes);

  switch (type) {
    case 0: { // Number sequence
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * (difficulty === 1 ? 5 : 10)) + 2;
      const seq = Array.from({ length: 4 }, (_, i) => start + step * i);
      const answer = start + step * 4;
      const options = [answer, answer + step, answer - 1, answer + 2].sort(() => Math.random() - 0.5);
      return {
        question: `¿Qué sigue? ${seq.join(', ')}, ?`,
        options: options.map(String),
        correctIndex: options.indexOf(answer),
      };
    }
    case 1: { // Odd one out
      const sets = [
        { items: ['Perro', 'Gato', 'Pájaro', 'Mesa'], odd: 3 },
        { items: ['Rojo', 'Azul', 'Verde', 'Piano'], odd: 3 },
        { items: ['2', '4', '6', '9'], odd: 3 },
        { items: ['Luna', 'Sol', 'Estrella', 'Silla'], odd: 3 },
        { items: ['Lunes', 'Martes', 'Enero', 'Jueves'], odd: 2 },
      ];
      const set = sets[Math.floor(Math.random() * sets.length)];
      const shuffled = [...set.items].sort(() => Math.random() - 0.5);
      const oddItem = set.items[set.odd];
      return {
        question: '¿Cuál no pertenece al grupo?',
        options: shuffled,
        correctIndex: shuffled.indexOf(oddItem),
      };
    }
    case 2: { // Simple logic
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 10) + 1;
      const answer = a - b;
      const options = [answer, answer + 2, answer - 1, a + b].sort(() => Math.random() - 0.5);
      return {
        question: `Si tengo ${a} monedas y gasto ${b}, ¿cuántas me quedan?`,
        options: options.map(String),
        correctIndex: options.indexOf(answer),
      };
    }
    case 3: { // Pattern completion
      const patterns = [
        { q: 'AB_AB_AB_?', answer: 'A', options: ['A', 'B', 'C', 'D'] },
        { q: '1A_2B_3C_4?', answer: 'D', options: ['D', 'E', 'A', '4'] },
        { q: 'XY_XY_XY_X?', answer: 'Y', options: ['X', 'Y', 'Z', 'W'] },
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      const shuffled = [...p.options].sort(() => Math.random() - 0.5);
      return { question: `Completa: ${p.q}`, options: shuffled, correctIndex: shuffled.indexOf(p.answer) };
    }
    case 4: { // Multiplication patterns
      const base = Math.floor(Math.random() * 5) + 2;
      const seq = Array.from({ length: 4 }, (_, i) => base * Math.pow(2, i));
      const answer = base * Math.pow(2, 4);
      const options = [answer, answer / 2, answer * 2, answer + base].sort(() => Math.random() - 0.5);
      return {
        question: `¿Qué sigue? ${seq.join(', ')}, ?`,
        options: options.map(String),
        correctIndex: options.indexOf(answer),
      };
    }
    case 5: { // Fibonacci-like
      const a = Math.floor(Math.random() * 3) + 1;
      const b = Math.floor(Math.random() * 3) + 2;
      const seq = [a, b];
      for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2]);
      const answer = seq[4] + seq[3];
      const shown = seq.slice(0, 5);
      const options = [answer, answer + 1, answer - 2, seq[4] * 2].sort(() => Math.random() - 0.5);
      return {
        question: `¿Qué sigue? ${shown.join(', ')}, ?`,
        options: options.map(String),
        correctIndex: options.indexOf(answer),
      };
    }
    default: { // Deduction
      const scenarios = [
        { q: 'A es mayor que B. B es mayor que C. ¿Quién es el menor?', answer: 'C', options: ['A', 'B', 'C', 'Igual'] },
        { q: 'Si todos los gatos vuelan y Tom es un gato, ¿Tom vuela?', answer: 'Sí', options: ['Sí', 'No', 'Depende', 'Imposible'] },
        { q: 'X + Y = 10, X = 3. ¿Y = ?', answer: '7', options: ['7', '3', '10', '13'] },
      ];
      const s = scenarios[Math.floor(Math.random() * scenarios.length)];
      const shuffled = [...s.options].sort(() => Math.random() - 0.5);
      return { question: s.q, options: shuffled, correctIndex: shuffled.indexOf(s.answer) };
    }
  }
}

export default function LogicGame({ difficulty, onComplete, timeMultiplier = 1 }: Props) {
  const totalPuzzles = difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10;
  const timeLimit = Math.floor((difficulty === 1 ? 90 : difficulty === 2 ? 80 : 70) * timeMultiplier);
  const minCorrect = Math.ceil(totalPuzzles * 0.65);

  const [puzzles] = useState(() => Array.from({ length: totalPuzzles }, () => generatePuzzle(difficulty)));
  const [current, setCurrent] = useState(0);
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

  const handleAnswer = useCallback((idx: number) => {
    if (finished) return;
    const isCorrect = idx === puzzles[current].correctIndex;

    if (isCorrect) {
      setCorrect(c => c + 1);
      setLastResult('correct');
    } else {
      setWrong(w => w + 1);
      setLastResult('wrong');
    }

    if (current + 1 >= totalPuzzles) {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      setFinished(true);
      onComplete(finalCorrect >= minCorrect);
    } else {
      setTimeout(() => {
        setCurrent(c => c + 1);
        setLastResult(null);
      }, 600);
    }
  }, [current, puzzles, correct, totalPuzzles, minCorrect, finished, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="hud-label">Acertijo {Math.min(current + 1, totalPuzzles)}/{totalPuzzles}</span>
        <span className={`hud-data text-lg ${timeLeft <= 15 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
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
        <div className="rpg-panel-glow py-6 space-y-4">
          <div className={`text-center text-sm font-display px-4 transition-all ${
            lastResult === 'correct' ? 'text-accent' : lastResult === 'wrong' ? 'text-destructive' : 'text-foreground'
          }`}>
            {puzzles[current].question}
          </div>
          <div className="grid grid-cols-2 gap-2 px-2">
            {puzzles[current].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="py-3 px-2 border border-border rounded-lg bg-secondary/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-display text-foreground active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`text-center py-6 font-display uppercase tracking-wider ${
          correct >= minCorrect ? 'text-accent' : 'text-destructive'
        }`}>
          {correct >= minCorrect ? '¡Victoria!' : 'Fallido'}
          <div className="text-xs text-muted-foreground mt-1 normal-case">{correct}/{totalPuzzles} correctas</div>
        </div>
      )}
    </div>
  );
}
