import { MarketplaceListing, ShopItem } from '@/hooks/useShop';
import { RARITY_COLORS, RARITY_LABELS } from './shopConstants';

interface Props {
  listings: MarketplaceListing[];
  getItemById: (id: string) => ShopItem | undefined;
  tpBalance: number;
  buying: boolean;
  onBuy: (listing: MarketplaceListing) => void;
}

export default function MarketTab({ listings, getItemById, tpBalance, buying, onBuy }: Props) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-slide-up">
        <span className="text-4xl block mb-2">🏛️</span>
        <p className="hud-label">Mercado vacío</p>
        <p className="text-[10px] font-body mt-1">Los jugadores aún no han puesto items a la venta</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-slide-up">
      <p className="text-[10px] text-muted-foreground text-center font-body mb-2">
        Compra items de otros jugadores con T-Points 🔷
      </p>
      {listings.map((listing, i) => {
        const item = getItemById(listing.item_id);
        if (!item) return null;
        return (
          <div
            key={listing.id}
            className={`rpg-panel p-3 flex items-center gap-3 ${RARITY_COLORS[item.rarity]}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xs font-bold truncate">{item.name}</div>
              <div className="text-[9px] text-muted-foreground">{RARITY_LABELS[item.rarity]}</div>
            </div>
            <button
              onClick={() => onBuy(listing)}
              disabled={buying || tpBalance < listing.price}
              className="text-[9px] font-display uppercase tracking-wider px-2 py-1 border border-primary/30 text-primary hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(0 2px, 2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px))' }}
            >
              🔷 {listing.price} TP
            </button>
          </div>
        );
      })}
    </div>
  );
}
