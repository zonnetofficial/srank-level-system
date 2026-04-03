import { useState, useEffect } from 'react';
import VictorianFrame from '@/components/VictorianFrame';
import { useShop, ShopItem, getMarketPrice } from '@/hooks/useShop';
import SlotNumber from '@/components/SlotNumber';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sfxClick, sfxHover, sfxPurchase } from '@/lib/audioEngine';
import ShopTab from '@/components/shop/ShopTab';
import PackagesTab from '@/components/shop/PackagesTab';
import InventoryTab from '@/components/shop/InventoryTab';
import MarketTab from '@/components/shop/MarketTab';
import ItemDetailModal from '@/components/shop/ItemDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Tab = 'shop' | 'dp' | 'tp' | 'inventory' | 'market';

const Shop = () => {
  const shop = useShop();
  const [tab, setTab] = useState<Tab>('shop');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [buying, setBuying] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Verify payment on return from MercadoPago
  useEffect(() => {
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const status = searchParams.get('collection_status') || searchParams.get('status');
    const dpSuccess = searchParams.get('dp_success');
    const tpSuccess = searchParams.get('tp_success');

    if (paymentId && (status === 'approved' || dpSuccess === 'true' || tpSuccess === 'true')) {
      supabase.functions.invoke('mercadopago', {
        body: { action: 'webhook_payment', payment_id: paymentId },
      }).then(({ data, error }) => {
        if (!error && data?.success) {
          if (data.already_processed) {
            toast({ title: 'Pago ya procesado', description: 'Tus monedas ya fueron acreditadas.' });
          } else {
            toast({ title: '¡Pago verificado!', description: 'Tus monedas han sido acreditadas.' });
            sfxPurchase();
          }
          shop.refreshShop();
        } else if (error) {
          toast({ title: 'Error al verificar pago', description: 'Intenta recargar la página.', variant: 'destructive' });
        }
      });
      // Clean URL params
      window.history.replaceState({}, '', '/shop');
    }
  }, []);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'shop', label: 'Tienda', icon: '🏪' },
    { key: 'dp', label: 'DP', icon: '💎' },
    { key: 'tp', label: 'TP', icon: '🔷' },
    { key: 'inventory', label: 'Mochila', icon: '🎒' },
    { key: 'market', label: 'Mercado', icon: '🏛️' },
  ];

  const handleBuyDP = async (item: ShopItem) => {
    setBuying(true);
    const result = await shop.buyItemWithDP(item);
    if (result) sfxPurchase();
    setSelectedItem(null);
    setBuying(false);
  };

  const handleBuyTP = async (item: ShopItem) => {
    setBuying(true);
    const result = await shop.buyItemWithTP(item);
    if (result) sfxPurchase();
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
            onClick={() => { setTab(t.key); sfxClick(); }}
            onMouseEnter={() => sfxHover()}
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
          dpBalance={shop.dpBalance}
          buying={buying}
          onBuy={async (listing) => {
            setBuying(true);
            await shop.buyListing(listing);
            setBuying(false);
          }}
          onSellDP={(amount) => shop.sellDP(amount)}
          onCancel={(listing) => shop.cancelListing(listing)}
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
