import { useState } from 'react';
import { CharacterClass, CLASS_INFO, CHARACTER_SPRITES } from '@/lib/dungeonData';
import { CHARACTER_BASE_SPRITES } from '@/lib/characterAssets';

interface Props {
  onCreate: (name: string, charClass: CharacterClass, sprite: string) => void;
}

const classes: CharacterClass[] = ['warrior', 'mage', 'assassin', 'monk'];

export default function CharacterCreation({ onCreate }: Props) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [selectedSprite, setSelectedSprite] = useState(CHARACTER_SPRITES.warrior[0]);

  const handleClassChange = (cls: CharacterClass) => {
    setSelectedClass(cls);
    setSelectedSprite(CHARACTER_SPRITES[cls][0]);
  };

  const canCreate = name.trim().length >= 2;
  const baseImg = CHARACTER_BASE_SPRITES[selectedClass];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h2 className="font-display text-lg uppercase tracking-wider text-primary text-glow-primary">
          Crear Personaje
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Tu avatar para las mazmorras</p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="hud-label">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={16}
          placeholder="Nombre del personaje"
          className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 font-display text-foreground outline-none focus:border-primary/60 transition-colors"
        />
      </div>

      {/* Class selection with character preview */}
      <div className="space-y-2">
        <label className="hud-label">Clase</label>
        <div className="grid grid-cols-2 gap-2">
          {classes.map(cls => {
            const info = CLASS_INFO[cls];
            const isSelected = selectedClass === cls;
            const classImg = CHARACTER_BASE_SPRITES[cls];
            return (
              <button
                key={cls}
                onClick={() => handleClassChange(cls)}
                className={`p-3 border rounded-lg text-center transition-all ${
                  isSelected
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border hover:border-primary/30 bg-secondary/30'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <img src={classImg} alt={info.label} className="w-16 h-20 object-contain" draggable={false} />
                </div>
                <div className="font-display text-xs uppercase tracking-wider text-foreground">
                  {info.icon} {info.label}
                </div>
                <p className="text-[8px] text-muted-foreground mt-0.5">{info.description}</p>
                <p className="text-[8px] text-accent mt-0.5">{info.bonus}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="rpg-panel text-center py-4">
        <div className="flex justify-center mb-2">
          <img src={baseImg} alt={name || 'Personaje'} className="w-28 h-36 object-contain" draggable={false} />
        </div>
        <div className="font-display text-sm text-foreground">
          {name || '???'}
        </div>
        <div className="text-[10px] text-accent font-display uppercase tracking-wider">
          {CLASS_INFO[selectedClass].label}
        </div>
      </div>

      <button
        onClick={() => canCreate && onCreate(name.trim(), selectedClass, selectedSprite)}
        disabled={!canCreate}
        className="w-full py-3 font-display text-xs uppercase tracking-[0.2em] border transition-all disabled:opacity-30 disabled:cursor-not-allowed border-primary/40 text-primary hover:bg-primary/10"
        style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
      >
        Crear Personaje
      </button>
    </div>
  );
}
