import { useState } from 'react';
import { Volume2, VolumeX, Music, Zap, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface Props {
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  onMasterChange: (v: number) => void;
  onMusicChange: (v: number) => void;
  onSfxChange: (v: number) => void;
  onToggleMute: () => void;
}

export default function AudioSettings({ settings, onMasterChange, onMusicChange, onSfxChange, onToggleMute }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-3 right-3 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card/90 backdrop-blur-sm hover:border-primary/40 transition-all"
        title="Audio"
      >
        {settings.muted ? (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Volume2 className="w-4 h-4 text-primary" />
        )}
      </button>

      {open && (
        <div className="absolute top-11 right-0 w-56 p-4 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-xl space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-display uppercase tracking-[0.2em] text-primary">Audio</span>
            <button
              onClick={onToggleMute}
              className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded border transition-all ${
                settings.muted
                  ? 'border-destructive/40 text-destructive bg-destructive/10'
                  : 'border-accent/40 text-accent bg-accent/10'
              }`}
            >
              {settings.muted ? 'Silenciado' : 'Activo'}
            </button>
          </div>

          {/* Master */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Settings className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">General</span>
              <span className="ml-auto text-[10px] text-primary">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <Slider
              value={[settings.masterVolume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => onMasterChange(v)}
              className="h-1.5"
            />
          </div>

          {/* Music */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Music className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Música</span>
              <span className="ml-auto text-[10px] text-primary">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <Slider
              value={[settings.musicVolume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => onMusicChange(v)}
              className="h-1.5"
            />
          </div>

          {/* SFX */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Efectos</span>
              <span className="ml-auto text-[10px] text-primary">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <Slider
              value={[settings.sfxVolume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => onSfxChange(v)}
              className="h-1.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
