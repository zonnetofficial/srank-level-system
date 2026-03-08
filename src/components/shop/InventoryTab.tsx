import { InventoryItem, ShopItem, getMarketPrice } from '@/hooks/useShop';
import { RARITY_COLORS, RARITY_LABELS } from './shopConstants';

interface Props {
  inventory: InventoryItem[];
  getItemById: (id: string) => ShopItem | undefined;
  onSell: (inv: InventoryItem) => void;
}

export default function InventoryTab({ inventory, getItemById, onSell }: Props) {
  const activeInventory = inventory.filter(inv => inv.quantity > 0);

  if (activeInventory.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-slide-up">
        <span className="text-4xl block mb-2">🎒</span>
        <p className="hud-label">Inventario vacío</p>
        <p className="text-[10px] font-body mt-1">Compra items en la tienda o consíguelos en misiones</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-slide-up">
      {activeInventory.map((inv, i) => {
        const item = getItemById(inv.item_id);
        if (!item) return null;
        const marketPrice = getMarketPrice(item);
        return (
          <div
            key={inv.id}
            className={`rpg-panel p-3 flex items-center gap-3 ${RARITY_COLORS[item.rarity]}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xs font-bold truncate">{item.name}</div>
              <div className="text-[9px] text-muted-foreground">{RARITY_LABELS[item.rarity]} · ×{inv.quantity}</div>
            </div>
            <button
              onClick={() => onSell(inv)}
              className="text-[9px] font-display uppercase tracking-wider px-2 py-1 border border-primary/30 text-primary hover:bg-primary/10 transition-all"
              style={{ clipPath: 'polygon(0 2px, 2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px))' }}
            >
              Vender 🔷{marketPrice}
            </button>
          </div>
        );
      })}
    </div>
  );
}
