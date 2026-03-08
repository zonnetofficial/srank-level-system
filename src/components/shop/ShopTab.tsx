import { ShopItem } from '@/hooks/useShop';
import { RARITY_COLORS, RARITY_GLOW, RARITY_LABELS, CATEGORY_LABELS } from './shopConstants';
import ItemIcon from '@/components/ItemIcon';

interface Props {
  items: ShopItem[];
  onSelect: (item: ShopItem) => void;
}

export default function ShopTab({ items, onSelect }: Props) {
  return (
    <div className="space-y-2 animate-slide-up">
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`w-full rpg-panel p-3 flex items-center gap-3 text-left transition-all duration-200 hover:scale-[1.01] ${RARITY_COLORS[item.rarity]} ${RARITY_GLOW[item.rarity]}`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <ItemIcon name={item.name} fallbackEmoji={item.icon} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="font-display text-xs font-bold truncate">{item.name}</div>
            <div className="text-[9px] text-muted-foreground">{CATEGORY_LABELS[item.category]} · {RARITY_LABELS[item.rarity]}</div>
          </div>
          <div className="text-right">
            <div className="hud-data text-xs text-accent">💎 {item.price}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
