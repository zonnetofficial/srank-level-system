import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { STAT_LABELS, STAT_ICONS, StatKey } from '@/lib/gameData';

const skillTasks: Record<StatKey, string[]> = {
  int: ['Test de conocimiento', 'Resolver problemas lógicos'],
  str: ['Reto de repeticiones máximas', 'Prueba por tiempo'],
  agi: ['Estiramientos', 'Saltos', 'Coordinación'],
  vit: ['Meditación', 'Respiración', 'Reflexión'],
  end: ['Prueba continua por tiempo', 'Resistencia prolongada'],
};

const skillPoints: Record<StatKey, { success: number; fail: number }> = {
  int: { success: 1, fail: 0 },
  str: { success: 4, fail: 1 },
  agi: { success: 1, fail: 0 },
  vit: { success: 1, fail: 0 },
  end: { success: 4, fail: 1 },
};

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Skills = () => {
  const { completeSkillTask, isSkillAvailable } = useGameState();
  const [confirming, setConfirming] = useState<StatKey | null>(null);

  const handleStart = (key: StatKey) => {
    setConfirming(key);
  };

  const handleResult = (key: StatKey, success: boolean) => {
    const pts = success ? skillPoints[key].success : skillPoints[key].fail;
    if (pts > 0) {
      completeSkillTask(key, pts);
    } else {
      // Still consume the cooldown even on fail with 0 points
      completeSkillTask(key, 0);
    }
    setConfirming(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-xl font-bold text-center text-primary text-glow-primary mb-6">
        ✨ Skills
      </h1>
      <p className="text-xs text-center text-muted-foreground mb-6">
        Tareas extra opcionales – No acumulables
      </p>

      <div className="space-y-4">
        {statKeys.map(key => {
          const tasks = skillTasks[key];
          const available = isSkillAvailable(key);
          const isConfirming = confirming === key;
          const glowClass = `glow-${key}`;

          return (
            <div key={key} className={`rpg-panel ${glowClass}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{STAT_ICONS[key]}</span>
                <h3 className={`font-display text-sm uppercase tracking-wider text-stat-${key}`}>
                  {STAT_LABELS[key]}
                </h3>
              </div>

              <div className="space-y-1 mb-3">
                {tasks.map((task, i) => (
                  <div key={i} className="text-sm text-muted-foreground">• {task}</div>
                ))}
              </div>

              {isConfirming ? (
                <div className="space-y-2">
                  <p className="text-xs text-center text-foreground font-display">
                    ¿Completaste la tarea?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResult(key, true)}
                      className="flex-1 py-2 rounded bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider hover:bg-primary/80 transition-colors"
                    >
                      ✅ Sí, completada
                    </button>
                    <button
                      onClick={() => handleResult(key, false)}
                      className="flex-1 py-2 rounded bg-destructive text-destructive-foreground font-display text-xs uppercase tracking-wider hover:bg-destructive/80 transition-colors"
                    >
                      ❌ No pude
                    </button>
                  </div>
                  <button
                    onClick={() => setConfirming(null)}
                    className="w-full py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleStart(key)}
                  disabled={!available}
                  className={`w-full py-2 rounded font-display text-xs uppercase tracking-wider transition-colors ${
                    available
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  }`}
                >
                  {available ? 'Iniciar Tarea' : 'No disponible'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Skills;
