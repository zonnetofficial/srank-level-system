import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  rarity: string;
  price: number;
  icon: string;
  effect_type: string | null;
  effect_value: number | null;
  max_per_user: number | null;
  stock: number | null;
}

export interface DPPackage {
  id: string;
  name: string;
  dark_points: number;
  price_mxn: number;
  bonus_points: number;
  icon: string;
}

export interface TPPackage {
  id: string;
  name: string;
  t_points: number;
  price_mxn: number;
  bonus_points: number;
  icon: string;
}

export interface InventoryItem {
  id: string;
  item_id: string;
  quantity: number;
  acquired_at: string;
  source: string;
  item?: ShopItem;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  item_id: string | null;
  price: number;
  status: string;
  created_at: string;
  listing_type: 'item' | 'dp';
  dp_amount: number | null;
  item?: ShopItem;
}

// Marketplace prices are ~60% of shop price
const RARITY_MARKET_DISCOUNT: Record<string, number> = {
  common: 0.5,
  uncommon: 0.55,
  rare: 0.6,
  epic: 0.65,
  legendary: 0.7,
};

export function getMarketPrice(item: ShopItem): number {
  const discount = RARITY_MARKET_DISCOUNT[item.rarity] || 0.6;
  return Math.max(1, Math.floor(item.price * discount));
}

