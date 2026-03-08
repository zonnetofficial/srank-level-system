import { useState } from 'react';
import VictorianFrame from '@/components/VictorianFrame';
import { useShop, ShopItem } from '@/hooks/useShop';
import SlotNumber from '@/components/SlotNumber';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground border-muted-foreground/30',
  uncommon: 'text-stat-agi border-stat-agi/30',
  rare: 'text-primary border-primary/30',
  epic: 'text-stat-vit border-stat-vit/30',
  legendary: 'text-accent border-accent/30',
};

const RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: 'shadow-[0_0_8px_hsl(150_85%_52%/0.2)]',
  rare: 'shadow-[0_0_10px_hsl(195_100%_55%/0.25)]',
  epic: 'shadow-[0_0_12px_hsl(340_85%_62%/0.3)]',
  legendary: 'shadow-[0_0_15px_hsl(45_100%_60%/0.35)]',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Común',
  uncommon: 'Poco Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

const CATEGORY_LABELS: Record<string, string> = {
  vanity: 'Vanidad',
  booster: 'Mejora',
  consumable: 'Consumible',
  special: 'Especial',
};

type Tab = 'shop' | 'packages' | 'inventory' | 'market';

const Shop = () => {
  const { balance, items, packages, inventory, listings, loading, buyItem, buyDPPackage, getItemById } = useShop();
  const [tab, setTab] = useState<Tab>('shop');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'shop', label: 'Tienda', icon: '🏪' },
    { key: 'packages', label: 'Dark Points', icon: '💎' },
    { key: 'inventory', label: 'Inventario', icon: '🎒' },
    { key: 'market', label: 'Mercado', icon: '🏛️' },
  ];

  const handleBuyItem = async (item: ShopItem) => {
    setBuying(true);
    await buyItem(item);
    setSelectedItem(null);
    setBuying(false);
  };

  const handleBuyDP = async (pkg: typeof packages[0]) => {
    setBuying(true);
    const result = await buyDPPackage(pkg);
    if (result?.init_point) {
      window.open(result.init_point, '_blank');
    }
    setBuying(false);
  };

  if (loading) {
    return (
      <VictorianFrame>
        <div className="flex items-center justify-center py-20">
          <div className="text-primary font-display text-lg animate-pulse">Cargando tienda...</div>
        </div>
      </VictorianFrame>
    );
  }

  return (
    <VictorianFrame>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 animate-slide-down">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={14} />
          <span className="hud-label">Volver</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm">💎</span>
          <span className="hud-data text-sm text-accent text-glow-accent">
            <SlotNumber value={String(balance).padStart(4, '0')} delay={200} />
          </span>
          <span className="hud-label">DP</span>
        </div>
      </div>

      <h1 className="text-center font-display text-2xl font-bold text-primary text-glow-primary mb-4 animate-text-color-slide">
        🏪 Tienda Oscura
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-[9px] font-display uppercase tracking-[0.15em] border transition-all duration-200 ${
              tab === t.key
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/30 text-muted-foreground hover:border-border/50'
            }`}
            style={{ clipPath: 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))' }}
          >
            <span className="text-base block">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Shop tab */}
      {tab === 'shop' && (
        <div className="space-y-2 animate-slide-up">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`w-full rpg-panel p-3 flex items-center gap-3 text-left transition-all duration-200 hover:scale-[1.01] ${RARITY_COLORS[item.rarity]} ${RARITY_GLOW[item.rarity]}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-2xl">{item.icon}</span>
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
      )}

      {/* DP Packages tab */}
      {tab === 'packages' && (
        <div className="space-y-3 animate-slide-up">
          <p className="text-[10px] text-muted-foreground text-center font-body mb-2">
            Compra Dark Points con dinero real vía MercadoPago
          </p>
          {packages.map((pkg, i) => (
            <button
              key={pkg.id}
              onClick={() => handleBuyDP(pkg)}
              disabled={buying}
              className="w-full rpg-panel p-4 flex items-center gap-3 text-left border-accent/20 hover:border-accent/40 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-3xl">{pkg.icon}</span>
              <div className="flex-1">
                <div className="font-display text-sm font-bold text-accent">{pkg.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  💎 {pkg.dark_points} DP
                  {pkg.bonus_points > 0 && <span className="text-stat-agi ml-1">+{pkg.bonus_points} bonus</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-sm font-bold text-primary">${pkg.price_mxn} MXN</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Inventory tab */}
      {tab === 'inventory' && (
        <div className="space-y-2 animate-slide-up">
          {inventory.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <span className="text-4xl block mb-2">🎒</span>
              <p className="hud-label">Inventario vacío</p>
              <p className="text-[10px] font-body mt-1">Compra items en la tienda o consíguelos en misiones</p>
            </div>
          ) : (
            inventory.map((inv, i) => {
              const item = getItemById(inv.item_id);
              if (!item) return null;
              return (
                <div
                  key={inv.id}
                  className={`rpg-panel p-3 flex items-center gap-3 ${RARITY_COLORS[item.rarity]}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs font-bold truncate">{item.name}</div>
                    <div className="text-[9px] text-muted-foreground">{RARITY_LABELS[item.rarity]}</div>
                  </div>
                  <div className="hud-data text-xs">×{inv.quantity}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Market tab */}
      {tab === 'market' && (
        <div className="space-y-2 animate-slide-up">
          {listings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <span className="text-4xl block mb-2">🏛️</span>
              <p className="hud-label">Mercado vacío</p>
              <p className="text-[10px] font-body mt-1">Aún no hay items a la venta</p>
            </div>
          ) : (
            listings.map((listing, i) => {
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
                  <div className="hud-data text-xs text-accent">💎 {listing.price}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Item detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div
            className={`rpg-panel p-6 max-w-sm w-full space-y-4 ${RARITY_COLORS[selectedItem.rarity]} ${RARITY_GLOW[selectedItem.rarity]}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <span className="text-5xl block mb-2">{selectedItem.icon}</span>
              <h2 className="font-display text-lg font-bold">{selectedItem.name}</h2>
              <span className={`text-[10px] font-display uppercase tracking-wider ${RARITY_COLORS[selectedItem.rarity]}`}>
                {RARITY_LABELS[selectedItem.rarity]} · {CATEGORY_LABELS[selectedItem.category]}
              </span>
            </div>
            {selectedItem.description && (
              <p className="text-xs text-muted-foreground font-body text-center">{selectedItem.description}</p>
            )}
            {selectedItem.effect_type && (
              <div className="text-center text-[10px] text-stat-agi font-display uppercase tracking-wider">
                Efecto: {selectedItem.effect_type} ×{selectedItem.effect_value}
              </div>
            )}
            <div className="text-center">
              <span className="hud-data text-lg text-accent text-glow-accent">💎 {selectedItem.price} DP</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2 text-[10px] font-display uppercase tracking-[0.15em] text-muted-foreground border border-border/30 hover:border-border/50 transition-all"
                style={{ clipPath: 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleBuyItem(selectedItem)}
                disabled={buying || balance < selectedItem.price}
                className="flex-1 py-2 text-[10px] font-display uppercase tracking-[0.15em] text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ clipPath: 'polygon(0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 0 calc(100% - 3px))' }}
              >
                {balance < selectedItem.price ? 'DP insuficientes' : 'Comprar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </VictorianFrame>
  );
};

export default Shop;
