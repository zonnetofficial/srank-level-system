interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
}

export function XPBar({ xp, xpToNext, level }: XPBarProps) {
  const pct = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="rpg-panel-glow text-center">
      <div className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">
        Level
      </div>
      <div className="font-display text-5xl font-black text-primary text-glow-primary mb-2">
        {level}
      </div>
      <div className="stat-bar-track h-3 mb-1">
        <div
          className="stat-bar-fill bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-display">
        <span>{xp} XP</span>
        <span>{xpToNext} XP</span>
      </div>
    </div>
  );
}
