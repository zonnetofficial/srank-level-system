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

type Phase = 'intro' | 'prep' | 'active' | 'roundPause' | 'done';

const PREP_SECONDS = 5;

const SkillTaskDialog = ({ stat, task, open, onResult, onClose }: SkillTaskDialogProps) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const hasDuration = !!task?.durationSeconds;
  const totalRounds = task?.timerRounds || 1;
  const totalSeconds = task?.durationSeconds || 0;
  const roundSeconds = totalRounds > 1 ? Math.floor(totalSeconds / totalRounds) : totalSeconds;
  const roundLabels = task?.roundLabels;

  const getRoundLabel = (round: number) => {
    if (roundLabels && roundLabels[round - 1]) return roundLabels[round - 1];
    if (totalRounds > 1) return `Ronda ${round}`;
    return null;
  };

  // Clear interval helper
  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase('intro');
      setSecondsLeft(0);
      setCurrentRound(1);
    }
    return clearTimer;
  }, [open]);

  // Countdown logic for both prep and active phases
  useEffect(() => {
    if ((phase === 'prep' || phase === 'active') && secondsLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearTimer();
            if (phase === 'prep') {
              // Prep done → start actual round timer
              setPhase('active');
              return roundSeconds;
            } else {
              // Round done → pause or finish
              if (currentRound < totalRounds) {
                setPhase('roundPause');
              } else {
                setPhase('done');
              }
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [phase, secondsLeft, currentRound, totalRounds, roundSeconds]);

  if (!stat || !task) return null;

  const handleStart = () => {
    if (hasDuration) {
      setCurrentRound(1);
      // Start with prep countdown
      setPhase('prep');
      setSecondsLeft(PREP_SECONDS);
    } else {
      setPhase('active');
    }
  };

  const handleNextRound = () => {
    setCurrentRound(prev => prev + 1);
    // Start prep for next round
    setPhase('prep');
    setSecondsLeft(PREP_SECONDS);
  };

  const handleAbort = () => {
    clearTimer();
    onClose();
  };

  const handleComplete = (success: boolean) => {
    clearTimer();
    onResult(success);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const formatDuration = (s: number) => {
    if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min`;
    if (s >= 60) return `${Math.floor(s / 60)} min${s % 60 > 0 ? ` ${s % 60}s` : ''}`;
    return `${s} segundos`;
  };

  // Timer SVG config
  const segments = 10;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 85;
  const innerRadius = 70;
  const gapDeg = 5;
  const segmentAngle = (360 - gapDeg * segments) / segments;

  const polarToCart = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const renderTimer = (seconds: number, total: number, label: string) => {
    const elapsed = total - seconds;
    const secondsPerSegment = total / segments;
    const completedSegments = secondsPerSegment > 0 ? Math.floor(elapsed / secondsPerSegment) : 0;
    const progressInSegment = secondsPerSegment > 0 ? (elapsed % secondsPerSegment) / secondsPerSegment : 0;

    return (
      <div className="flex justify-center">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={(outerRadius + innerRadius) / 2} fill="none" stroke="hsl(var(--muted))" strokeWidth={outerRadius - innerRadius} opacity={0.3} />
            {Array.from({ length: segments }).map((_, i) => {
              const startAngle = -90 + i * (segmentAngle + gapDeg);
              const endAngle = startAngle + segmentAngle;
              const isDone = i < completedSegments;
              const isActive = i === completedSegments;
              const oS = polarToCart(startAngle, outerRadius);
              const oE = polarToCart(endAngle, outerRadius);
              const iS = polarToCart(startAngle, innerRadius);
              const iE = polarToCart(endAngle, innerRadius);
              const la = segmentAngle > 180 ? 1 : 0;
              const d = `M ${oS.x} ${oS.y} A ${outerRadius} ${outerRadius} 0 ${la} 1 ${oE.x} ${oE.y} L ${iE.x} ${iE.y} A ${innerRadius} ${innerRadius} 0 ${la} 0 ${iS.x} ${iS.y} Z`;

              let fillOpacity = 0.1;
              let strokeOpacity = 0.3;
              if (isDone) { fillOpacity = 0.3; strokeOpacity = 0.6; }
              else if (isActive) { fillOpacity = 0.5 + progressInSegment * 0.5; strokeOpacity = 1; }

              return (
                <g key={i}>
                  <path d={d} fill="hsl(var(--primary))" opacity={fillOpacity} style={{ transition: 'opacity 0.8s ease' }} />
                  <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth={isActive ? 2 : 1.5} opacity={strokeOpacity} style={{ transition: 'opacity 0.5s', filter: isActive ? 'drop-shadow(0 0 4px hsl(var(--primary)))' : 'none' }} />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold tracking-wider text-primary" style={{ textShadow: '0 0 15px hsl(var(--primary) / 0.5)' }}>
              {formatTime(seconds)}
            </span>
            <span className="text-[10px] font-display text-primary/60 uppercase tracking-widest mt-1 animate-pulse">
              {label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const statColor = `text-stat-${stat}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && phase === 'intro') onClose(); }}>
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
                    {totalRounds > 1 && ` (${totalRounds} rondas de ${formatDuration(roundSeconds)})`}
                  </span>
                </div>
              )}
            </div>

            {/* Show round breakdown if labels exist */}
            {roundLabels && roundLabels.length > 0 && (
              <div className="rpg-panel space-y-2">
                <span className="text-[10px] font-display text-muted-foreground uppercase tracking-[0.2em]">
                  Rondas
                </span>
                <div className="space-y-1">
                  {roundLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-display">
                        {i + 1}
                      </span>
                      <span>{label}</span>
                      <span className="ml-auto text-primary/60 font-display">{formatDuration(roundSeconds)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rpg-panel bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-display font-bold">📋 Instrucciones:</span>{' '}
                {hasDuration
                  ? totalRounds > 1
                    ? `Tendrás 5 segundos para prepararte antes de cada ronda. Luego el temporizador de ${formatDuration(roundSeconds)} comenzará automáticamente.`
                    : 'Tendrás 5 segundos para prepararte. Luego comenzará el temporizador automáticamente.'
                  : 'Realiza la tarea indicada. Cuando termines, confirma si la completaste exitosamente o no.'}
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

        {/* PREP PHASE - 5 second countdown */}
        {phase === 'prep' && hasDuration && (
          <div className="px-6 py-8 space-y-6">
            {/* Current round label */}
            <div className="text-center space-y-2">
              {getRoundLabel(currentRound) && (
                <div className="rpg-panel inline-block px-4 py-2 mx-auto">
                  <span className="text-sm font-display font-bold text-primary">
                    {getRoundLabel(currentRound)}
                  </span>
                </div>
              )}
              <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em]">
                Prepárate
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-accent/30 animate-pulse" />
                <span
                  className="font-display text-6xl font-bold text-accent"
                  style={{ textShadow: '0 0 20px hsl(var(--accent) / 0.6)' }}
                >
                  {secondsLeft}
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              El ejercicio comenzará automáticamente...
            </p>

            <button onClick={handleAbort} className="w-full py-2.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-xs uppercase tracking-[0.15em]">
              ✖ Cancelar
            </button>
          </div>
        )}

        {/* ACTIVE PHASE - WITH TIMER */}
        {phase === 'active' && hasDuration && (
          <div className="px-6 py-5 space-y-4">
            {/* Current exercise label only */}
            <div className="rpg-panel text-center py-2">
              {getRoundLabel(currentRound) ? (
                <p className="font-display text-sm font-bold text-primary">
                  {getRoundLabel(currentRound)}
                </p>
              ) : (
                <p className="font-display text-sm font-bold text-foreground">
                  {task.name}
                </p>
              )}
            </div>

            {/* Round indicator for multi-round tasks */}
            {totalRounds > 1 && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: totalRounds }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i < currentRound - 1
                          ? 'hsl(var(--primary))'
                          : i === currentRound - 1
                          ? 'hsl(var(--primary) / 0.6)'
                          : 'hsl(var(--muted))',
                        boxShadow: i < currentRound - 1 ? '0 0 4px hsl(var(--primary) / 0.4)' : 'none',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-display text-muted-foreground">
                  {currentRound}/{totalRounds}
                </span>
              </div>
            )}

            {/* Circular timer */}
            {renderTimer(secondsLeft, roundSeconds, getRoundLabel(currentRound) || 'En curso')}

            <button onClick={handleAbort} className="w-full py-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-xs uppercase tracking-[0.2em] hover:bg-destructive/30 transition-all">
              ✖ Abortar Tarea
            </button>
          </div>
        )}

        {/* ROUND PAUSE */}
        {phase === 'roundPause' && (
          <div className="px-6 py-6 space-y-4 text-center">
            <div className="text-3xl">✅</div>
            <p className="text-sm font-display text-primary">
              {getRoundLabel(currentRound) || `Ronda ${currentRound}`} completada
            </p>
            {getRoundLabel(currentRound + 1) && (
              <p className="text-xs text-muted-foreground">
                Siguiente: <span className="text-foreground font-display font-bold">{getRoundLabel(currentRound + 1)}</span>
              </p>
            )}
            <button
              onClick={handleNextRound}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] glow-primary hover:opacity-90 transition-all"
            >
              ▶ Siguiente
            </button>
            <button
              onClick={handleAbort}
              className="w-full py-2.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-xs uppercase tracking-[0.15em]"
            >
              ✖ Abortar
            </button>
          </div>
        )}

        {/* ACTIVE PHASE - NO TIMER (manual confirm) */}
        {phase === 'active' && !hasDuration && (
          <div className="px-6 py-6 space-y-5">
            <div className="rpg-panel space-y-3">
              <h3 className="font-display text-base font-bold text-foreground">
                {task.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground font-display uppercase tracking-wider">
              ¿Completaste esta tarea?
            </p>

            <div className="flex gap-3">
              <button onClick={() => handleComplete(true)} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] hover:opacity-90 transition-all">
                ✅ Sí
              </button>
              <button onClick={() => handleComplete(false)} className="flex-1 py-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.15em] hover:bg-destructive/30 transition-all">
                ❌ No
              </button>
            </div>
          </div>
        )}

        {/* DONE PHASE */}
        {phase === 'done' && (
          <div className="px-6 py-6 space-y-5 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {totalRounds > 1 ? `¡${totalRounds} rondas completadas!` : '¡Tiempo completado!'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Has completado <span className="text-primary font-display">{task.name}</span>
            </p>

            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
              ¿Realizaste la tarea correctamente?
            </p>

            <div className="flex gap-3">
              <button onClick={() => handleComplete(true)} className="flex-1 py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] glow-primary hover:opacity-90 transition-all">
                ✅ Sí, completada
              </button>
              <button onClick={() => handleComplete(false)} className="flex-1 py-3.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.15em] hover:bg-destructive/30 transition-all">
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