export function useShop() {
  const { user } = useAuth();
  const [dpBalance, setDpBalance] = useState(0);
  const [tpBalance, setTpBalance] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [dpPackages, setDpPackages] = useState<DPPackage[]>([]);
  const [tpPackages, setTpPackages] = useState<TPPackage[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    if (!user) return;
    const [dpRes, tpRes] = await Promise.all([
      supabase.from('dark_points').select('balance').eq('user_id', user.id).single(),
      supabase.from('t_points' as any).select('balance').eq('user_id', user.id).single(),
    ]);
    
    if (dpRes.data) setDpBalance((dpRes.data as any).balance);
    else {
      await supabase.from('dark_points').insert({ user_id: user.id, balance: 0, total_earned: 0, total_spent: 0 });
      setDpBalance(0);
    }

    if (tpRes.data) setTpBalance((tpRes.data as any).balance);
    else {
      await supabase.from('t_points' as any).insert({ user_id: user.id, balance: 0, total_earned: 0, total_spent: 0 } as any);
      setTpBalance(0);
    }
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [itemsRes, dpPkgRes, tpPkgRes, invRes, listRes] = await Promise.all([
      supabase.from('shop_items').select('*').eq('is_active', true),
      supabase.from('dp_packages').select('*').eq('is_active', true).order('price_mxn'),
      supabase.from('tp_packages' as any).select('*').eq('is_active', true).order('price_mxn'),
      supabase.from('user_inventory').select('*').eq('user_id', user.id),
      supabase.from('marketplace_listings').select('*').eq('status', 'active'),
    ]);

    if (itemsRes.data) setItems(itemsRes.data as ShopItem[]);
    if (dpPkgRes.data) setDpPackages(dpPkgRes.data as DPPackage[]);
    if (tpPkgRes.data) setTpPackages((tpPkgRes.data as any) as TPPackage[]);
    if (invRes.data) setInventory(invRes.data as InventoryItem[]);
    if (listRes.data) setListings(listRes.data as MarketplaceListing[]);

    await fetchBalances();
    setLoading(false);
  }, [user, fetchBalances]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Buy from creator shop with DP
  const buyItemWithDP = useCallback(async (item: ShopItem) => {
    if (!user) return false;
    if (dpBalance < item.price) {
      toast({ title: 'DP insuficientes', description: `Necesitas ${item.price} DP`, variant: 'destructive' });
      return false;
    }

    if (item.max_per_user) {
      const existing = inventory.find(i => i.item_id === item.id);
      if (existing && existing.quantity >= item.max_per_user) {
        toast({ title: 'Límite alcanzado', description: 'Ya tienes el máximo de este item', variant: 'destructive' });
        return false;
      }
    }

    const newBalance = dpBalance - item.price;
    await supabase.from('dark_points')
      .update({ balance: newBalance, total_spent: dpBalance - newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    await supabase.rpc('grant_inventory_item', { p_user_id: user.id, p_item_id: item.id, p_quantity: 1, p_source: 'shop' });

    toast({ title: '¡Compra exitosa!', description: `${item.icon} ${item.name} añadido a tu inventario` });
    await fetchAll();
    return true;
  }, [user, dpBalance, inventory, fetchAll]);

  // Buy from marketplace or shop with TP
  const buyItemWithTP = useCallback(async (item: ShopItem, marketPrice?: number) => {
    if (!user) return false;
    const price = marketPrice ?? getMarketPrice(item);
    if (tpBalance < price) {
      toast({ title: 'TP insuficientes', description: `Necesitas ${price} TP`, variant: 'destructive' });
      return false;
    }

    if (item.max_per_user) {
      const existing = inventory.find(i => i.item_id === item.id);
      if (existing && existing.quantity >= item.max_per_user) {
        toast({ title: 'Límite alcanzado', description: 'Ya tienes el máximo de este item', variant: 'destructive' });
        return false;
      }
    }

    const newBalance = tpBalance - price;
    await supabase.from('t_points' as any)
      .update({ balance: newBalance, total_spent: (tpBalance - newBalance), updated_at: new Date().toISOString() } as any)
      .eq('user_id', user.id);

    await supabase.rpc('grant_inventory_item', { p_user_id: user.id, p_item_id: item.id, p_quantity: 1, p_source: 'market' });

    toast({ title: '¡Compra exitosa!', description: `${item.icon} ${item.name} añadido (TP)` });
    await fetchAll();
    return true;
  }, [user, tpBalance, inventory, fetchAll]);

  // Buy marketplace listing with TP
  const buyListing = useCallback(async (listing: MarketplaceListing) => {
    if (!user) return false;
    if (listing.seller_id === user.id) {
      toast({ title: 'Error', description: 'No puedes comprar tu propio listing', variant: 'destructive' });
      return false;
    }
    if (tpBalance < listing.price) {
      toast({ title: 'TP insuficientes', description: `Necesitas ${listing.price} TP`, variant: 'destructive' });
      return false;
    }

    // Deduct TP from buyer
    const newBalance = tpBalance - listing.price;
    await supabase.from('t_points' as any)
      .update({ balance: newBalance, total_spent: (tpBalance - newBalance), updated_at: new Date().toISOString() } as any)
      .eq('user_id', user.id);

    // Mark listing as sold
    await supabase.from('marketplace_listings')
      .update({ status: 'sold', buyer_id: user.id, sold_at: new Date().toISOString() } as any)
      .eq('id', listing.id);

    if (listing.listing_type === 'dp' && listing.dp_amount) {
      // Transfer DP to buyer
      const { data: buyerDP } = await supabase.from('dark_points').select('balance, total_earned').eq('user_id', user.id).single();
      if (buyerDP) {
        await supabase.from('dark_points').update({
          balance: buyerDP.balance + listing.dp_amount,
          total_earned: buyerDP.total_earned + listing.dp_amount,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
      }
      toast({ title: '¡Compra exitosa!', description: `💎 ${listing.dp_amount} DP adquiridos del mercado` });
    } else if (listing.item_id) {
      // Add item to buyer inventory
      await supabase.rpc('grant_inventory_item', { p_user_id: user.id, p_item_id: listing.item_id, p_quantity: 1, p_source: 'marketplace' });
      toast({ title: '¡Compra exitosa!', description: 'Item adquirido del mercado' });
    }

    // Credit seller TP (no commission on P2P)
    const { data: sellerTP } = await supabase.from('t_points' as any).select('balance, total_earned').eq('user_id', listing.seller_id).single();
    if (sellerTP) {
      await supabase.from('t_points' as any)
        .update({ balance: (sellerTP as any).balance + listing.price, total_earned: (sellerTP as any).total_earned + listing.price, updated_at: new Date().toISOString() } as any)
        .eq('user_id', listing.seller_id);
    }

    await supabase.from('tp_transactions' as any)
      .insert({ user_id: user.id, amount: -listing.price, type: 'market_buy', description: `Compra mercado`, reference_id: listing.id } as any);

    await fetchAll();
    return true;
  }, [user, tpBalance, inventory, fetchAll]);

  // Sell item on marketplace
  const sellItem = useCallback(async (invItem: InventoryItem, item: ShopItem) => {
    if (!user) return false;
    if (invItem.quantity < 1) return false;

    const price = getMarketPrice(item);

    // Reduce inventory
    const newQty = Math.max(0, invItem.quantity - 1);
    await supabase.rpc('update_inventory_quantity', { p_inventory_id: invItem.id, p_new_quantity: newQty });

    // Create listing
    await supabase.from('marketplace_listings').insert({
      seller_id: user.id,
      item_id: item.id,
      price,
      status: 'active',
      listing_type: 'item',
    } as any);

    toast({ title: '¡Item en venta!', description: `${item.icon} ${item.name} por 🔷${price} TP` });
    await fetchAll();
    return true;
  }, [user, fetchAll]);

  const buyDPPackage = useCallback(async (pkg: DPPackage) => {
    if (!user) return null;
    const { data, error } = await supabase.functions.invoke('mercadopago', {
      body: {
        action: 'buy_dark_points',
        package_id: pkg.id,
        dark_points: pkg.dark_points + pkg.bonus_points,
        amount: pkg.price_mxn,
        back_url: window.location.origin + '/shop',
      },
    });
    if (error) {
      toast({ title: 'Error', description: 'No se pudo iniciar el pago', variant: 'destructive' });
      return null;
    }
    return data;
  }, [user]);

  const buyTPPackage = useCallback(async (pkg: TPPackage) => {
    if (!user) return null;
    const { data, error } = await supabase.functions.invoke('mercadopago', {
      body: {
        action: 'buy_t_points',
        package_id: pkg.id,
        t_points: pkg.t_points + pkg.bonus_points,
        amount: pkg.price_mxn,
        back_url: window.location.origin + '/shop',
      },
    });
    if (error) {
      toast({ title: 'Error', description: 'No se pudo iniciar el pago', variant: 'destructive' });
      return null;
    }
    return data;
  }, [user]);

  // Sell DP on marketplace for TP
  // DP to TP conversion: ~0.7 TP per 1 DP (cheaper than buying DP from store)
  const sellDP = useCallback(async (dpAmount: number) => {
    if (!user) return false;
    if (dpBalance < dpAmount || dpAmount < 10) {
      toast({ title: 'Error', description: 'Mínimo 10 DP para vender', variant: 'destructive' });
      return false;
    }

    const tpPrice = Math.floor(dpAmount * 0.7); // 0.7 TP per DP

    // Deduct DP from seller
    const newDpBalance = dpBalance - dpAmount;
    await supabase.from('dark_points')
      .update({ balance: newDpBalance, total_spent: dpBalance - newDpBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    // Create listing
    await supabase.from('marketplace_listings').insert({
      seller_id: user.id,
      item_id: null,
      price: tpPrice,
      status: 'active',
      listing_type: 'dp',
      dp_amount: dpAmount,
    } as any);

    await supabase.from('dp_transactions')
      .insert({ user_id: user.id, amount: -dpAmount, type: 'market_sell', description: `Venta: ${dpAmount} DP en mercado` });

    toast({ title: '¡DP en venta!', description: `💎 ${dpAmount} DP por 🔷${tpPrice} TP` });
    await fetchAll();
    return true;
  }, [user, dpBalance, fetchAll]);

  // Cancel an active listing — refund DP or item
  const cancelListing = useCallback(async (listing: MarketplaceListing) => {
    if (!user || listing.seller_id !== user.id || listing.status !== 'active') return false;

    // Mark as cancelled
    await supabase.from('marketplace_listings')
      .update({ status: 'cancelled' } as any)
      .eq('id', listing.id);

    if (listing.listing_type === 'dp' && listing.dp_amount) {
      // Refund DP
      const { data: dp } = await supabase.from('dark_points').select('balance').eq('user_id', user.id).single();
      if (dp) {
        await supabase.from('dark_points').update({
          balance: dp.balance + listing.dp_amount,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
      }
      await supabase.from('dp_transactions')
        .insert({ user_id: user.id, amount: listing.dp_amount, type: 'refund', description: `Cancelación venta: ${listing.dp_amount} DP` });
      toast({ title: 'Venta cancelada', description: `💎 ${listing.dp_amount} DP devueltos` });
    } else if (listing.item_id) {
      // Refund item
      await supabase.rpc('grant_inventory_item', { p_user_id: user.id, p_item_id: listing.item_id, p_quantity: 1, p_source: 'refund' });
      toast({ title: 'Venta cancelada', description: 'Item devuelto a tu inventario' });
    }

    await fetchAll();
    return true;
  }, [user, inventory, fetchAll]);

  const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

  return {
    dpBalance,
    tpBalance,
    items,
    dpPackages,
    tpPackages,
    inventory,
    listings,
    loading,
    buyItemWithDP,
    buyItemWithTP,
    buyListing,
    sellItem,
    sellDP,
    cancelListing,
    buyDPPackage,
    buyTPPackage,
    getItemById,
    getMarketPrice,
    refreshShop: fetchAll,
  };
}
