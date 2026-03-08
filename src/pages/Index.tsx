import { useState, useEffect } from 'react';
import { XPBar } from '@/components/XPBar';
import VictorianFrame from '@/components/VictorianFrame';
import { StatBar } from '@/components/StatBar';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { useTitleNotifications } from '@/hooks/useTitleNotifications';
import { TitleUnlockModal } from '@/components/TitleUnlockModal';
import SlotNumber from '@/components/SlotNumber';
import {
  STAT_LABELS,
  STAT_ICONS,
  StatKey,
  getClassTitle,
  getNextClassTitle,
} from '@/lib/gameData';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Index = () => {
  const { state, todayQuest, restDay, timeWarning, dismissTimeWarning } = useGameState();
  const { signOut } = useAuth();
  const { currentNotification, acceptTitle, rejectTitle } = useTitleNotifications(state);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentClass = getClassTitle(state.level, state.classTitles);
  const nextClass = getNextClassTitle(state.level, state.classTitles);

  return (
    <VictorianFrame>
      {/* Header bar */}
      <div className="flex justify-between items-center mb-3 animate-slide-down">
        <div className="flex items-center gap-2">
          <div className="hud-status-dot bg-stat-agi" />
          <span className="hud-label animate-text-glitch-alt" style={{ animationDelay: '7s' }}>Online</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-destructive transition-colors font-display uppercase tracking-[0.2em]"
        >
          <LogOut size={12} />
          Salir
        </button>
      </div>

      {/* Time warning */}
      {timeWarning && (
        <div
          className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-body cursor-pointer animate-glitch-in"
          onClick={dismissTimeWarning}
          style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          ⚠️ SYSTEM ALERT: Time anomaly detected
        </div>
      )}

      {/* Time display */}
      <div className="text-center mb-4 animate-slide-up delay-100">
        <div className="hud-label animate-text-glitch-alt" style={{ animationDelay: '12s' }}>
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="hud-data text-xl text-primary text-glow-primary mt-0.5 animate-text-glitch" style={{ animationDelay: '5s' }}>
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Level & XP */}
      <div className="animate-scale-up delay-200">
        <XPBar xp={state.xp} xpToNext={state.xpToNext} level={state.level} />
      </div>

      {/* Class */}
      <div className="mt-4 text-center animate-slide-up delay-300">
        <div className="hud-label">Clase</div>
        <div className="text-xl font-display font-bold text-accent text-glow-accent mt-1 animate-text-glitch-heavy" style={{ animationDelay: '3s' }}>
          {currentClass.icon} {currentClass.name}
        </div>
        {nextClass && (
          <div className="mt-2">
            <div className="hud-label animate-text-glitch-alt" style={{ animationDelay: '9s' }}>
              Siguiente: {nextClass.name} (Nv. {nextClass.requiredLevel})
            </div>
            <div className="stat-bar-track h-1.5 mt-1 max-w-48 mx-auto">
              <div
                className="stat-bar-fill bg-accent/60 animate-bar-fill"
                style={{
                  width: `${Math.min((state.level / nextClass.requiredLevel) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="hud-divider animate-hud-boot delay-400" />

      {/* Stats */}
      <div className="rpg-panel space-y-3 animate-slide-up delay-400">
        <div className="flex items-center justify-between mb-2">
          <h2 className="hud-label animate-text-glitch" style={{ animationDelay: '15s' }}>
            Estadísticas
          </h2>
          <span className="hud-data text-[10px] text-muted-foreground">
            Nv.<SlotNumber value={String(state.level).padStart(2, '0')} delay={600} />
          </span>
        </div>
        {statKeys.map((key, i) => (
          <div key={key} className="animate-slide-up" style={{ animationDelay: `${500 + i * 80}ms` }}>
            <StatBar
              stat={key}
              value={state.stats[key]}
              points={state.statPoints[key]}
              label={STAT_LABELS[key]}
              icon={STAT_ICONS[key]}
            />
          </div>
        ))}
      </div>

      <div className="hud-divider animate-hud-boot delay-700" />

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { path: '/quest', icon: restDay ? '💤' : '⚔️', label: todayQuest?.status === 'completed' ? '✅ Completada' : restDay ? 'Día de Descanso' : 'Daily Quest', glow: todayQuest?.status !== 'completed', primary: true },
          { path: '/skills', icon: '✨', label: 'Skills' },
          { path: '/titles', icon: '🏷️', label: 'Títulos' },
          { path: '/history', icon: '📜', label: 'Historial' },
        ].map((item, i) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`hud-nav-btn py-5 animate-scale-up ${item.glow ? 'animate-pulse-glow' : ''}`}
            style={{ animationDelay: `${700 + i * 100}ms` }}
          >
            <span className="text-2xl animate-slide-nudge" style={{ animationDelay: `${900 + i * 100}ms` }}>{item.icon}</span>
            <span className={`font-display text-[10px] uppercase tracking-[0.15em] ${item.primary ? 'text-primary' : 'text-foreground'}`}>
              {item.label}
            </span>
          </button>
        ))}
        <button
          onClick={() => navigate('/monarch')}
          className="hud-nav-btn py-4 col-span-2 animate-scale-up delay-800"
          style={{ borderColor: 'hsl(45 100% 60% / 0.3)' }}
        >
          <span className="text-2xl animate-icon-bounce" style={{ animationDelay: '1100ms' }}>👑</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-accent animate-text-glitch-heavy" style={{ animationDelay: '8s' }}>
            Ruta del Monarca
          </span>
        </button>
      </div>

      {/* Streak counters */}
      <div className="mt-4 rpg-panel animate-slide-up" style={{ animationDelay: '900ms' }}>
        <div className="flex justify-around text-center">
          <div>
            <div className="hud-data text-2xl font-bold text-primary text-glow-primary">
              <SlotNumber value={String(state.currentStreak).padStart(2, '0')} delay={1000} />
            </div>
            <div className="hud-label mt-0.5">Racha</div>
          </div>
          <div className="w-px bg-border/30 self-stretch" />
          <div>
            <div className="hud-data text-2xl font-bold text-accent text-glow-accent">
              <SlotNumber value={String(state.totalCompleted).padStart(3, '0')} delay={1100} />
            </div>
            <div className="hud-label mt-0.5">Completadas</div>
          </div>
          <div className="w-px bg-border/30 self-stretch" />
          <div>
            <div className="hud-data text-2xl font-bold text-foreground">
              <SlotNumber value={String(state.personalRecords.longestStreak).padStart(2, '0')} delay={1200} />
            </div>
            <div className="hud-label mt-0.5">Mejor Racha</div>
          </div>
        </div>
      </div>

      {/* Title unlock modal */}
      {currentNotification && (
        <TitleUnlockModal
          notification={currentNotification}
          onAccept={acceptTitle}
          onReject={rejectTitle}
        />
      )}

    </VictorianFrame>
  );
};

export default Index;
