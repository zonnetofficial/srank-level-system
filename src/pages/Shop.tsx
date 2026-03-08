import { useState } from 'react';
import VictorianFrame from '@/components/VictorianFrame';
import { useShop, ShopItem, getMarketPrice } from '@/hooks/useShop';
import SlotNumber from '@/components/SlotNumber';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ShopTab from '@/components/shop/ShopTab';
import PackagesTab from '@/components/shop/PackagesTab';
import InventoryTab from '@/components/shop/InventoryTab';
import MarketTab from '@/components/shop/MarketTab';
import ItemDetailModal from '@/components/shop/ItemDetailModal';

type Tab = 'shop' | 'dp' | 'tp' | 'inventory' | 'market';

const Shop = () => {
  const shop = useShop();
  const [tab, setTab] = useState<Tab>('shop');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'shop', label: 'Tienda', icon: '🏪' },
    { key: 'dp', label: 'DP', icon: '💎' },
    { key: 'tp', label: 'TP', icon: '🔷' },
    { key: 'inventory', label: 'Mochila', icon: '🎒' },
    { key: 'market', label: 'Mercado', icon: '🏛️' },
  ];

  const handleBuyDP = async (item: ShopItem) => {
    setBuying(true);
    await shop.buyItemWithDP(item);
    setSelectedItem(null);
    setBuying(false);
  };

  const handleBuyTP = async (item: ShopItem) => {
    setBuying(true);
    await shop.buyItemWithTP(item);
    setSelectedItem(null);
    setBuying(false);
  };

  if (shop.loading) {
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm">💎</span>
            <span className="hud-data text-xs text-accent text-glow-accent">
              <SlotNumber value={String(shop.dpBalance).padStart(4, '0')} delay={200} />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🔷</span>
            <span className="hud-data text-xs text-primary text-glow-primary">
              <SlotNumber value={String(shop.tpBalance).padStart(4, '0')} delay={300} />
            </span>
          </div>
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
            className={`flex-1 py-2 text-[9px] font-display uppercase tracking-[0.12em] border transition-all duration-200 ${
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

      {tab === 'shop' && <ShopTab items={shop.items} onSelect={setSelectedItem} />}
      {tab === 'dp' && (
        <PackagesTab
          packages={shop.dpPackages}
          currency="DP"
          icon="💎"
          subtitle="Compra Dark Points — moneda del creador"
          buying={buying}
          onBuy={async (pkg) => {
            setBuying(true);
            const result = await shop.buyDPPackage(pkg);
            if (result?.init_point) window.open(result.init_point, '_blank');
            setBuying(false);
          }}
        />
      )}
      {tab === 'tp' && (
        <PackagesTab
          packages={shop.tpPackages}
          currency="TP"
          icon="🔷"
          subtitle="Compra T-Points — moneda de intercambio (15% comisión)"
          buying={buying}
          onBuy={async (pkg) => {
            setBuying(true);
            const result = await shop.buyTPPackage(pkg);
            if (result?.init_point) window.open(result.init_point, '_blank');
            setBuying(false);
          }}
        />
      )}
      {tab === 'inventory' && (
        <InventoryTab
          inventory={shop.inventory}
          getItemById={shop.getItemById}
          onSell={(inv) => {
            const item = shop.getItemById(inv.item_id);
            if (item) shop.sellItem(inv, item);
          }}
        />
      )}
      {tab === 'market' && (
        <MarketTab
          listings={shop.listings}
          getItemById={shop.getItemById}
          tpBalance={shop.tpBalance}
          buying={buying}
          onBuy={async (listing) => {
            setBuying(true);
            await shop.buyListing(listing);
            setBuying(false);
          }}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          dpBalance={shop.dpBalance}
          tpBalance={shop.tpBalance}
          buying={buying}
          onClose={() => setSelectedItem(null)}
          onBuyDP={() => handleBuyDP(selectedItem)}
          onBuyTP={() => handleBuyTP(selectedItem)}
        />
      )}
    </VictorianFrame>
  );
};

export default Shop;
