import { useCharacterEquipment, SLOT_LABELS, type EquipmentSlot } from '@/hooks/useCharacterEquipment';
import CharacterAvatar from '@/components/dungeon/CharacterAvatar';
import { CLASS_INFO, DUNGEON_RANKS, type DungeonRank } from '@/lib/dungeonData';

interface Props {
  userId: string;
  displayName: string;
  characterName: string | null;
  characterClass: string | null;
  characterSprite: string | null;
  dungeonsCleared: number;
  highestRank: string;
  totalXpEarned: number;
  deaths: number;
  currentHp?: number;
  maxHp?: number;
  onClose: () => void;
}

export default function PublicProfileModal({
  userId, displayName, characterName, characterClass, characterSprite,
  dungeonsCleared, highestRank, totalXpEarned, deaths, currentHp, maxHp, onClose,
}: Props) {
  const { equipment, loading } = useCharacterEquipment(userId);
  
  const classInfo = characterClass ? CLASS_INFO[characterClass as keyof typeof CLASS_INFO] : null;
  const rankConfig = DUNGEON_RANKS[highestRank as DungeonRank];
  const equippedTitle = equipment.find(e => e.slot === 'title');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-[90%] max-w-sm rpg-panel-glow p-4 space-y-3 animate-scale-up max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center">
          <div className="hud-label">Perfil de Cazador</div>
        </div>

        {/* Character avatar with equipment */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-28 h-32 flex items-center justify-center">
              <span className="text-muted-foreground text-xs animate-pulse">Cargando...</span>
            </div>
          ) : (
            <CharacterAvatar
              sprite={characterSprite || '👤'}
              characterName={characterName || displayName}
              characterClass={characterClass || undefined}
              equipment={equipment}
              size="lg"
              showTitle={!!equippedTitle}
            />
          )}
        </div>

        {/* Name & Class */}
        <div className="text-center space-y-1">
          <div className="font-display text-sm text-foreground">
            {characterName || displayName}
          </div>
          {classInfo && (
            <div className="text-xs text-muted-foreground">
              {classInfo.icon} {classInfo.label}
            </div>
          )}
          {equippedTitle?.title_key && (
            <div className="text-[10px] font-display text-accent">
              「{equippedTitle.title_key}」
            </div>
          )}
        </div>

        {/* HP Bar (if available) */}
        {currentHp !== undefined && maxHp !== undefined && (
          <div className="rpg-panel p-2">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
              <span>❤️ Vida</span>
              <span>{currentHp} / {maxHp}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-destructive to-destructive/70 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, (currentHp / maxHp) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rpg-panel p-2 text-center">
            <div className="text-lg font-display text-accent">{dungeonsCleared}</div>
            <div className="text-[8px] font-display uppercase tracking-wider text-muted-foreground">Mazmorras</div>
          </div>
          <div className="rpg-panel p-2 text-center">
            <div className={`text-lg font-display ${rankConfig?.color || ''}`}>{highestRank}</div>
            <div className="text-[8px] font-display uppercase tracking-wider text-muted-foreground">Rango Máx</div>
          </div>
          <div className="rpg-panel p-2 text-center">
            <div className="text-lg font-display text-primary">{totalXpEarned}</div>
            <div className="text-[8px] font-display uppercase tracking-wider text-muted-foreground">XP Total</div>
          </div>
          <div className="rpg-panel p-2 text-center">
            <div className="text-lg font-display text-destructive">{deaths}</div>
            <div className="text-[8px] font-display uppercase tracking-wider text-muted-foreground">Muertes</div>
          </div>
        </div>

        {/* Equipment display */}
        {!loading && equipment.length > 0 && (
          <div>
            <div className="hud-label mb-2">Equipamiento</div>
            <div className="grid grid-cols-2 gap-2">
              {(['weapon', 'armor', 'accessory', 'aura', 'frame'] as EquipmentSlot[]).map(slot => {
                const eq = equipment.find(e => e.slot === slot);
                const slotInfo = SLOT_LABELS[slot];
                return (
                  <div key={slot} className="rpg-panel p-2 flex items-center gap-2">
                    <span className="text-sm">{slotInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] text-muted-foreground uppercase">{slotInfo.label}</div>
                      {eq?.item_name ? (
                        <div className="text-[10px] font-display text-foreground truncate">{eq.item_name}</div>
                      ) : (
                        <div className="text-[9px] text-muted-foreground/50">Vacío</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2 font-display text-[10px] uppercase tracking-[0.2em] border border-primary/40 text-primary hover:bg-primary/10 transition-all"
          style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
