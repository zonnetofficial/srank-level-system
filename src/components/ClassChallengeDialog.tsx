import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { STAT_LABELS, STAT_ICONS, StatKey } from '@/lib/gameData';
import { ClassChallenge, ClassChallengeTask } from '@/lib/classChallenges';

interface ClassChallengeDialogProps {
  challenge: ClassChallenge | null;
  completedStats: StatKey[];
  open: boolean;
  onCompleteTask: (stat: StatKey) => void;
  onClose: () => void;
}

type Phase = 'overview' | 'intro' | 'active' | 'done';

const ClassChallengeDialog = ({ challenge, completedStats, open, onCompleteTask, onClose }: ClassChallengeDialogProps) => {
  const [phase, setPhase] = useState<Phase>('overview');
  const [activeTask, setActiveTask] = useState<ClassChallengeTask | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('overview');
      setActiveTask(null);
      setRunning(false);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [open]);

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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, secondsLeft]);

  if (!challenge) return null;

  const allCompleted = challenge.tasks.every(t => completedStats.includes(t.stat));

  const handleSelectTask = (task: ClassChallengeTask) => {
    if (completedStats.includes(task.stat)) return;
    setActiveTask(task);
    setPhase('intro');
  };

  const handleStartTask = () => {
    if (!activeTask) return;
    if (activeTask.durationSeconds) {
      setSecondsLeft(activeTask.durationSeconds);
      setRunning(true);
    }
    setPhase('active');
  };

  const handleAbort = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setPhase('overview');
    setActiveTask(null);
  };

  const handleConfirmComplete = (success: boolean) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    if (success && activeTask) {
      onCompleteTask(activeTask.stat);
    }
    setPhase('overview');
    setActiveTask(null);
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

  // Timer SVG
  const segments = 10;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 85;
  const innerRadius = 70;
  const gapDeg = 5;
  const segmentAngle = (360 - gapDeg * segments) / segments;
  const totalSeconds = activeTask?.durationSeconds || 1;
  const elapsed = totalSeconds - secondsLeft;
  const completedSegments = Math.floor(elapsed / (totalSeconds / segments));
  const progressInSegment = totalSeconds > 0 ? (elapsed % (totalSeconds / segments)) / (totalSeconds / segments) : 0;

  const polarToCart = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !running) onClose(); }}>
      <DialogContent className="bg-background border-border max-w-sm p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <DialogTitle className="font-display text-center text-primary text-glow-primary">
            ⚔️ Cambio de Clase: {challenge.className}
          </DialogTitle>
        </DialogHeader>

        {/* OVERVIEW - Task list */}
        {phase === 'overview' && (
          <div className="px-6 py-5 space-y-4">
            {allCompleted ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">🏆</div>
                <h2 className="font-display text-lg font-bold text-primary text-glow-primary">
                  ¡Clase Desbloqueada!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Has completado todos los desafíos y ahora eres un <span className="text-primary font-display font-bold">{challenge.className}</span>
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] glow-primary"
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {challenge.intro}
                </p>

                <div className="space-y-2">
                  {challenge.tasks.map(task => {
                    const isDone = completedStats.includes(task.stat);
                    return (
                      <button
                        key={task.stat}
                        onClick={() => handleSelectTask(task)}
                        disabled={isDone}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isDone
                            ? 'bg-primary/10 border-primary/30 opacity-70'
                            : 'bg-secondary/30 border-border hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{isDone ? '✅' : STAT_ICONS[task.stat]}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`font-display text-xs uppercase tracking-wider ${isDone ? 'text-primary' : `text-stat-${task.stat}`}`}>
                              {STAT_LABELS[task.stat]}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {task.name}
                            </div>
                          </div>
                          {!isDone && (
                            <span className="text-[10px] font-display text-muted-foreground">▶</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 stat-bar-track h-2">
                    <div
                      className="stat-bar-fill bg-primary"
                      style={{ width: `${(completedStats.length / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-display text-muted-foreground">
                    {completedStats.length}/5
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-display text-xs uppercase tracking-wider"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        )}

        {/* INTRO - Task description */}
        {phase === 'intro' && activeTask && (
          <div className="px-6 py-6 space-y-5">
            <div className="rpg-panel space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-display text-primary uppercase tracking-[0.2em]">
                  Desafío de {STAT_LABELS[activeTask.stat]}
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                {activeTask.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeTask.description}
              </p>
              {activeTask.durationSeconds && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <span className="text-primary text-sm">⏱</span>
                  <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                    Duración: {formatDuration(activeTask.durationSeconds)}
                  </span>
                </div>
              )}
            </div>

            <div className="rpg-panel bg-primary/5 border-primary/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-display font-bold">📋 Instrucciones:</span>{' '}
                {activeTask.durationSeconds
                  ? 'Al presionar "Iniciar", comenzará un temporizador. Realiza la tarea durante el tiempo indicado.'
                  : 'Realiza la tarea indicada. Cuando termines, confirma si la completaste exitosamente.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartTask}
                className="flex-1 py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.2em] glow-primary hover:opacity-90 transition-all"
              >
                ▶ Iniciar
              </button>
              <button
                onClick={handleAbort}
                className="py-3.5 px-4 rounded-lg bg-secondary text-secondary-foreground font-display text-xs uppercase tracking-wider"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE - With timer */}
        {phase === 'active' && activeTask?.durationSeconds && (
          <div className="flex flex-col items-center gap-4 px-6 py-6">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
              {activeTask.name}
            </p>

            <div className="relative">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={cx} cy={cy} r={(outerRadius + innerRadius) / 2} fill="none" stroke="hsl(var(--muted))" strokeWidth={outerRadius - innerRadius} opacity={0.3} />
                {Array.from({ length: segments }).map((_, i) => {
                  const startAngle = -90 + i * (segmentAngle + gapDeg);
                  const endAngle = startAngle + segmentAngle;
                  const isDone = i < completedSegments;
                  const isActive = i === completedSegments && running;
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
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] font-display text-primary/60 uppercase tracking-widest mt-1 animate-pulse">En curso</span>
              </div>
            </div>

            <button onClick={handleAbort} className="w-full py-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-xs uppercase tracking-[0.2em] hover:bg-destructive/30 transition-all">
              ✖ Abortar
            </button>
          </div>
        )}

        {/* ACTIVE - No timer (manual) */}
        {phase === 'active' && activeTask && !activeTask.durationSeconds && (
          <div className="px-6 py-6 space-y-5">
            <div className="rpg-panel text-center space-y-3">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-display text-base font-bold text-foreground">{activeTask.name}</h3>
              <p className="text-sm text-muted-foreground">{activeTask.description}</p>
            </div>
            <p className="text-xs text-center text-muted-foreground font-display uppercase tracking-wider">¿Completaste este desafío?</p>
            <div className="flex gap-3">
              <button onClick={() => handleConfirmComplete(true)} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em]">✅ Sí</button>
              <button onClick={() => handleConfirmComplete(false)} className="flex-1 py-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.15em]">❌ No</button>
            </div>
          </div>
        )}

        {/* DONE - Timer completed */}
        {phase === 'done' && activeTask && (
          <div className="px-6 py-6 space-y-5 text-center">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="font-display text-lg font-bold text-foreground">¡Tiempo completado!</h2>
            <p className="text-sm text-muted-foreground">
              Has completado <span className="text-primary font-display">{activeTask.name}</span>
            </p>
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">¿Realizaste la tarea correctamente?</p>
            <div className="flex gap-3">
              <button onClick={() => handleConfirmComplete(true)} className="flex-1 py-3.5 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-[0.15em] glow-primary">✅ Sí, completada</button>
              <button onClick={() => handleConfirmComplete(false)} className="flex-1 py-3.5 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive font-display text-sm uppercase tracking-[0.15em]">❌ No la hice</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClassChallengeDialog;
