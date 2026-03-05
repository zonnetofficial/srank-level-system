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
  const segments = Math.ceil(totalMinutes / 2);
  const secondsPerSegment = (totalMinutes / segments) * 60;

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

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const elapsed = totalSeconds - secondsLeft;
  const completedSegments = Math.floor(elapsed / secondsPerSegment);

  // SVG circle segments
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const strokeWidth = 16;
  const gap = 3; // degrees gap between segments
  const segmentAngle = (360 - gap * segments) / segments;

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = secondsLeft % 60;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !running) onClose(); }}>
      <DialogContent className="bg-background border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-center text-stat-int text-glow-primary">
            🏃 Carrera – {totalMinutes} min
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Circular Timer */}
          <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {Array.from({ length: segments }).map((_, i) => {
                const startAngle = -90 + i * (segmentAngle + gap);
                const endAngle = startAngle + segmentAngle;
                const isActive = i >= segments - completedSegments - (secondsLeft > 0 ? 0 : 0);
                const isDimmed = i < completedSegments;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = cx + radius * Math.cos(startRad);
                const y1 = cy + radius * Math.sin(startRad);
                const x2 = cx + radius * Math.cos(endRad);
                const y2 = cy + radius * Math.sin(endRad);

                const largeArc = segmentAngle > 180 ? 1 : 0;

                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={isDimmed ? 'hsl(var(--muted))' : 'hsl(210, 100%, 55%)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    opacity={isDimmed ? 0.25 : 1}
                    style={{ transition: 'opacity 0.5s ease, stroke 0.5s ease' }}
                  />
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
            <p className="text-xs text-muted-foreground font-display animate-pulse">
              Carrera en progreso...
            </p>
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
