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
import { getActiveMission } from '@/lib/mandatoryMissions';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { sfxClick, sfxHover, sfxSuccess } from '@/lib/audioEngine';

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Index = () => {
  const { state, todayQuest, restDay, timeWarning, dismissTimeWarning, assignBankPoints } = useGameState();
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
  const activeMission = state.missionSchedule ? getActiveMission(state.missionSchedule) : null;

  return (
    <VictorianFrame>
      {/* Header bar */}
      <div className="flex justify-between items-center mb-3 animate-slide-down">
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
          className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-body cursor-pointer animate-glitch-in"
          onClick={dismissTimeWarning}
          style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          ⚠️ SYSTEM ALERT: Time anomaly detected
        </div>
      )}

      {/* Mandatory mission alert */}
      {activeMission && (
        <button
          onClick={() => navigate('/mission')}
          className="mb-4 w-full p-3 bg-destructive/10 border border-destructive/40 text-left animate-pulse-glow"
          style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeMission.icon}</span>
            <div className="flex-1">
              <div className="text-[10px] font-display uppercase tracking-wider text-destructive font-bold">
                ⚠️ Misión Obligatoria
              </div>
              <div className="text-xs text-foreground font-display">{activeMission.title}</div>
            </div>
            <span className="text-[10px] font-display text-destructive">→</span>
          </div>
        </button>
      )}

      {/* Time display */}
      <div className="text-center mb-4 animate-slide-up delay-100">
        <div className="hud-label">
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="hud-data text-xl text-primary text-glow-primary mt-0.5 animate-text-flicker">
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
        <div className="text-xl font-display font-bold text-accent text-glow-accent mt-1 animate-text-color-slide">
          {currentClass.icon} {currentClass.name}
        </div>
        {nextClass && (
          <div className="mt-2">
            <div className="hud-label">
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
          <h2 className="hud-label animate-text-slide-return">
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

      {/* Stat Bank */}
      {(() => {
        const bank = state.statBank;
        const totalBank = bank.int + bank.str + bank.agi + bank.vit + bank.end;
        if (totalBank === 0) return null;
        return (
          <div className="rpg-panel mt-3 animate-slide-up" style={{ animationDelay: '850ms' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="hud-label animate-text-slide-return">Puntos Pendientes</h2>
              <span className="hud-data text-xs text-accent text-glow-accent">
                <SlotNumber value={totalBank} delay={800} />
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {statKeys.map(key => bank[key] > 0 ? (
                <span key={key} className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                  {STAT_ICONS[key]} +{bank[key]}
                </span>
              ) : null)}
            </div>
            <button
              onClick={() => { assignBankPoints(); sfxSuccess(); }}
              onMouseEnter={() => sfxHover()}
              className="w-full py-2 text-[10px] font-display uppercase tracking-[0.2em] text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-200"
              style={{ clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))' }}
            >
              Asignar Puntos
            </button>
          </div>
        );
      })()}

      <div className="hud-divider animate-hud-boot delay-700" />

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { path: '/quest', icon: restDay ? '💤' : '⚔️', label: todayQuest?.status === 'completed' ? '✅ Completada' : restDay ? 'Día de Descanso' : 'Daily Quest', glow: todayQuest?.status !== 'completed', primary: true },
          { path: '/skills', icon: '✨', label: 'Skills' },
          { path: '/shop', icon: '🏪', label: 'Tienda' },
          { path: '/titles', icon: '🏷️', label: 'Títulos' },
          { path: '/dungeons', icon: '🏰', label: 'Mazmorras' },
          { path: '/history', icon: '📜', label: 'Historial' },
        ].map((item, i) => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); sfxClick(); }}
            onMouseEnter={() => sfxHover()}
            className={`hud-nav-btn py-5 animate-scale-up ${item.glow ? 'animate-pulse-glow' : ''}`}
            style={{ animationDelay: `${700 + i * 100}ms` }}
          >
            <span className="text-2xl">{item.icon}</span>
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
          <span className="text-2xl">👑</span>
          <span className="font-display text-[10px] uppercase tracking-[0.15em] text-accent">
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
