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
import progressElixir from '@/assets/items/progress-elixir.png';
import xpPotion from '@/assets/items/xp-potion.png';
import statStone from '@/assets/items/stat-stone.png';
import antiPunishmentShield from '@/assets/items/anti-punishment-shield.png';
import darkHunterTitle from '@/assets/items/dark-hunter-title.png';
import eliteInsignia from '@/assets/items/elite-insignia.png';
import fireAura from '@/assets/items/fire-aura.png';
import goldenFrame from '@/assets/items/golden-frame.png';
import iceAura from '@/assets/items/ice-aura.png';

// Map item names to their custom icon images
const ITEM_ICON_MAP: Record<string, string> = {
  // Dungeon items
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
  // Booster items
  'Elixir de Progreso': progressElixir,
  'Poción de XP': xpPotion,
  // Consumable items
  'Piedra de Stat': statStone,
  'Escudo Anti-Castigo': antiPunishmentShield,
  // Vanity items
  'Título: Cazador Oscuro': darkHunterTitle,
  'Insignia de Élite': eliteInsignia,
  'Aura de Fuego': fireAura,
  'Marco Dorado': goldenFrame,
  'Aura de Hielo': iceAura,
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
