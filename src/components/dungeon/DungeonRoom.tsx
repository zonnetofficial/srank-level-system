import { useState, useCallback } from 'react';
import type { DungeonRoom as DungeonRoomType } from '@/lib/dungeonData';
import { getTimeBonusMultiplier, type CharacterClass } from '@/lib/dungeonData';
import MathGame from '@/components/minigames/MathGame';
import MemoryGame from '@/components/minigames/MemoryGame';
import ReactionGame from '@/components/minigames/ReactionGame';
import PatternGame from '@/components/minigames/PatternGame';
import LogicGame from '@/components/minigames/LogicGame';

interface Props {
  room: DungeonRoomType;
  roomNumber: number;
  totalRooms: number;
  charClass: CharacterClass;
  extraTime?: number;
  damageReduction?: number;
  onComplete: (success: boolean) => void;
}

const ROOM_TYPE_LABELS: Record<DungeonRoomType['type'], { label: string; icon: string }> = {
  math: { label: 'Desafío Matemático', icon: '🔢' },
  memory: { label: 'Prueba de Memoria', icon: '🧩' },
  reaction: { label: 'Prueba de Reflejos', icon: '⚡' },
  pattern: { label: 'Secuencia de Patrones', icon: '🔮' },
  logic: { label: 'Acertijo Lógico', icon: '🧠' },
};

export default function DungeonRoom({ room, roomNumber, totalRooms, charClass, onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleComplete = useCallback((success: boolean) => {
    setResult(success);
    setTimeout(() => onComplete(success), 1500);
  }, [onComplete]);

  const typeInfo = ROOM_TYPE_LABELS[room.type];
  const timeMultiplier = getTimeBonusMultiplier(charClass);

  return (
    <div className="space-y-4">
      {/* Room header */}
      <div className="text-center space-y-1">
        <div className="hud-label">
          Sala {roomNumber}/{totalRooms}
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">{typeInfo.icon}</span>
          <span className="font-display text-xs uppercase tracking-wider text-primary">
            {typeInfo.label}
          </span>
        </div>
      </div>

      {!started ? (
        <div className="rpg-panel-glow py-6 space-y-4 animate-slide-up">
          {/* Narrative */}
          <p className="text-sm text-center text-foreground/80 font-body italic px-4">
            "{room.narrative}"
          </p>

          <div className="flex justify-center gap-4 text-[10px] font-display uppercase tracking-wider">
            <span className="text-destructive">Daño: {room.damage} HP</span>
            <span className="text-accent">XP: +{room.xpReward}</span>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 font-display text-xs uppercase tracking-[0.2em] border border-primary/40 text-primary hover:bg-primary/10 transition-all"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            Enfrentar Desafío
          </button>
        </div>
      ) : result !== null ? (
        <div className={`text-center py-8 font-display uppercase tracking-wider text-lg ${
          result ? 'text-accent' : 'text-destructive'
        } animate-scale-up`}>
          {result ? '✓ Sala Superada' : `✗ -${room.damage} HP`}
        </div>
      ) : (
        <div className="animate-slide-up">
          {room.type === 'math' && <MathGame difficulty={room.difficulty} onComplete={handleComplete} />}
          {room.type === 'memory' && <MemoryGame difficulty={room.difficulty} onComplete={handleComplete} />}
          {room.type === 'reaction' && <ReactionGame difficulty={room.difficulty} onComplete={handleComplete} />}
          {room.type === 'pattern' && <PatternGame difficulty={room.difficulty} onComplete={handleComplete} timeMultiplier={timeMultiplier} />}
          {room.type === 'logic' && <LogicGame difficulty={room.difficulty} onComplete={handleComplete} timeMultiplier={timeMultiplier} />}
        </div>
      )}
    </div>
  );
}
