import { useState } from 'react';
import { MarketplaceListing, ShopItem } from '@/hooks/useShop';
import { RARITY_COLORS, RARITY_LABELS } from './shopConstants';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  listings: MarketplaceListing[];
  getItemById: (id: string) => ShopItem | undefined;
  tpBalance: number;
  dpBalance: number;
  buying: boolean;
  onBuy: (listing: MarketplaceListing) => void;
  onSellDP: (amount: number) => void;
  onCancel: (listing: MarketplaceListing) => void;
}

export default function MarketTab({ listings, getItemById, tpBalance, dpBalance, buying, onBuy, onSellDP, onCancel }: Props) {
  const { user } = useAuth();
  const [dpSellAmount, setDpSellAmount] = useState('');
  const tpPreview = dpSellAmount ? Math.floor(Number(dpSellAmount) * 0.7) : 0;

  return (
    <div className="space-y-3 animate-slide-up">
      <p className="text-[10px] text-muted-foreground text-center font-body mb-2">
        Mercado P2P — compra y vende con T-Points 🔷 (sin comisión)
      </p>

      {/* Sell DP section */}
      <div className="rpg-panel p-3 border-accent/20">
        <div className="text-[10px] font-display uppercase tracking-wider text-accent mb-2">Vender Dark Points</div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="number"
              min={10}
              max={dpBalance}
              placeholder="Cantidad DP"
              value={dpSellAmount}
              onChange={(e) => setDpSellAmount(e.target.value)}
              className="w-full bg-background/50 border border-border/30 rounded px-2 py-1.5 text-xs font-display text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
            />
            {tpPreview > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-primary">
                → 🔷{tpPreview} TP
              </span>
            )}
          </div>
          <button
            onClick={() => {
              const amt = Number(dpSellAmount);
              if (amt >= 10) {
                onSellDP(amt);
                setDpSellAmount('');
              }
            }}
            disabled={!dpSellAmount || Number(dpSellAmount) < 10 || Number(dpSellAmount) > dpBalance}
            className="text-[9px] font-display uppercase tracking-wider px-3 py-1.5 border border-accent/30 text-accent hover:bg-accent/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ clipPath: 'polygon(0 2px, 2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px))' }}
          >
            Vender
          </button>
        </div>
        <div className="text-[8px] text-muted-foreground mt-1">Mínimo 10 DP · Ratio: 1 DP = 0.7 TP</div>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <span className="text-3xl block mb-2">🏛️</span>
          <p className="hud-label">Sin listings activos</p>
        </div>
      ) : (
        listings.map((listing, i) => {
          if (listing.listing_type === 'dp') {
            return (
              <div
                key={listing.id}
                className="rpg-panel p-3 flex items-center gap-3 text-accent border-accent/30"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-2xl">💎</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xs font-bold">{listing.dp_amount} Dark Points</div>
                  <div className="text-[9px] text-muted-foreground">Moneda del creador</div>
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
          }

          const item = listing.item_id ? getItemById(listing.item_id) : null;
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
        })
      )}
    </div>
  );
}
