import { FullEquipment, type EquipmentSlot } from '@/hooks/useCharacterEquipment';
import { CHARACTER_BASE_SPRITES, EQUIPMENT_IMAGES, LAYER_POSITIONS } from '@/lib/characterAssets';

interface Props {
  sprite?: string;
  characterName: string;
  characterClass?: string;
  equipment: FullEquipment[];
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

const sizeClasses = {
  sm: { container: 'w-20 h-28', base: 'w-20 h-28' },
  md: { container: 'w-32 h-44', base: 'w-32 h-44' },
  lg: { container: 'w-44 h-60', base: 'w-44 h-60' },
};

export default function CharacterAvatar({ sprite, characterName, characterClass, equipment, size = 'md', showTitle = true }: Props) {
  const s = sizeClasses[size];
  
  const titleEq = equipment.find(e => e.slot === 'title');
  const auraEq = equipment.find(e => e.slot === 'aura');
  const frameEq = equipment.find(e => e.slot === 'frame');
  const armorEq = equipment.find(e => e.slot === 'armor');
  const weaponEq = equipment.find(e => e.slot === 'weapon');
  const accessoryEq = equipment.find(e => e.slot === 'accessory');

  // Get base character image
  const baseImage = characterClass ? CHARACTER_BASE_SPRITES[characterClass] : null;

  // Helper to get equipment overlay image
  const getOverlayImage = (eq: FullEquipment | undefined) => {
    if (!eq?.item_name) return null;
    return EQUIPMENT_IMAGES[eq.item_name] || null;
  };

  const auraImg = getOverlayImage(auraEq);
  const frameImg = getOverlayImage(frameEq);
  const armorImg = getOverlayImage(armorEq);
  const weaponImg = getOverlayImage(weaponEq);
  const accessoryImg = getOverlayImage(accessoryEq);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Title above character */}
      {showTitle && titleEq && (
        <div className="text-[9px] font-display uppercase tracking-wider text-accent text-center px-2 py-0.5 border border-accent/30 bg-accent/5 rounded-sm">
          {titleEq.title_key || titleEq.item_name || ''}
        </div>
      )}

      {/* Character container with layers */}
      <div className={`${s.container} relative flex items-center justify-center overflow-visible`}>
        {/* Aura layer (behind everything) */}
        {auraImg && (
          <img
            src={auraImg}
            alt="Aura"
            className="absolute w-full h-full object-contain animate-pulse pointer-events-none"
            style={{ zIndex: 0, opacity: 0.4, scale: '1.4' }}
            draggable={false}
          />
        )}

        {/* Frame layer */}
        {frameImg && (
          <img
            src={frameImg}
            alt="Frame"
            className="absolute w-full h-full object-contain pointer-events-none"
            style={{ zIndex: 5, opacity: 0.9, scale: '1.12' }}
            draggable={false}
          />
        )}

        {/* Base character */}
        {baseImage ? (
          <img
            src={baseImage}
            alt={characterName}
            className={`${s.base} object-contain relative`}
            style={{ zIndex: 1 }}
            draggable={false}
          />
        ) : (
          <span className="text-5xl relative" style={{ zIndex: 1 }}>{sprite || '👤'}</span>
        )}

        {/* Armor overlay — centered on torso */}
        {armorImg && (
          <img
            src={armorImg}
            alt="Armor"
            className="absolute pointer-events-none object-contain"
            style={{ zIndex: 2, top: '10%', left: '10%', width: '80%', height: '65%' }}
            draggable={false}
          />
        )}

        {/* Weapon overlay — right side */}
        {weaponImg && (
          <img
            src={weaponImg}
            alt="Weapon"
            className="absolute pointer-events-none object-contain"
            style={{ zIndex: 3, bottom: '0%', right: '-20%', width: '50%', height: '75%', transform: 'rotate(-15deg)' }}
            draggable={false}
          />
        )}

        {/* Accessory overlay — top right */}
        {accessoryImg && (
          <img
            src={accessoryImg}
            alt="Accessory"
            className="absolute pointer-events-none object-contain"
            style={{ zIndex: 4, top: '2%', right: '2%', width: '28%', height: '28%' }}
            draggable={false}
          />
        )}
      </div>

      {/* Character name */}
      <span className="font-display text-[10px] text-foreground text-center">{characterName}</span>
      {characterClass && (
        <span className="text-[8px] text-muted-foreground font-display uppercase tracking-wider">
          {characterClass === 'warrior' ? 'Guerrero' : characterClass === 'mage' ? 'Mago' : characterClass === 'assassin' ? 'Asesino' : 'Monje'}
        </span>
      )}
    </div>
  );
}
