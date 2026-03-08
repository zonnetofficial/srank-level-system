interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
}

export function XPBar({ xp, xpToNext, level }: XPBarProps) {
  const pct = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="rpg-panel-glow text-center py-5">
      <div className="hud-label mb-1">System Level</div>
      <div className="font-display text-5xl font-black text-primary text-glow-primary mb-3 animate-data-flicker">
        {String(level).padStart(2, '0')}
      </div>
      <div className="relative mx-2">
        <div className="stat-bar-track h-3">
          <div
            className="stat-bar-fill bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between px-1" style={{ top: '1px' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-1.5 bg-primary/20" />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-mono mt-1.5 px-1">
        <span className="hud-data">{xp}/{xpToNext}</span>
        <span className="hud-data">{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
