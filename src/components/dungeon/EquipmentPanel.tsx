import { useState } from 'react';
import { useCharacterEquipment, SLOT_LABELS, getSlotForItem, getSlotForVanityItem, type EquipmentSlot, type FullEquipment } from '@/hooks/useCharacterEquipment';
import { useShop } from '@/hooks/useShop';
import { useGameState } from '@/hooks/useGameState';
import { getClassTitle, getSkillTitle, type StatKey } from '@/lib/gameData';
import CharacterAvatar from '@/components/dungeon/CharacterAvatar';
import ItemIcon from '@/components/ItemIcon';
import { RARITY_COLORS, RARITY_LABELS } from '@/components/shop/shopConstants';
import { sfxClick, sfxSuccess } from '@/lib/audioEngine';

interface Props {
  sprite: string;
  characterName: string;
  characterClass?: string;
}

const ALL_SLOTS: EquipmentSlot[] = ['weapon', 'armor', 'aura', 'frame', 'title', 'accessory'];
const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

export default function EquipmentPanel({ sprite, characterName, characterClass }: Props) {
  const { equipment, equipItem, unequipSlot, loading } = useCharacterEquipment();
  const shop = useShop();
  const { state } = useGameState();
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  // Get available items for a specific slot
  const getItemsForSlot = (slot: EquipmentSlot) => {
    const items: { inventoryId: string; itemId: string; name: string; icon: string; rarity: string }[] = [];

    for (const inv of shop.inventory) {
      if (inv.quantity <= 0) continue;
      const item = shop.getItemById(inv.item_id);
      if (!item) continue;

      let itemSlot: EquipmentSlot | null = null;
      if (item.category === 'vanity') {
        itemSlot = getSlotForVanityItem(item.name);
      } else {
        itemSlot = getSlotForItem({ category: item.category, effect_type: item.effect_type });
      }

      if (itemSlot === slot) {
        items.push({
          inventoryId: inv.id,
          itemId: item.id,
          name: item.name,
          icon: item.icon,
          rarity: item.rarity,
        });
      }
    }

    return items;
  };

  // Get available titles
  const getAvailableTitles = () => {
    const titles: string[] = [];
    
    // Class titles
    const currentClass = getClassTitle(state.level, state.classTitles);
    if (currentClass) titles.push(currentClass.name);
    for (const ct of state.classTitles) {
      if (ct.obtained && !titles.includes(ct.name)) titles.push(ct.name);
    }

    // Skill titles
    for (const stat of statKeys) {
      const title = getSkillTitle(stat, state.statPoints[stat]);
      if (title) titles.push(title.name);
    }

    return titles;
  };

  const handleEquipItem = async (slot: EquipmentSlot, itemId: string) => {
    sfxClick();
    await equipItem(slot, itemId, null);
    sfxSuccess();
    setSelectedSlot(null);
  };

  const handleEquipTitle = async (titleKey: string) => {
    sfxClick();
    await equipItem('title', null, titleKey);
    sfxSuccess();
    setSelectedSlot(null);
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    sfxClick();
    await unequipSlot(slot);
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground text-xs animate-pulse">Cargando equipamiento...</div>;
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Character preview */}
      <div className="rpg-panel flex justify-center py-4">
        <CharacterAvatar
          sprite={sprite}
          characterName={characterName}
          characterClass={characterClass}
          equipment={equipment}
          size="lg"
          showTitle
        />
      </div>

      {/* Equipment slots */}
      <div className="grid grid-cols-3 gap-2">
        {ALL_SLOTS.map(slot => {
          const info = SLOT_LABELS[slot];
          const eq = equipment.find(e => e.slot === slot);
          const isSelected = selectedSlot === slot;

          return (
            <button
              key={slot}
              onClick={() => {
                sfxClick();
                setSelectedSlot(isSelected ? null : slot);
              }}
              className={`rpg-panel p-2 flex flex-col items-center gap-1 transition-all ${
                isSelected ? 'border-primary/60 bg-primary/5' : eq ? 'border-accent/30' : ''
              }`}
            >
              {eq?.item_name ? (
                <ItemIcon name={eq.item_name} fallbackEmoji={eq.item_icon || info.icon} size="sm" />
              ) : eq?.title_key ? (
                <span className="text-lg">🏷️</span>
              ) : (
                <span className="text-lg opacity-30">{info.icon}</span>
              )}
              <span className="text-[8px] font-display uppercase tracking-wider text-muted-foreground">
                {info.label}
              </span>
              {eq && (
                <span className="text-[7px] text-accent truncate max-w-full">
                  {eq.title_key || eq.item_name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slot detail / item selection */}
      {selectedSlot && (
        <div className="rpg-panel space-y-2 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="hud-label">{SLOT_LABELS[selectedSlot].icon} {SLOT_LABELS[selectedSlot].label}</h4>
            {equipment.find(e => e.slot === selectedSlot) && (
              <button
                onClick={() => handleUnequip(selectedSlot)}
                className="text-[9px] font-display text-destructive hover:text-destructive/80 px-2 py-0.5 border border-destructive/30"
              >
                Desequipar
              </button>
            )}
          </div>

          {selectedSlot === 'title' ? (
            // Title selection
            <div className="space-y-1">
              {getAvailableTitles().length === 0 ? (
                <p className="text-[9px] text-muted-foreground text-center py-2">No tienes títulos disponibles</p>
              ) : (
                getAvailableTitles().map(title => {
                  const isEquipped = equipment.find(e => e.slot === 'title')?.title_key === title;
                  return (
                    <button
                      key={title}
                      onClick={() => handleEquipTitle(title)}
                      disabled={isEquipped}
                      className={`w-full text-left p-2 text-[10px] font-display border transition-all ${
                        isEquipped ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border/30 hover:border-primary/40 text-foreground'
                      }`}
                    >
                      🏷️ {title} {isEquipped && '✓'}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            // Item selection
            <div className="space-y-1">
              {getItemsForSlot(selectedSlot).length === 0 ? (
                <p className="text-[9px] text-muted-foreground text-center py-2">
                  No tienes items para este slot. Compra en la tienda.
                </p>
              ) : (
                getItemsForSlot(selectedSlot).map(item => {
                  const isEquipped = equipment.find(e => e.slot === selectedSlot)?.item_id === item.itemId;
                  return (
                    <button
                      key={item.inventoryId}
                      onClick={() => handleEquipItem(selectedSlot, item.itemId)}
                      disabled={isEquipped}
                      className={`w-full text-left p-2 flex items-center gap-2 border transition-all ${
                        isEquipped ? 'border-accent/40 bg-accent/10' : `border-border/30 hover:border-primary/40 ${RARITY_COLORS[item.rarity]}`
                      }`}
                    >
                      <ItemIcon name={item.name} fallbackEmoji={item.icon} size="sm" />
                      <div>
                        <div className="text-[10px] font-display">{item.name}</div>
                        <div className="text-[8px] text-muted-foreground">{RARITY_LABELS[item.rarity]}</div>
                      </div>
                      {isEquipped && <span className="ml-auto text-accent text-[10px]">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
