import { FullEquipment, SLOT_LABELS, type EquipmentSlot } from '@/hooks/useCharacterEquipment';
import ItemIcon from '@/components/ItemIcon';

interface Props {
  sprite: string;
  characterName: string;
  characterClass?: string;
  equipment: FullEquipment[];
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  showSlotLabels?: boolean;
}

const AURA_STYLES: Record<string, string> = {
  'Aura de Fuego': 'shadow-[0_0_20px_hsl(var(--destructive)/0.6)] animate-pulse',
  'Aura de Hielo': 'shadow-[0_0_20px_hsl(var(--primary)/0.6)] animate-pulse',
  'Aura Oscura': 'shadow-[0_0_20px_hsl(var(--foreground)/0.4)] animate-pulse',
  'Corona de Fuego': 'shadow-[0_0_25px_hsl(var(--accent)/0.5)] animate-pulse',
  'Halo Divino': 'shadow-[0_0_25px_hsl(var(--accent)/0.7)] animate-pulse',
};

const FRAME_STYLES: Record<string, string> = {
  'Marco Dorado': 'ring-2 ring-accent',
};

const sizeClasses = {
  sm: { container: 'w-20 h-24', sprite: 'text-3xl', items: 'text-xs' },
  md: { container: 'w-28 h-32', sprite: 'text-5xl', items: 'text-sm' },
  lg: { container: 'w-36 h-40', sprite: 'text-6xl', items: 'text-base' },
};

export default function CharacterAvatar({ sprite, characterName, characterClass, equipment, size = 'md', showTitle = true, showSlotLabels = false }: Props) {
  const s = sizeClasses[size];
  
  const auraEq = equipment.find(e => e.slot === 'aura');
  const frameEq = equipment.find(e => e.slot === 'frame');
  const titleEq = equipment.find(e => e.slot === 'title');
  const weaponEq = equipment.find(e => e.slot === 'weapon');
  const armorEq = equipment.find(e => e.slot === 'armor');
  const accessoryEq = equipment.find(e => e.slot === 'accessory');

  const auraClass = auraEq?.item_name ? (AURA_STYLES[auraEq.item_name] || '') : '';
  const frameClass = frameEq?.item_name ? (FRAME_STYLES[frameEq.item_name] || 'ring-1 ring-primary/30') : '';

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Title above character */}
      {showTitle && titleEq && (
        <div className="text-[9px] font-display uppercase tracking-wider text-accent animate-pulse">
          {titleEq.title_key || titleEq.item_name || ''}
        </div>
      )}

      {/* Character container with layers */}
      <div className={`${s.container} relative flex items-center justify-center rounded-lg bg-secondary/30 ${auraClass} ${frameClass}`}>
        {/* Armor layer (behind sprite) */}
        {armorEq?.item_name && (
          <div className="absolute top-1 right-1 opacity-70">
            <ItemIcon name={armorEq.item_name} fallbackEmoji={armorEq.item_icon || '🛡️'} size="sm" />
          </div>
        )}

        {/* Main sprite */}
        <span className={s.sprite}>{sprite}</span>

        {/* Weapon layer */}
        {weaponEq?.item_name && (
          <div className="absolute bottom-1 left-1 opacity-80">
            <ItemIcon name={weaponEq.item_name} fallbackEmoji={weaponEq.item_icon || '⚔️'} size="sm" />
          </div>
        )}

        {/* Accessory layer */}
        {accessoryEq?.item_name && (
          <div className="absolute bottom-1 right-1 opacity-70">
            <ItemIcon name={accessoryEq.item_name} fallbackEmoji={accessoryEq.item_icon || '💍'} size="sm" />
          </div>
        )}
      </div>

      {/* Character name */}
      <span className="font-display text-[10px] text-foreground">{characterName}</span>
    </div>
  );
}
