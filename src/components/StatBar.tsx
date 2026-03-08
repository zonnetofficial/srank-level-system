import { StatKey, getSkillTitle, getNextSkillTitle } from '@/lib/gameData';
import SlotNumber from '@/components/SlotNumber';

interface StatBarProps {
  stat: StatKey;
  value: number;
  points: number;
  label: string;
  icon: string;
}

const statColorClasses: Record<StatKey, { bar: string; text: string; glow: string }> = {
  int: { bar: 'bg-stat-int', text: 'text-stat-int', glow: 'glow-int' },
  str: { bar: 'bg-stat-str', text: 'text-stat-str', glow: 'glow-str' },
  agi: { bar: 'bg-stat-agi', text: 'text-stat-agi', glow: 'glow-agi' },
  vit: { bar: 'bg-stat-vit', text: 'text-stat-vit', glow: 'glow-vit' },
  end: { bar: 'bg-stat-end', text: 'text-stat-end', glow: 'glow-end' },
};


export function StatBar({ stat, value, points, label, icon }: StatBarProps) {
  const colors = statColorClasses[stat];
  const currentTitle = getSkillTitle(stat, points);
  const nextTitle = getNextSkillTitle(stat, points);

  let pct = 100;
  if (nextTitle) {
    const rangeStart = currentTitle.requiredPoints;
    const rangeEnd = nextTitle.requiredPoints;
    const progress = points - rangeStart;
    const range = rangeEnd - rangeStart;
    pct = Math.min((progress / range) * 100, 100);
  }

  // Different delay per stat for non-synchronized glitch
  const glitchDelays: Record<StatKey, string> = {
    int: '3s', str: '7s', agi: '11s', vit: '5s', end: '9s',
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className="flex items-center justify-center w-8 h-8 text-lg transition-transform duration-200 group-hover:scale-125">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-[11px] font-display uppercase tracking-[0.15em] ${colors.text}`}>
            {label}
          </span>
          <span className={`hud-data text-sm font-bold ${colors.text}`}>
            <SlotNumber value={String(value).padStart(3, '0')} delay={400} />
          </span>
        </div>
        <div className="stat-bar-track h-1.5">
          <div
            className={`stat-bar-fill ${colors.bar} animate-bar-fill`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
