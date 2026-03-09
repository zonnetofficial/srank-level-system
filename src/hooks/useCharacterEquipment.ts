import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type EquipmentSlot = 'weapon' | 'armor' | 'aura' | 'frame' | 'title' | 'accessory';

export interface EquippedItem {
  id: string;
  slot: EquipmentSlot;
  item_id: string | null;
  title_key: string | null;
}

export interface FullEquipment {
  slot: EquipmentSlot;
  item_id: string | null;
  title_key: string | null;
  item_name?: string;
  item_icon?: string;
  item_rarity?: string;
  item_effect_type?: string;
}

// Map effect_type / category to slot
export function getSlotForItem(item: { category: string; effect_type: string | null }): EquipmentSlot | null {
  if (item.category === 'vanity') {
    if (item.effect_type === null) {
      // Check by name patterns handled at call site
      return null;
    }
  }
  if (item.category === 'dungeon') {
    switch (item.effect_type) {
      case 'damage_reduction': return 'armor';
      case 'extra_time': return 'weapon';
      case 'revive': return 'accessory';
      case 'luck_boost': return 'accessory';
      default: return null;
    }
  }
  return null;
}

export function getSlotForVanityItem(name: string): EquipmentSlot | null {
  if (name.includes('Aura')) return 'aura';
  if (name.includes('Marco')) return 'frame';
  if (name.includes('Insignia')) return 'accessory';
  if (name.includes('Título')) return 'title';
  return null;
}

const SLOT_LABELS: Record<EquipmentSlot, { label: string; icon: string }> = {
  weapon: { label: 'Arma', icon: '⚔️' },
  armor: { label: 'Armadura', icon: '🛡️' },
  aura: { label: 'Aura', icon: '✨' },
  frame: { label: 'Marco', icon: '🖼️' },
  title: { label: 'Título', icon: '🏷️' },
  accessory: { label: 'Accesorio', icon: '💍' },
};

export { SLOT_LABELS };

export function useCharacterEquipment(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [equipment, setEquipment] = useState<FullEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const { data: eqData } = await supabase
        .from('character_equipment' as any)
        .select('*')
        .eq('user_id', targetUserId);

      if (!eqData || eqData.length === 0) {
        setEquipment([]);
        setLoading(false);
        return;
      }

      // Fetch item details for equipped items
      const itemIds = (eqData as any[]).filter((e: any) => e.item_id).map((e: any) => e.item_id);
      let itemsMap: Record<string, any> = {};
      if (itemIds.length > 0) {
        const { data: items } = await supabase
          .from('shop_items')
          .select('*')
          .in('id', itemIds);
        if (items) {
          for (const item of items) {
            itemsMap[item.id] = item;
          }
        }
      }

      const fullEq: FullEquipment[] = (eqData as any[]).map((e: any) => {
        const item = e.item_id ? itemsMap[e.item_id] : null;
        return {
          slot: e.slot as EquipmentSlot,
          item_id: e.item_id,
          title_key: e.title_key,
          item_name: item?.name,
          item_icon: item?.icon,
          item_rarity: item?.rarity,
          item_effect_type: item?.effect_type,
        };
      });

      setEquipment(fullEq);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const equipItem = useCallback(async (slot: EquipmentSlot, itemId: string | null, titleKey: string | null) => {
    if (!user) return;

    // Upsert: delete existing + insert
    await supabase.from('character_equipment' as any).delete().eq('user_id', user.id).eq('slot', slot);
    
    if (itemId || titleKey) {
      await supabase.from('character_equipment' as any).insert({
        user_id: user.id,
        slot,
        item_id: itemId,
        title_key: titleKey,
      } as any);
    }

    await fetchEquipment();
  }, [user, fetchEquipment]);

  const unequipSlot = useCallback(async (slot: EquipmentSlot) => {
    if (!user) return;
    await supabase.from('character_equipment' as any).delete().eq('user_id', user.id).eq('slot', slot);
    await fetchEquipment();
  }, [user, fetchEquipment]);

  const getEquipped = useCallback((slot: EquipmentSlot): FullEquipment | undefined => {
    return equipment.find(e => e.slot === slot);
  }, [equipment]);

  return { equipment, loading, equipItem, unequipSlot, getEquipped, fetchEquipment };
}
