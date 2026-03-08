interface PackageItem {
  id: string;
  name: string;
  icon: string;
  price_mxn: number;
  bonus_points: number;
  dark_points?: number;
  t_points?: number;
}

interface Props {
  packages: PackageItem[];
  currency: 'DP' | 'TP';
  icon: string;
  subtitle: string;
  buying: boolean;
  onBuy: (pkg: any) => void;
}

export default function PackagesTab({ packages, currency, icon, subtitle, buying, onBuy }: Props) {
  const getPoints = (pkg: PackageItem) => currency === 'DP' ? pkg.dark_points || 0 : (pkg as any).t_points || 0;

  return (
    <div className="space-y-3 animate-slide-up">
      <p className="text-[10px] text-muted-foreground text-center font-body mb-2">{subtitle}</p>
      {packages.map((pkg, i) => (
        <button
          key={pkg.id}
          onClick={() => onBuy(pkg)}
          disabled={buying}
          className="w-full rpg-panel p-4 flex items-center gap-3 text-left border-accent/20 hover:border-accent/40 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className="text-3xl">{pkg.icon}</span>
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-accent">{pkg.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {icon} {getPoints(pkg)} {currency}
              {pkg.bonus_points > 0 && <span className="text-stat-agi ml-1">+{pkg.bonus_points} bonus</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-sm font-bold text-primary">${pkg.price_mxn} MXN</div>
          </div>
        </button>
      ))}
    </div>
  );
}
