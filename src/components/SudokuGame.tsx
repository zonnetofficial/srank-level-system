import { useState, useEffect, useRef, useMemo } from 'react';
import { generateSudoku, checkSudoku, SudokuGrid } from '@/lib/sudoku';

interface SudokuGameProps {
  difficulty: 'medium' | 'hard';
  timeLimitSeconds: number;
  onComplete: () => void;
  onFail: () => void;
}

const SudokuGame = ({ difficulty, timeLimitSeconds, onComplete, onFail }: SudokuGameProps) => {
  const { puzzle, solution } = useMemo(() => generateSudoku(difficulty), [difficulty]);
  const [grid, setGrid] = useState<SudokuGrid>(() => puzzle.map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Fixed cells mask
  const fixed = useMemo(() => puzzle.map(r => r.map(v => v !== 0)), [puzzle]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (finished && secondsLeft === 0) {
      onFail();
    }
  }, [finished, secondsLeft]);

  const handleCellClick = (r: number, c: number) => {
    if (finished || fixed[r][c]) return;
    setSelected([r, c]);
  };

  const handleNumber = (num: number) => {
    if (!selected || finished) return;
    const [r, c] = selected;
    if (fixed[r][c]) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);
  };

  const handleClear = () => {
    if (!selected || finished) return;
    const [r, c] = selected;
    if (fixed[r][c]) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = 0;
    setGrid(newGrid);
  };

  const handleSubmit = () => {
    // Check if all cells filled
    const allFilled = grid.every(r => r.every(v => v !== 0));
    if (!allFilled) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    setFinished(true);

    if (checkSudoku(grid, solution)) {
      onComplete();
    } else {
      onFail();
    }
  };

  const allFilled = grid.every(r => r.every(v => v !== 0));
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const isWrong = (r: number, c: number) => {
    if (grid[r][c] === 0 || fixed[r][c]) return false;
    return grid[r][c] !== solution[r][c];
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Timer */}
      <div className={`font-display text-2xl font-bold ${secondsLeft < 60 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
        ⏱ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>

      {/* Grid */}
      <div
        className="grid border-2 border-primary/60 rounded"
        style={{ gridTemplateColumns: 'repeat(9, 1fr)', width: 'min(100%, 342px)' }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isFixed = fixed[r][c];
            const wrong = isWrong(r, c);

            const borderClasses = [
              c % 3 === 0 && c !== 0 ? 'border-l-2 border-l-primary/40' : 'border-l border-l-border',
              r % 3 === 0 && r !== 0 ? 'border-t-2 border-t-primary/40' : 'border-t border-t-border',
            ].join(' ');

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`flex items-center justify-center font-display text-sm font-bold cursor-pointer transition-colors aspect-square ${borderClasses} ${
                  isSelected
                    ? 'bg-primary/30 ring-1 ring-primary'
                    : isFixed
                    ? 'bg-secondary/40'
                    : 'bg-card hover:bg-secondary/20'
                } ${wrong ? 'text-destructive' : isFixed ? 'text-foreground' : 'text-primary'}`}
                style={{ minWidth: 34, minHeight: 34 }}
              >
                {val !== 0 ? val : ''}
              </div>
            );
          })
        )}
      </div>

      {/* Number Pad */}
      {!finished && (
        <>
          <div className="grid grid-cols-9 gap-1" style={{ width: 'min(100%, 342px)' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                onClick={() => handleNumber(n)}
                className="aspect-square rounded bg-secondary text-secondary-foreground font-display text-base font-bold hover:bg-primary/30 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full" style={{ maxWidth: 342 }}>
            <button
              onClick={handleClear}
              className="flex-1 py-2 rounded bg-destructive/20 text-destructive font-display text-xs uppercase tracking-wider hover:bg-destructive/30 transition-colors"
            >
              Borrar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allFilled}
              className={`flex-1 py-2 rounded font-display text-xs uppercase tracking-wider transition-colors ${
                allFilled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }`}
            >
              Verificar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SudokuGame;
