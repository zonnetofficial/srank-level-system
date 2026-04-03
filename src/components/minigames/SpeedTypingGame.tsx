import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
  timeMultiplier?: number;
}

const WORDS_EASY = [
  'fuego', 'sombra', 'espada', 'magia', 'runa', 'dragón', 'torre', 'llave',
  'piedra', 'cofre', 'trampa', 'gema', 'poción', 'arco', 'flecha', 'portal',
];
const WORDS_MEDIUM = [
  'calabozo', 'fantasma', 'alquimia', 'guardian', 'laberinto', 'reliquia',
  'hechicero', 'aventura', 'fortaleza', 'oscuridad', 'cristales', 'guerrero',
];
const WORDS_HARD = [
  'nigromante', 'encantamiento', 'maleficio', 'resurrección', 'invocación',
  'catacumbas', 'apocalipsis', 'destrucción', 'inmortalidad', 'armagedón',
];

export default function SpeedTypingGame({ difficulty, onComplete, timeMultiplier = 1 }: Props) {
  const totalWords = difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10;
  const timeLimit = Math.floor((difficulty === 1 ? 45 : difficulty === 2 ? 50 : 55) * timeMultiplier);
  const minCorrect = Math.ceil(totalWords * 0.7);

  const wordList = difficulty === 1 ? WORDS_EASY : difficulty === 2 ? WORDS_MEDIUM : WORDS_HARD;

  const [words] = useState(() => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalWords);
  });
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    inputRef.current?.focus();
  }, [current]);

  const submit = useCallback(() => {
    if (finished || !input.trim()) return;
    const typed = input.trim().toLowerCase();
    const target = words[current].toLowerCase();
    const isCorrect = typed === target;

    if (isCorrect) {
      setCorrect(c => c + 1);
      setFlash('correct');
    } else {
      setWrong(w => w + 1);
      setFlash('wrong');
    }

    setInput('');
    setTimeout(() => setFlash(null), 300);

    if (current + 1 >= totalWords) {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      setFinished(true);
      onComplete(finalCorrect >= minCorrect);
    } else {
      setCurrent(c => c + 1);
    }
  }, [input, current, words, correct, totalWords, minCorrect, finished, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="hud-label">Palabra {Math.min(current + 1, totalWords)}/{totalWords}</span>
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
          <div className="text-2xl font-display font-bold text-primary tracking-[0.3em] uppercase">
            {words[current]}
          </div>
          <p className="text-[10px] text-muted-foreground">Escribe la palabra exacta</p>

          <div className="flex gap-2 max-w-64 mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-center text-lg font-display text-foreground outline-none focus:border-primary/60"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
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
            {correct}/{totalWords} correctas
          </div>
        </div>
      )}
    </div>
  );
}
