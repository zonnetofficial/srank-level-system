import { useState, useEffect } from 'react';
import { useCharacterEquipment } from '@/hooks/useCharacterEquipment';
import { supabase } from '@/integrations/supabase/client';
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
  onClose: () => void;
}

export default function PublicProfileModal({
  userId, displayName, characterName, characterClass, characterSprite,
  dungeonsCleared, highestRank, totalXpEarned, deaths, onClose,
}: Props) {
  const { equipment, loading } = useCharacterEquipment(userId);

  const classInfo = characterClass ? CLASS_INFO[characterClass as keyof typeof CLASS_INFO] : null;
  const rankConfig = DUNGEON_RANKS[highestRank as DungeonRank];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-[90%] max-w-sm rpg-panel-glow p-5 space-y-4 animate-scale-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center">
          <div className="hud-label">Perfil de Cazador</div>
        </div>

        {/* Character avatar with equipment */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-36 h-40 flex items-center justify-center">
              <span className="text-muted-foreground text-xs animate-pulse">Cargando...</span>
            </div>
          ) : (
            <CharacterAvatar
              sprite={characterSprite || '👤'}
              characterName={characterName || displayName}
              characterClass={characterClass || undefined}
              equipment={equipment}
              size="lg"
              showTitle
            />
          )}
        </div>

        {/* Class info */}
        {classInfo && (
          <div className="text-center">
            <span className="text-sm font-display text-foreground">
              {classInfo.icon} {classInfo.label}
            </span>
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
            <div className="flex flex-wrap gap-2 justify-center">
              {equipment.map(eq => (
                <div key={eq.slot} className="rpg-panel p-1.5 flex items-center gap-1" title={eq.item_name || eq.title_key || ''}>
                  <span className="text-[8px] text-muted-foreground">{eq.slot === 'title' ? '🏷️' : ''}</span>
                  {eq.item_name ? (
                    <>
                      <span className="text-sm">{eq.item_icon}</span>
                      <span className="text-[8px] font-display text-foreground">{eq.item_name}</span>
                    </>
                  ) : eq.title_key ? (
                    <span className="text-[8px] font-display text-accent">{eq.title_key}</span>
                  ) : null}
                </div>
              ))}
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
