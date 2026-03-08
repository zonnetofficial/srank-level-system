import ironShield from '@/assets/items/iron-shield.png';
import rustySword from '@/assets/items/rusty-sword.png';
import chainmail from '@/assets/items/chainmail.png';
import shadowDagger from '@/assets/items/shadow-dagger.png';
import dragonArmor from '@/assets/items/dragon-armor.png';
import arcaneStaff from '@/assets/items/arcane-staff.png';
import hpPotion from '@/assets/items/hp-potion.png';
import staminaPotion from '@/assets/items/stamina-potion.png';
import elixir from '@/assets/items/elixir.png';
import luckAmulet from '@/assets/items/luck-amulet.png';
import resurrectionRing from '@/assets/items/resurrection-ring.png';
import celestialArmor from '@/assets/items/celestial-armor.png';

// Map item names to their custom icon images
const ITEM_ICON_MAP: Record<string, string> = {
  'Escudo de Hierro': ironShield,
  'Espada Oxidada': rustySword,
  'Cota de Malla': chainmail,
  'Daga de Sombras': shadowDagger,
  'Armadura de Dragón': dragonArmor,
  'Bastón Arcano': arcaneStaff,
  'Poción de Vida': hpPotion,
  'Poción de Stamina': staminaPotion,
  'Elixir de Vida': elixir,
  'Amuleto de Suerte': luckAmulet,
  'Anillo de Resurrección': resurrectionRing,
  'Armadura Celestial': celestialArmor,
};

interface ItemIconProps {
  name: string;
  fallbackEmoji: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export default function ItemIcon({ name, fallbackEmoji, size = 'md', className = '' }: ItemIconProps) {
  const iconSrc = ITEM_ICON_MAP[name];

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={name}
        className={`${sizeMap[size]} object-contain ${className}`}
        draggable={false}
      />
    );
  }

  // Fallback to emoji
  return <span className={`text-${size === 'sm' ? 'lg' : size === 'md' ? '2xl' : '3xl'} ${className}`}>{fallbackEmoji}</span>;
}

export { ITEM_ICON_MAP };
