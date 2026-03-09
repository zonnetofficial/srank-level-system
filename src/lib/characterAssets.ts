// Character base sprites
import baseWarrior from '@/assets/character/base-warrior.png';
import baseMage from '@/assets/character/base-mage.png';
import baseAssassin from '@/assets/character/base-assassin.png';
import baseMonk from '@/assets/character/base-monk.png';

// Equipment overlays - Armor
import equipIronShield from '@/assets/character/equip-iron-shield.png';
import equipChainmail from '@/assets/character/equip-chainmail.png';
import equipDragonArmor from '@/assets/character/equip-dragon-armor.png';
import equipCelestialArmor from '@/assets/character/equip-celestial-armor.png';

// Equipment overlays - Weapons
import equipRustySword from '@/assets/character/equip-rusty-sword.png';
import equipShadowDagger from '@/assets/character/equip-shadow-dagger.png';
import equipArcaneStaff from '@/assets/character/equip-arcane-staff.png';

// Equipment overlays - Auras
import auraFire from '@/assets/character/aura-fire.png';
import auraIce from '@/assets/character/aura-ice.png';

// Equipment overlays - Frame
import equipGoldenFrame from '@/assets/character/equip-golden-frame.png';

// Equipment overlays - Accessories
import equipResurrectionRing from '@/assets/character/equip-resurrection-ring.png';
import equipLuckAmulet from '@/assets/character/equip-luck-amulet.png';
import equipEliteInsignia from '@/assets/character/equip-elite-insignia.png';

// Base character sprites by class
export const CHARACTER_BASE_SPRITES: Record<string, string> = {
  warrior: baseWarrior,
  mage: baseMage,
  assassin: baseAssassin,
  monk: baseMonk,
};

// Equipment images mapped by item name
export const EQUIPMENT_IMAGES: Record<string, string> = {
  // Armor slot
  'Escudo de Hierro': equipIronShield,
  'Cota de Malla': equipChainmail,
  'Armadura de Dragón': equipDragonArmor,
  'Armadura Celestial': equipCelestialArmor,
  
  // Weapon slot
  'Espada Oxidada': equipRustySword,
  'Daga de Sombras': equipShadowDagger,
  'Bastón Arcano': equipArcaneStaff,
  
  // Aura slot
  'Aura de Fuego': auraFire,
  'Aura de Hielo': auraIce,
  
  // Frame slot
  'Marco Dorado': equipGoldenFrame,
  
  // Accessory slot
  'Anillo de Resurrección': equipResurrectionRing,
  'Amuleto de Suerte': equipLuckAmulet,
  'Insignia de Élite': equipEliteInsignia,
};

// Slot-specific positioning/sizing for overlay layers
export const LAYER_POSITIONS: Record<string, React.CSSProperties> = {
  // Aura: behind character, full size
  aura: { position: 'absolute', inset: '-20%', zIndex: 0, opacity: 0.5 },
  // Frame: around character
  frame: { position: 'absolute', inset: '-6%', zIndex: 5, opacity: 0.9 },
  // Armor: overlay on body torso area
  armor: { position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '50%', zIndex: 2 },
  // Weapon: to the right side, angled
  weapon: { position: 'absolute', bottom: '5%', right: '-15%', width: '45%', height: '70%', zIndex: 3, transform: 'rotate(-20deg)' },
  // Accessory: near neck/chest area
  accessory: { position: 'absolute', top: '8%', right: '8%', width: '25%', height: '25%', zIndex: 4 },
};
