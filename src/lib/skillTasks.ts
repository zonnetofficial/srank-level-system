// Skill tasks assigned by title tier for STR, AGI, VIT, END
import { StatKey } from './gameData';

export interface SkillTask {
  name: string;
  description: string;
}

// Tier index maps to skill title index (0=Novato, 1=Aprendiz, etc.)
const STR_TASKS: SkillTask[][] = [
  [{ name: 'Flexiones básicas', description: 'Realiza 15 flexiones seguidas' }, { name: 'Sentadillas con peso corporal', description: 'Haz 20 sentadillas' }],
  [{ name: 'Flexiones diamante', description: 'Realiza 20 flexiones diamante' }, { name: 'Sentadillas con salto', description: '15 sentadillas con salto' }],
  [{ name: 'Reto de dominadas', description: 'Realiza 10 dominadas' }, { name: 'Press de fuerza', description: '25 reps en 2 minutos' }],
  [{ name: 'Circuito de fuerza', description: 'Completa el circuito de 5 ejercicios' }, { name: 'Reto de resistencia muscular', description: 'Mantén posición 3 minutos' }],
  [{ name: 'Reto de repeticiones máximas', description: 'Supera tu marca anterior' }, { name: 'Prueba de potencia', description: 'Ejercicios explosivos por 5 minutos' }],
  [{ name: 'Desafío del Titán', description: 'Circuito extremo de fuerza pura' }, { name: 'Prueba del Berserker', description: 'Entrenamiento de máxima intensidad' }],
];

const AGI_TASKS: SkillTask[][] = [
  [{ name: 'Estiramientos básicos', description: 'Rutina de flexibilidad 10 min' }, { name: 'Saltos en el lugar', description: '30 saltos seguidos' }],
  [{ name: 'Estiramientos dinámicos', description: 'Rutina de movilidad 15 min' }, { name: 'Saltos de cuerda', description: '50 saltos sin parar' }],
  [{ name: 'Coordinación avanzada', description: 'Ejercicios de coordinación mano-pie' }, { name: 'Agilidad con conos', description: 'Circuito de agilidad' }],
  [{ name: 'Rutina de velocidad', description: 'Sprints cortos con cambios de dirección' }, { name: 'Balance dinámico', description: 'Ejercicios de equilibrio avanzado' }],
  [{ name: 'Circuito de reacción', description: 'Ejercicios de tiempo de reacción' }, { name: 'Parkour básico', description: 'Movimientos de desplazamiento fluido' }],
  [{ name: 'Desafío del Fantasma', description: 'Secuencia de movimientos a máxima velocidad' }, { name: 'Prueba del Asesino', description: 'Agilidad extrema y precisión' }],
];

const VIT_TASKS: SkillTask[][] = [
  [{ name: 'Meditación guiada', description: 'Medita 5 minutos' }, { name: 'Respiración profunda', description: '10 ciclos de respiración' }],
  [{ name: 'Meditación enfocada', description: 'Medita 10 minutos' }, { name: 'Respiración 4-7-8', description: '5 ciclos completos' }],
  [{ name: 'Meditación Zen', description: '15 minutos de meditación silenciosa' }, { name: 'Journaling', description: 'Reflexión escrita de 10 minutos' }],
  [{ name: 'Meditación avanzada', description: '20 minutos sin distracciones' }, { name: 'Visualización', description: 'Sesión de visualización positiva' }],
  [{ name: 'Práctica contemplativa', description: '25 minutos de práctica profunda' }, { name: 'Mindfulness activo', description: 'Atención plena en actividad diaria' }],
  [{ name: 'Estado de flujo', description: '30 minutos de meditación profunda' }, { name: 'Trascendencia', description: 'Sesión espiritual completa' }],
];

const END_TASKS: SkillTask[][] = [
  [{ name: 'Plancha', description: 'Mantén plancha 30 segundos' }, { name: 'Resistencia básica', description: 'Trote ligero 5 minutos' }],
  [{ name: 'Plancha extendida', description: 'Mantén plancha 1 minuto' }, { name: 'Cardio continuo', description: '10 minutos sin parar' }],
  [{ name: 'Circuito de resistencia', description: '15 minutos de ejercicio continuo' }, { name: 'Plancha lateral', description: '1 minuto cada lado' }],
  [{ name: 'Resistencia prolongada', description: '20 minutos de esfuerzo constante' }, { name: 'Wall sit', description: '3 minutos contra la pared' }],
  [{ name: 'Prueba de voluntad', description: '25 minutos de cardio intenso' }, { name: 'Resistencia extrema', description: 'Circuito de 30 minutos' }],
  [{ name: 'Fortaleza absoluta', description: '40 minutos sin descanso' }, { name: 'Prueba del Invencible', description: 'Resistencia al límite' }],
];

const TASK_MAP: Record<string, SkillTask[][]> = {
  str: STR_TASKS,
  agi: AGI_TASKS,
  vit: VIT_TASKS,
  end: END_TASKS,
};

export function getTasksForStat(stat: StatKey, titleIndex: number): SkillTask[] {
  if (stat === 'int') return []; // INT uses test system
  const tasks = TASK_MAP[stat];
  if (!tasks) return [];
  const tier = Math.min(titleIndex, tasks.length - 1);
  return tasks[tier];
}

export function getTitleIndex(stat: StatKey, points: number): number {
  const thresholds = [0, 10, 25, 50, 100, 200];
  let idx = 0;
  for (const t of thresholds) {
    if (points >= t) idx++;
  }
  return Math.max(0, idx - 1);
}
