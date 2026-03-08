import { useState } from 'react';
import { CharacterClass, CLASS_INFO, CHARACTER_SPRITES } from '@/lib/dungeonData';

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

      {/* Class selection */}
      <div className="space-y-2">
        <label className="hud-label">Clase</label>
        <div className="grid grid-cols-2 gap-2">
          {classes.map(cls => {
            const info = CLASS_INFO[cls];
            const isSelected = selectedClass === cls;
            return (
              <button
                key={cls}
                onClick={() => handleClassChange(cls)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border hover:border-primary/30 bg-secondary/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{info.icon}</span>
                  <span className="font-display text-xs uppercase tracking-wider text-foreground">
                    {info.label}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground">{info.description}</p>
                <p className="text-[9px] text-accent mt-0.5">{info.bonus}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sprite selection */}
      <div className="space-y-2">
        <label className="hud-label">Avatar</label>
        <div className="flex gap-3 justify-center">
          {CHARACTER_SPRITES[selectedClass].map(sprite => (
            <button
              key={sprite}
              onClick={() => setSelectedSprite(sprite)}
              className={`w-14 h-14 text-2xl flex items-center justify-center rounded-xl border-2 transition-all ${
                selectedSprite === sprite
                  ? 'border-primary bg-primary/10 scale-110'
                  : 'border-border bg-secondary/30 hover:border-primary/30'
              }`}
            >
              {sprite}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="rpg-panel text-center py-4">
        <span className="text-4xl">{selectedSprite}</span>
        <div className="font-display text-sm text-foreground mt-2">
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
