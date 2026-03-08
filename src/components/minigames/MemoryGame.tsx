import { useState, useEffect, useCallback } from 'react';

const EMOJIS = ['⚔️', '🛡️', '💎', '🔮', '👑', '🗡️', '🧪', '🏹', '💀', '🐉', '🔥', '⭐'];

interface Props {
  difficulty: number;
  onComplete: (success: boolean) => void;
}

export default function MemoryGame({ difficulty, onComplete }: Props) {
  const pairCount = difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10;
  const timeLimit = difficulty === 1 ? 60 : difficulty === 2 ? 50 : 40;

  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [matchedCount, setMatchedCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const emojis = EMOJIS.slice(0, pairCount);
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({ emoji, flipped: false, matched: false }));
    setCards(deck);
    // Show all cards briefly
    setTimeout(() => setStarted(true), 1500);
  }, [pairCount]);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      onComplete(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, finished, onComplete]);

  useEffect(() => {
    if (matchedCount === pairCount && started) {
      setFinished(true);
      onComplete(true);
    }
  }, [matchedCount, pairCount, started, onComplete]);

  const handleClick = useCallback((index: number) => {
    if (finished || !started) return;
    if (cards[index].matched || cards[index].flipped) return;
    if (selected.length >= 2) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c
          ));
          setMatchedCount(prev => prev + 1);
          setSelected([]);
        }, 300);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
          setSelected([]);
        }, 800);
      }
    }
  }, [cards, selected, finished, started]);

  const cols = pairCount <= 6 ? 4 : pairCount <= 8 ? 4 : 5;

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="flex justify-between items-center">
        <span className="hud-label">Pares: {matchedCount}/{pairCount}</span>
        <span className={`hud-data text-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="stat-bar-track h-1.5">
        <div
          className="stat-bar-fill bg-primary transition-all duration-1000"
          style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
        />
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`aspect-square rounded-lg border text-2xl flex items-center justify-center transition-all duration-300 ${
              card.matched
                ? 'bg-accent/20 border-accent/40 scale-90 opacity-60'
                : card.flipped || !started
                  ? 'bg-primary/10 border-primary/40 scale-105'
                  : 'bg-secondary/50 border-border hover:border-primary/40 hover:bg-primary/5'
            }`}
            disabled={finished || card.matched}
          >
            {(card.flipped || card.matched || !started) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {finished && (
        <div className={`text-center py-3 font-display uppercase tracking-wider text-sm ${
          matchedCount === pairCount ? 'text-accent' : 'text-destructive'
        }`}>
          {matchedCount === pairCount ? '¡Victoria!' : 'Tiempo agotado'}
        </div>
      )}
    </div>
  );
}
