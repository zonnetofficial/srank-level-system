import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
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
  const completedSegments = Math.floor(elapsed / secondsPerSegment);
  const progressInSegment = (elapsed % secondsPerSegment) / secondsPerSegment;

  // SVG config
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 120;
  const innerRadius = 88;
  const gapDeg = 5;
  const segmentAngle = (360 - gapDeg * segments) / segments;

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = secondsLeft % 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const polarToCart = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !running) onClose(); }}>
      <DialogContent className="bg-background border-border max-w-sm p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-3 text-center border-b border-border">
          <h2 className="font-display text-lg font-bold text-primary text-glow-primary tracking-wider">
            🏃 CARRERA
          </h2>
          <p className="text-xs text-muted-foreground font-display mt-1">
            {totalMinutes} minutos • {Math.round(progressPercent)}% completado
          </p>
        </div>

        <div className="flex flex-col items-center gap-5 px-6 py-6">
          {/* Circular segmented timer */}
          <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Subtle background circle */}
              <circle cx={cx} cy={cy} r={(outerRadius + innerRadius) / 2} fill="none" stroke="hsl(225, 25%, 12%)" strokeWidth={outerRadius - innerRadius} />

              {Array.from({ length: segments }).map((_, i) => {
                const startAngle = -90 + i * (segmentAngle + gapDeg);
                const endAngle = startAngle + segmentAngle;
                const isDone = i < completedSegments;
                const isActive = i === completedSegments && running;

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

                let fillColor = 'hsl(210, 100%, 92%)';
                let fillOpacity = 1;
                let strokeColor = 'hsl(210, 100%, 65%)';
                let strokeOpacity = 1;

                if (isDone) {
                  fillColor = 'hsl(195, 100%, 55%)';
                  fillOpacity = 0.15;
                  strokeColor = 'hsl(195, 100%, 45%)';
                  strokeOpacity = 0.3;
                } else if (isActive) {
                  fillColor = 'hsl(195, 100%, 80%)';
                  fillOpacity = 0.7 + progressInSegment * 0.3;
                  strokeColor = 'hsl(195, 100%, 70%)';
                }

                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill={fillColor}
                      opacity={fillOpacity}
                      style={{ transition: 'fill 0.8s ease, opacity 0.8s ease' }}
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isActive ? 2 : 1.5}
                      opacity={strokeOpacity}
                      style={{
                        transition: 'opacity 0.5s ease',
                        filter: isActive ? 'drop-shadow(0 0 4px hsl(195, 100%, 60%))' : 'none',
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-display text-4xl font-bold tracking-wider"
                style={{
                  color: completed ? 'hsl(45, 100%, 60%)' : 'hsl(210, 100%, 80%)',
                  textShadow: completed
                    ? '0 0 20px hsl(45, 100%, 60%, 0.6)'
                    : '0 0 15px hsl(210, 100%, 70%, 0.5)',
                  transition: 'color 0.5s ease, text-shadow 0.5s ease',
                }}
              >
                {String(minutesDisplay).padStart(2, '0')}:{String(secondsDisplay).padStart(2, '0')}
              </span>
              {running && (
                <span className="text-[10px] font-display text-primary/60 uppercase tracking-widest mt-1 animate-pulse">
                  En curso
                </span>
              )}
              {completed && (
                <span className="text-xs font-display text-accent uppercase tracking-widest mt-1 animate-pulse text-glow-accent">
                  ¡Completado!
                </span>
              )}
              {!running && !completed && (
                <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider mt-1">
                  Listo
                </span>
              )}
            </div>
          </div>

          {/* Segment indicator */}
          <div className="flex gap-1.5">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i < completedSegments ? 16 : 8,
                  backgroundColor: i < completedSegments
                    ? 'hsl(195, 100%, 55%)'
                    : i === completedSegments && running
                    ? 'hsl(195, 100%, 70%)'
                    : 'hsl(225, 25%, 20%)',
                  boxShadow: i < completedSegments ? '0 0 6px hsl(195, 100%, 55%, 0.5)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="w-full space-y-2">
            {!running && !completed && (
              <button
                onClick={handleStart}
                className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.2em] glow-primary hover:opacity-90 transition-all"
              >
                ▶ Iniciar Carrera
              </button>
            )}

            {running && (
              <button
                onClick={handleAbort}
                className="w-full py-3.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-xs uppercase tracking-[0.2em] hover:bg-destructive/30 transition-all"
              >
                ✖ Abortar Carrera
              </button>
            )}

            {completed && (
              <button
                onClick={handleComplete}
                className="w-full py-3.5 rounded-lg bg-accent text-accent-foreground font-display text-sm uppercase tracking-[0.2em] glow-accent hover:opacity-90 transition-all"
              >
                ✅ Confirmar Completado
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RunTimer;
