import { ShopItem, getMarketPrice } from '@/hooks/useShop';
import { RARITY_COLORS, RARITY_GLOW, RARITY_LABELS, CATEGORY_LABELS } from './shopConstants';
import ItemIcon from '@/components/ItemIcon';

interface Props {
  item: ShopItem;
  dpBalance: number;
  tpBalance: number;
  buying: boolean;
  onClose: () => void;
  onBuyDP: () => void;
  onBuyTP: () => void;
}

export default function ItemDetailModal({ item, dpBalance, tpBalance, buying, onClose, onBuyDP, onBuyTP }: Props) {
  const tpPrice = getMarketPrice(item);
  const btnClip = 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`rpg-panel p-6 max-w-sm w-full space-y-4 ${RARITY_COLORS[item.rarity]} ${RARITY_GLOW[item.rarity]}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <span className="text-5xl block mb-2">{item.icon}</span>
          <h2 className="font-display text-lg font-bold">{item.name}</h2>
          <span className={`text-[10px] font-display uppercase tracking-wider ${RARITY_COLORS[item.rarity]}`}>
            {RARITY_LABELS[item.rarity]} · {CATEGORY_LABELS[item.category]}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground font-body text-center">{item.description}</p>
        )}
        {item.effect_type && (
          <div className="text-center text-[10px] text-stat-agi font-display uppercase tracking-wider">
            Efecto: {item.effect_type} ×{item.effect_value}
          </div>
        )}
        <div className="flex justify-center gap-4">
          <span className="hud-data text-sm text-accent text-glow-accent">💎 {item.price} DP</span>
          <span className="hud-data text-sm text-primary text-glow-primary">🔷 {tpPrice} TP</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-[10px] font-display uppercase tracking-[0.15em] text-muted-foreground border border-border/30 hover:border-border/50 transition-all" style={{ clipPath: btnClip }}>
            Cancelar
          </button>
          <button
            onClick={onBuyDP}
            disabled={buying || dpBalance < item.price}
            className="flex-1 py-2 text-[10px] font-display uppercase tracking-[0.15em] text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ clipPath: btnClip }}
          >
            {dpBalance < item.price ? 'Sin DP' : '💎 Comprar'}
          </button>
          <button
            onClick={onBuyTP}
            disabled={buying || tpBalance < tpPrice}
            className="flex-1 py-2 text-[10px] font-display uppercase tracking-[0.15em] text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ clipPath: btnClip }}
          >
            {tpBalance < tpPrice ? 'Sin TP' : '🔷 Comprar'}
          </button>
        </div>
      </div>
    </div>
  );
}
