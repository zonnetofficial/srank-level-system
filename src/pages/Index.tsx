import { useState, useEffect } from 'react';
import { XPBar } from '@/components/XPBar';
import VictorianFrame from '@/components/VictorianFrame';
import { StatBar } from '@/components/StatBar';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { useTitleNotifications } from '@/hooks/useTitleNotifications';
import { TitleUnlockModal } from '@/components/TitleUnlockModal';
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
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="hud-status-dot bg-stat-agi" />
          <span className="hud-label">Online</span>
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
          className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-body cursor-pointer"
          onClick={dismissTimeWarning}
          style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          ⚠️ SYSTEM ALERT: Time anomaly detected
        </div>
      )}

      {/* Time display */}
      <div className="text-center mb-4">
        <div className="hud-label">
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="hud-data text-xl text-primary text-glow-primary mt-0.5">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Level & XP */}
      <XPBar xp={state.xp} xpToNext={state.xpToNext} level={state.level} />

      {/* Class */}
      <div className="mt-4 text-center">
        <div className="hud-label">Clase</div>
        <div className="text-xl font-display font-bold text-accent text-glow-accent mt-1">
          {currentClass.icon} {currentClass.name}
        </div>
        {nextClass && (
          <div className="mt-2">
            <div className="hud-label">
              Siguiente: {nextClass.name} (Nv. {nextClass.requiredLevel})
            </div>
            <div className="stat-bar-track h-1.5 mt-1 max-w-48 mx-auto">
              <div
                className="stat-bar-fill bg-accent/60"
                style={{
                  width: `${Math.min((state.level / nextClass.requiredLevel) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="hud-divider" />

      {/* Stats */}
      <div className="rpg-panel space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="hud-label">
            Estadísticas
          </h2>
          <span className="hud-data text-[10px] text-muted-foreground">
            Nv.{String(state.level).padStart(2, '0')}
          </span>
        </div>
        {statKeys.map(key => (
          <StatBar
            key={key}
            stat={key}
            value={state.stats[key]}
            points={state.statPoints[key]}
            label={STAT_LABELS[key]}
            icon={STAT_ICONS[key]}
          />
        ))}
      </div>

      <div className="hud-divider" />

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => navigate('/quest')}
          className={`hud-nav-btn py-5 ${todayQuest?.status === 'completed' ? '' : 'animate-pulse-glow'}`}
        >
          <span className="text-2xl">{restDay ? '💤' : '⚔️'}</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-primary">
            {todayQuest?.status === 'completed'
              ? '✅ Completada'
              : restDay
              ? 'Día de Descanso'
              : 'Daily Quest'}
          </span>
        </button>
        <button
          onClick={() => navigate('/skills')}
          className="hud-nav-btn py-5"
        >
          <span className="text-2xl">✨</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-foreground">
            Skills
          </span>
        </button>
        <button
          onClick={() => navigate('/titles')}
          className="hud-nav-btn py-5"
        >
          <span className="text-2xl">🏷️</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-foreground">
            Títulos
          </span>
        </button>
        <button
          onClick={() => navigate('/history')}
          className="hud-nav-btn py-5"
        >
          <span className="text-2xl">📜</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-foreground">
            Historial
          </span>
        </button>
        <button
          onClick={() => navigate('/monarch')}
          className="hud-nav-btn py-4 col-span-2"
          style={{ borderColor: 'hsl(45 100% 60% / 0.3)' }}
        >
          <span className="text-2xl">👑</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-accent">
            Ruta del Monarca
          </span>
        </button>
      </div>

      {/* Streak counters */}
      <div className="mt-4 rpg-panel">
        <div className="flex justify-around text-center">
          <div>
            <div className="hud-data text-2xl font-bold text-primary text-glow-primary">{String(state.currentStreak).padStart(2, '0')}</div>
            <div className="hud-label mt-0.5">Racha</div>
          </div>
          <div className="w-px bg-border/30 self-stretch" />
          <div>
            <div className="hud-data text-2xl font-bold text-accent text-glow-accent">{String(state.totalCompleted).padStart(3, '0')}</div>
            <div className="hud-label mt-0.5">Completadas</div>
          </div>
          <div className="w-px bg-border/30 self-stretch" />
          <div>
            <div className="hud-data text-2xl font-bold text-foreground">{String(state.personalRecords.longestStreak).padStart(2, '0')}</div>
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
