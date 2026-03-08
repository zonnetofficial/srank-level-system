import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { STAT_LABELS, STAT_ICONS, StatKey } from '@/lib/gameData';
import { SkillTask } from '@/lib/skillTasks';

interface SkillTaskDialogProps {
  stat: StatKey | null;
  task: SkillTask | null;
  open: boolean;
  onResult: (success: boolean) => void;
  onClose: () => void;
}

type Phase = 'intro' | 'active' | 'done';

const SkillTaskDialog = ({ stat, task, open, onResult, onClose }: SkillTaskDialogProps) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const hasDuration = !!task?.durationSeconds;
  const totalSeconds = task?.durationSeconds || 0;

  useEffect(() => {
    if (open) {
      setPhase('intro');
      setSecondsLeft(totalSeconds);
      setRunning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, totalSeconds]);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setPhase('done');
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

  if (!stat || !task) return null;

  const handleStart = () => {
    if (hasDuration) {
      setPhase('active');
      setSecondsLeft(totalSeconds);
      setRunning(true);
    } else {
      setPhase('active');
    }
  };

  const handleAbort = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    onClose();
  };

  const handleComplete = (success: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    onResult(success);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Timer SVG config (matching RunTimer style)
  const segments = 10;
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 100;
  const innerRadius = 82;
  const gapDeg = 5;
  const segmentAngle = (360 - gapDeg * segments) / segments;
  const secondsPerSegment = totalSeconds / segments;
  const elapsed = totalSeconds - secondsLeft;
  const completedSegments = Math.floor(elapsed / secondsPerSegment);
  const progressInSegment = secondsPerSegment > 0 ? (elapsed % secondsPerSegment) / secondsPerSegment : 0;
  const progressPercent = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;

  const polarToCart = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const statColor = `text-stat-${stat}`;

  // Format total duration for display
  const formatDuration = (s: number) => {
    if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min`;
    if (s >= 60) return `${Math.floor(s / 60)} min${s % 60 > 0 ? ` ${s % 60}s` : ''}`;
    return `${s} segundos`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !running) onClose(); }}>
      <DialogContent className="bg-background border-border max-w-sm p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <DialogTitle className="font-display text-center">
            <span className={statColor}>
              {STAT_ICONS[stat]} {STAT_LABELS[stat]}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div className="px-6 py-6 space-y-5">
            {/* Task info panel */}
            <div className="rpg-panel space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-display text-primary uppercase tracking-[0.2em]">
                  Tarea Asignada
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                {task.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
              {hasDuration && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <span className="text-primary text-sm">⏱</span>
                  <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                    Duración: {formatDuration(totalSeconds)}
                  </span>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="rpg-panel bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hasDuration ? (
                  <>
                    <span className="text-primary font-display font-bold">📋 Instrucciones:</span>{' '}
                    Al presionar "Iniciar", comenzará un temporizador. Realiza la tarea durante el tiempo indicado. 
                    El temporizador te avisará cuando el tiempo se agote.
                  </>
                ) : (
                  <>
                    <span className="text-primary font-display font-bold">📋 Instrucciones:</span>{' '}
                    Realiza la tarea indicada. Cuando termines, confirma si la completaste exitosamente o no.
                  </>
                )}
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.2em] glow-primary hover:opacity-90 transition-all"
            >
              ▶ Iniciar Tarea
            </button>
          </div>
        )}

        {/* ACTIVE PHASE - WITH TIMER */}
        {phase === 'active' && hasDuration && (
          <div className="flex flex-col items-center gap-4 px-6 py-6">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
              {task.name} • {Math.round(progressPercent)}%
            </p>

            {/* Circular timer */}
            <div className="relative">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                  cx={cx} cy={cy}
                  r={(outerRadius + innerRadius) / 2}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth={outerRadius - innerRadius}
                  opacity={0.3}
                />
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
                  let fillOpacity = 0.1;
                  let strokeColor = 'hsl(210, 100%, 65%)';
                  let strokeOpacity = 0.3;

                  if (isDone) {
                    fillColor = 'hsl(var(--primary))';
                    fillOpacity = 0.3;
                    strokeColor = 'hsl(var(--primary))';
                    strokeOpacity = 0.6;
                  } else if (isActive) {
                    fillColor = 'hsl(var(--primary))';
                    fillOpacity = 0.5 + progressInSegment * 0.5;
                    strokeColor = 'hsl(var(--primary))';
                    strokeOpacity = 1;
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
                          filter: isActive ? 'drop-shadow(0 0 4px hsl(var(--primary)))' : 'none',
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center time */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-display text-3xl font-bold tracking-wider text-primary"
                  style={{ textShadow: '0 0 15px hsl(var(--primary) / 0.5)' }}
                >
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] font-display text-primary/60 uppercase tracking-widest mt-1 animate-pulse">
                  En curso
                </span>
              </div>
            </div>

            {/* Segment dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: segments }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i < completedSegments ? 14 : 7,
                    backgroundColor: i < completedSegments
                      ? 'hsl(var(--primary))'
                      : i === completedSegments && running
                      ? 'hsl(var(--primary) / 0.6)'
                      : 'hsl(var(--muted))',
                    boxShadow: i < completedSegments ? '0 0 6px hsl(var(--primary) / 0.5)' : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleAbort}
              className="w-full py-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-xs uppercase tracking-[0.2em] hover:bg-destructive/30 transition-all"
            >
              ✖ Abortar Tarea
            </button>
          </div>
        )}

        {/* ACTIVE PHASE - NO TIMER (manual confirm) */}
        {phase === 'active' && !hasDuration && (
          <div className="px-6 py-6 space-y-5">
            <div className="rpg-panel text-center space-y-3">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-display text-base font-bold text-foreground">
                {task.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground font-display uppercase tracking-wider">
              ¿Completaste esta tarea?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleComplete(true)}
                className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] hover:opacity-90 transition-all"
              >
                ✅ Sí
              </button>
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 py-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.15em] hover:bg-destructive/30 transition-all"
              >
                ❌ No
              </button>
            </div>
          </div>
        )}

        {/* DONE PHASE - Timer finished */}
        {phase === 'done' && (
          <div className="px-6 py-6 space-y-5 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="font-display text-lg font-bold text-foreground">
              ¡Tiempo completado!
            </h2>
            <p className="text-sm text-muted-foreground">
              Has completado <span className="text-primary font-display">{task.name}</span>
            </p>

            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
              ¿Realizaste la tarea correctamente?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleComplete(true)}
                className="flex-1 py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] glow-primary hover:opacity-90 transition-all"
              >
                ✅ Sí, completada
              </button>
              <button
                onClick={() => handleComplete(false)}
                className="flex-1 py-3.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.15em] hover:bg-destructive/30 transition-all"
              >
                ❌ No la hice
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SkillTaskDialog;
