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
  item_id: string;
  price: number;
  status: string;
  created_at: string;
  item?: ShopItem;
}

export function useShop() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [packages, setPackages] = useState<DPPackage[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('dark_points')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setBalance(data.balance);
    } else {
      // Create initial balance
      await supabase.from('dark_points').insert({ user_id: user.id, balance: 0, total_earned: 0, total_spent: 0 });
      setBalance(0);
    }
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [itemsRes, pkgRes, invRes, listRes] = await Promise.all([
      supabase.from('shop_items').select('*').eq('is_active', true),
      supabase.from('dp_packages').select('*').eq('is_active', true).order('price_mxn'),
      supabase.from('user_inventory').select('*').eq('user_id', user.id),
      supabase.from('marketplace_listings').select('*').eq('status', 'active'),
    ]);

    if (itemsRes.data) setItems(itemsRes.data as ShopItem[]);
    if (pkgRes.data) setPackages(pkgRes.data as DPPackage[]);
    if (invRes.data) setInventory(invRes.data as InventoryItem[]);
    if (listRes.data) setListings(listRes.data as MarketplaceListing[]);

    await fetchBalance();
    setLoading(false);
  }, [user, fetchBalance]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const buyItem = useCallback(async (item: ShopItem) => {
    if (!user) return false;
    if (balance < item.price) {
      toast({ title: 'DP insuficientes', description: `Necesitas ${item.price} DP`, variant: 'destructive' });
      return false;
    }

    // Check max per user
    if (item.max_per_user) {
      const existing = inventory.find(i => i.item_id === item.id);
      if (existing && existing.quantity >= item.max_per_user) {
        toast({ title: 'Límite alcanzado', description: 'Ya tienes el máximo de este item', variant: 'destructive' });
        return false;
      }
    }

    // Deduct balance
    const newBalance = balance - item.price;
    await supabase.from('dark_points')
      .update({ balance: newBalance, total_spent: balance - newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    // Add to inventory (upsert)
    const existing = inventory.find(i => i.item_id === item.id);
    if (existing) {
      await supabase.from('user_inventory')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_inventory')
        .insert({ user_id: user.id, item_id: item.id, quantity: 1, source: 'shop' });
    }

    // Log transaction
    await supabase.from('dp_transactions')
      .insert({ user_id: user.id, amount: -item.price, type: 'spend', description: `Compra: ${item.name}`, reference_id: item.id });

    toast({ title: '¡Compra exitosa!', description: `${item.icon} ${item.name} añadido a tu inventario` });
    await fetchAll();
    return true;
  }, [user, balance, inventory, fetchAll]);

  const buyDPPackage = useCallback(async (pkg: DPPackage) => {
    if (!user) return null;

    // Call MercadoPago edge function to create payment
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

  const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

  return {
    balance,
    items,
    packages,
    inventory,
    listings,
    loading,
    buyItem,
    buyDPPackage,
    getItemById,
    refreshShop: fetchAll,
  };
}
