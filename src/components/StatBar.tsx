import { StatKey, getSkillTitle, getNextSkillTitle } from '@/lib/gameData';

interface StatBarProps {
  stat: StatKey;
  value: number;
  points: number;
  label: string;
  icon: string;
}

const statColorClasses: Record<StatKey, { bar: string; text: string }> = {
  int: { bar: 'bg-stat-int', text: 'text-stat-int' },
  str: { bar: 'bg-stat-str', text: 'text-stat-str' },
  agi: { bar: 'bg-stat-agi', text: 'text-stat-agi' },
  vit: { bar: 'bg-stat-vit', text: 'text-stat-vit' },
  end: { bar: 'bg-stat-end', text: 'text-stat-end' },
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

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-xs font-display uppercase tracking-wider ${colors.text}`}>
            {label}
          </span>
          <span className={`text-sm font-display font-bold ${colors.text}`}>
            {value}
          </span>
        </div>
        <div className="stat-bar-track">
          <div
            className={`stat-bar-fill ${colors.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
