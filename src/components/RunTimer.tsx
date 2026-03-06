import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RunTimerProps {
  totalMinutes: number;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const RunTimer = ({ totalMinutes, open, onClose, onComplete }: RunTimerProps) => {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const totalSeconds = totalMinutes * 60;
  const segments = 10;
  const secondsPerSegment = totalSeconds / segments;

  useEffect(() => {
    if (open) {
      setSecondsLeft(totalMinutes * 60);
      setRunning(false);
      setCompleted(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, totalMinutes]);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, secondsLeft]);

  const handleStart = () => setRunning(true);

  const handleAbort = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(totalMinutes * 60);
    setCompleted(false);
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const elapsed = totalSeconds - secondsLeft;
  // How many segments are fully done (dimmed)
  const completedSegments = Math.floor(elapsed / secondsPerSegment);

  // SVG config
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 110;
  const innerRadius = 82;
  const gapDeg = 4; // degrees gap between segments
  const segmentAngle = (360 - gapDeg * segments) / segments;

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = secondsLeft % 60;

  const polarToCart = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !running) onClose(); }}>
      <DialogContent className="bg-background border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-center text-primary text-glow-primary">
            🏃 Carrera – {totalMinutes} min
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Circular segmented timer */}
          <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {Array.from({ length: segments }).map((_, i) => {
                const startAngle = -90 + i * (segmentAngle + gapDeg);
                const endAngle = startAngle + segmentAngle;
                const isDimmed = i < completedSegments;

                // Build thick arc segment as a closed path (annular sector)
                const outerStart = polarToCart(startAngle, outerRadius);
                const outerEnd = polarToCart(endAngle, outerRadius);
                const innerStart = polarToCart(startAngle, innerRadius);
                const innerEnd = polarToCart(endAngle, innerRadius);
                const largeArc = segmentAngle > 180 ? 1 : 0;

                const d = [
                  `M ${outerStart.x} ${outerStart.y}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
                  `L ${innerEnd.x} ${innerEnd.y}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
                  'Z',
                ].join(' ');

                return (
                  <g key={i}>
                    {/* Fill */}
                    <path
                      d={d}
                      fill={isDimmed ? 'hsl(var(--muted))' : 'hsl(210, 100%, 92%)'}
                      opacity={isDimmed ? 0.2 : 1}
                      style={{ transition: 'fill 0.5s ease, opacity 0.5s ease' }}
                    />
                    {/* Thin border/perimeter stroke */}
                    <path
                      d={d}
                      fill="none"
                      stroke="hsl(210, 100%, 55%)"
                      strokeWidth={1.5}
                      opacity={isDimmed ? 0.2 : 0.9}
                      style={{ transition: 'opacity 0.5s ease' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold" style={{ color: 'hsl(210, 100%, 55%)' }}>
                {String(minutesDisplay).padStart(2, '0')}:{String(secondsDisplay).padStart(2, '0')}
              </span>
              {completed && (
                <span className="text-accent font-display text-xs mt-1 animate-pulse">
                  ¡COMPLETADO!
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          {!running && !completed && (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-lg font-display text-sm uppercase tracking-wider transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'hsl(210, 100%, 55%)', color: '#fff' }}
            >
              Iniciar Carrera
            </button>
          )}

          {running && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground font-display animate-pulse">
                Carrera en progreso...
              </p>
              <button
                onClick={handleAbort}
                className="px-6 py-2 rounded-lg bg-destructive text-destructive-foreground font-display text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                ✖ Abortar Carrera
              </button>
            </div>
          )}

          {completed && (
            <button
              onClick={handleComplete}
              className="px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              ✅ Confirmar Completado
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RunTimer;
