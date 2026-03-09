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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-[90%] max-w-sm rpg-panel-glow p-5 space-y-6 animate-scale-up" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className="hud-label">Perfil de Cazador</div>
        </div>

        <div className="flex flex-col items-center gap-3 py-8">
          <span className="text-4xl">🚧</span>
          <h2 className="font-display text-xl text-primary tracking-wider uppercase">Coming Soon</h2>
          <p className="text-xs text-muted-foreground text-center">
            Los perfiles públicos estarán disponibles próximamente.
          </p>
        </div>

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
