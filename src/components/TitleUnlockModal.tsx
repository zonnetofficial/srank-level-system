import { useState } from 'react';

export interface TitleNotification {
  id: string;
  type: 'class' | 'skill';
  name: string;
  icon: string;
  statLabel?: string; // for skill titles
}

interface TitleUnlockModalProps {
  notification: TitleNotification;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function TitleUnlockModal({ notification, onAccept, onReject }: TitleUnlockModalProps) {
  const isClass = notification.type === 'class';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="rpg-panel-glow max-w-sm w-full mx-4 text-center space-y-4 p-6">
        {/* Header */}
        <div className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground">
          {isClass ? '⚔️ Cambio de Clase' : `✨ Nuevo Título — ${notification.statLabel}`}
        </div>

        {/* Icon */}
        <div className="text-6xl animate-pulse">{notification.icon}</div>

        {/* Title name */}
        <div className="font-display text-2xl font-black text-accent text-glow-accent">
          {notification.name}
        </div>

        <p className="text-sm text-muted-foreground font-body">
          {isClass
            ? 'Has alcanzado el nivel necesario para cambiar de clase. ¿Deseas aceptar este nuevo rango?'
            : 'Has acumulado suficientes puntos para reclamar este título. ¿Deseas aceptarlo?'}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onReject(notification.id)}
            className="flex-1 py-3 rounded-lg border border-border text-sm font-display uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={() => onAccept(notification.id)}
            className="flex-1 py-3 rounded-lg bg-accent text-accent-foreground text-sm font-display uppercase tracking-wider font-bold hover:bg-accent/80 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
