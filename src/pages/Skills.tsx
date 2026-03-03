import { useGameState } from '@/hooks/useGameState';
import { STAT_LABELS, STAT_ICONS, StatKey } from '@/lib/gameData';

const skillDescriptions: Record<StatKey, { tasks: string[]; reward: string; cooldown: string }> = {
  int: {
    tasks: ['Test de conocimiento', 'Resolver problemas lógicos'],
    reward: 'Hasta +10 INT',
    cooldown: 'Diario (1 test)',
  },
  str: {
    tasks: ['Reto de repeticiones máximas', 'Prueba por tiempo'],
    reward: 'Éxito: +4 STR / Fallo: +1 STR',
    cooldown: 'Cada 4 días',
  },
  agi: {
    tasks: ['Estiramientos', 'Saltos', 'Coordinación'],
    reward: '+1 AGI',
    cooldown: '3 veces por semana',
  },
  vit: {
    tasks: ['Meditación', 'Respiración', 'Reflexión'],
    reward: '+1 VIT',
    cooldown: '4 veces por semana',
  },
  end: {
    tasks: ['Prueba continua por tiempo', 'Resistencia prolongada'],
    reward: 'Éxito: +4 END / Fallo: +1 END',
    cooldown: 'Cada 4 días',
  },
};

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

const Skills = () => {
  const { state, completeSkillTask } = useGameState();

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
          const info = skillDescriptions[key];
          const glowClass = `glow-${key}` as string;

          return (
            <div key={key} className={`rpg-panel ${glowClass}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{STAT_ICONS[key]}</span>
                <h3 className={`font-display text-sm uppercase tracking-wider text-stat-${key}`}>
                  {STAT_LABELS[key]}
                </h3>
              </div>

              <div className="space-y-1 mb-3">
                {info.tasks.map((task, i) => (
                  <div key={i} className="text-sm text-muted-foreground">• {task}</div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-accent font-display">{info.reward}</span>
                <span className="text-muted-foreground">{info.cooldown}</span>
              </div>

              <button
                onClick={() => completeSkillTask(key, 1)}
                className="w-full py-2 rounded bg-secondary text-secondary-foreground font-display text-xs uppercase tracking-wider hover:bg-secondary/80 transition-colors"
              >
                Completar Tarea
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Skills;
