export interface TitleNotification {
  id: string;
  type: 'class' | 'skill';
  name: string;
  icon: string;
  statLabel?: string;
}

interface TitleUnlockModalProps {
  notification: TitleNotification;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function TitleUnlockModal({ notification, onAccept, onReject }: TitleUnlockModalProps) {
  const isClass = notification.type === 'class';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="rpg-panel-glow max-w-sm w-full mx-4 text-center space-y-4 p-6">
        {/* Header */}
        <div className="hud-label">
          {isClass ? '⚔️ Cambio de Clase' : `✨ Nuevo Título — ${notification.statLabel}`}
        </div>

        <div className="hud-divider" />

        {/* Icon */}
        <div className="text-6xl animate-float">{notification.icon}</div>

        {/* Title name */}
        <div className="font-display text-2xl font-black text-accent text-glow-accent">
          {notification.name}
        </div>

        <p className="text-sm text-muted-foreground font-body">
          {isClass
            ? 'Has alcanzado el nivel necesario para cambiar de clase. ¿Deseas aceptar este nuevo rango?'
            : 'Has acumulado suficientes puntos para reclamar este título. ¿Deseas aceptarlo?'}
        </p>

        <div className="hud-divider" />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onReject(notification.id)}
            className="flex-1 py-3 font-display text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors border border-border/40 hover:border-foreground/30"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            Rechazar
          </button>
          <button
            onClick={() => onAccept(notification.id)}
            className="flex-1 py-3 bg-accent text-accent-foreground font-display text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-accent/80 transition-colors"
            style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
