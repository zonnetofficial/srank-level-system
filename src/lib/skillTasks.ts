// Skill tasks assigned by title tier for STR, AGI, VIT, END
import { StatKey } from './gameData';

export interface SkillTask {
  name: string;
  description: string;
  /** Duration in seconds for timed tasks. If undefined, task uses manual confirm only. */
  durationSeconds?: number;
}

// Tier index maps to skill title index (0=Novato, 1=Aprendiz, etc.)
const STR_TASKS: SkillTask[][] = [
  [
    { name: 'Flexiones básicas', description: 'Realiza 15 flexiones seguidas' },
    { name: 'Sentadillas con peso corporal', description: 'Haz 20 sentadillas' },
    { name: 'Plancha frontal', description: 'Mantén la plancha 20 segundos', durationSeconds: 20 },
    { name: 'Zancadas alternas', description: '10 zancadas por pierna' },
    { name: 'Burpees básicos', description: 'Realiza 8 burpees' },
  ],
  [
    { name: 'Flexiones diamante', description: 'Realiza 20 flexiones diamante' },
    { name: 'Sentadillas con salto', description: '15 sentadillas con salto' },
    { name: 'Pike push-ups', description: '12 flexiones en pike' },
    { name: 'Fondos en silla', description: '15 fondos de tríceps' },
    { name: 'Mountain climbers', description: '30 repeticiones en 1 minuto', durationSeconds: 60 },
  ],
  [
    { name: 'Reto de dominadas', description: 'Realiza 10 dominadas' },
    { name: 'Press de fuerza', description: '25 reps en 2 minutos', durationSeconds: 120 },
    { name: 'Flexiones archer', description: '8 por cada lado' },
    { name: 'Pistol squat asistida', description: '5 por pierna con apoyo' },
    { name: 'Circuito push-pull', description: '3 rondas de flexiones y remo invertido' },
  ],
  [
    { name: 'Circuito de fuerza', description: 'Completa el circuito de 5 ejercicios' },
    { name: 'Reto de resistencia muscular', description: 'Mantén posición 3 minutos', durationSeconds: 180 },
    { name: 'Handstand push-ups', description: '5 flexiones en pino contra pared' },
    { name: 'Muscle-up progresión', description: '3 intentos con técnica correcta' },
    { name: 'Superset extremo', description: '4 rondas de 4 ejercicios sin descanso' },
  ],
  [
    { name: 'Reto de repeticiones máximas', description: 'Supera tu marca anterior' },
    { name: 'Prueba de potencia', description: 'Ejercicios explosivos por 5 minutos', durationSeconds: 300 },
    { name: 'Circuito guerrero', description: '5 ejercicios compuestos, 5 rondas' },
    { name: 'Resistencia bajo carga', description: 'Mantén peso corporal en posiciones 4 min', durationSeconds: 240 },
    { name: 'Tabata de fuerza', description: '8 intervalos de 20/10 con ejercicios pesados', durationSeconds: 240 },
  ],
  [
    { name: 'Desafío del Titán', description: 'Circuito extremo de fuerza pura' },
    { name: 'Prueba del Berserker', description: 'Entrenamiento de máxima intensidad' },
    { name: 'Protocolo Espartano', description: '300 repeticiones totales sin parar' },
    { name: 'Forja de Acero', description: 'Isométricos extremos por 10 minutos', durationSeconds: 600 },
    { name: 'Juicio del Coloso', description: 'Circuito de cuerpo completo 30 min', durationSeconds: 1800 },
  ],
];

const AGI_TASKS: SkillTask[][] = [
  [
    { name: 'Estiramientos básicos', description: 'Rutina de flexibilidad 10 min', durationSeconds: 600 },
    { name: 'Saltos en el lugar', description: '30 saltos seguidos' },
    { name: 'Equilibrio a un pie', description: '30 segundos por pie', durationSeconds: 60 },
    { name: 'Caminata lateral', description: '20 pasos laterales por lado' },
    { name: 'Rodillas altas', description: '40 rodillas altas sin parar' },
  ],
  [
    { name: 'Estiramientos dinámicos', description: 'Rutina de movilidad 15 min', durationSeconds: 900 },
    { name: 'Saltos de cuerda', description: '50 saltos sin parar' },
    { name: 'Skipping lateral', description: '3 series de 30 segundos', durationSeconds: 90 },
    { name: 'Toe touches dinámicos', description: '15 por pierna alternando' },
    { name: 'Bear crawl', description: 'Desplazamiento en cuadrupedia 2 min', durationSeconds: 120 },
  ],
  [
    { name: 'Coordinación avanzada', description: 'Ejercicios de coordinación mano-pie' },
    { name: 'Agilidad con conos', description: 'Circuito de agilidad' },
    { name: 'Salto en caja progresivo', description: '3 alturas diferentes, 5 cada una' },
    { name: 'Shuttle run', description: '5 sprints de ida y vuelta de 10m' },
    { name: 'Ladder drill', description: 'Escalera de agilidad 3 patrones' },
  ],
  [
    { name: 'Rutina de velocidad', description: 'Sprints cortos con cambios de dirección' },
    { name: 'Balance dinámico', description: 'Ejercicios de equilibrio avanzado' },
    { name: 'Plyometrics combo', description: 'Saltos explosivos multidireccionales' },
    { name: 'Carioca drill', description: '4 series de 20 metros' },
    { name: 'Reflejos con pelota', description: 'Lanzar y atrapar contra pared 3 min', durationSeconds: 180 },
  ],
  [
    { name: 'Circuito de reacción', description: 'Ejercicios de tiempo de reacción' },
    { name: 'Parkour básico', description: 'Movimientos de desplazamiento fluido' },
    { name: 'Sprint-stop-sprint', description: 'Aceleración y frenado brusco x10' },
    { name: 'Movimiento animal flow', description: 'Secuencia de 5 minutos sin parar', durationSeconds: 300 },
    { name: 'Saltos de precisión', description: '10 saltos a puntos marcados' },
  ],
  [
    { name: 'Desafío del Fantasma', description: 'Secuencia de movimientos a máxima velocidad' },
    { name: 'Prueba del Asesino', description: 'Agilidad extrema y precisión' },
    { name: 'Protocolo Relámpago', description: 'Circuito de velocidad 20 estaciones' },
    { name: 'Sombra del Viento', description: 'Esquiva y contraataque imaginario 5 min', durationSeconds: 300 },
    { name: 'Maestría del Ninja', description: 'Movimientos silenciosos y precisos 10 min', durationSeconds: 600 },
  ],
];

const VIT_TASKS: SkillTask[][] = [
  [
    { name: 'Meditación guiada', description: 'Medita 5 minutos', durationSeconds: 300 },
    { name: 'Respiración profunda', description: '10 ciclos de respiración' },
    { name: 'Body scan', description: 'Escaneo corporal consciente 5 min', durationSeconds: 300 },
    { name: 'Gratitud diaria', description: 'Escribe 3 cosas por las que estás agradecido' },
    { name: 'Caminata consciente', description: 'Camina 10 min prestando atención plena', durationSeconds: 600 },
  ],
  [
    { name: 'Meditación enfocada', description: 'Medita 10 minutos', durationSeconds: 600 },
    { name: 'Respiración 4-7-8', description: '5 ciclos completos' },
    { name: 'Yoga básico', description: 'Secuencia de 5 posturas, 10 min', durationSeconds: 600 },
    { name: 'Diario de emociones', description: 'Registra y analiza 3 emociones del día' },
    { name: 'Desconexión digital', description: '30 min sin pantallas, actividad relajante', durationSeconds: 1800 },
  ],
  [
    { name: 'Meditación Zen', description: '15 minutos de meditación silenciosa', durationSeconds: 900 },
    { name: 'Journaling', description: 'Reflexión escrita de 10 minutos', durationSeconds: 600 },
    { name: 'Respiración Wim Hof', description: '3 rondas de 30 respiraciones' },
    { name: 'Tai Chi básico', description: 'Secuencia de 8 movimientos' },
    { name: 'Lectura contemplativa', description: 'Lee 15 min y reflexiona sobre lo leído', durationSeconds: 900 },
  ],
  [
    { name: 'Meditación avanzada', description: '20 minutos sin distracciones', durationSeconds: 1200 },
    { name: 'Visualización', description: 'Sesión de visualización positiva' },
    { name: 'Pranayama completo', description: '4 técnicas de respiración, 15 min', durationSeconds: 900 },
    { name: 'Yoga restaurativo', description: 'Secuencia de relajación profunda 20 min', durationSeconds: 1200 },
    { name: 'Autocompasión', description: 'Práctica de bondad hacia ti mismo 15 min', durationSeconds: 900 },
  ],
  [
    { name: 'Práctica contemplativa', description: '25 minutos de práctica profunda', durationSeconds: 1500 },
    { name: 'Mindfulness activo', description: 'Atención plena en actividad diaria' },
    { name: 'Meditación caminando', description: '20 min de meditación en movimiento', durationSeconds: 1200 },
    { name: 'Retiro silencioso', description: '1 hora de silencio total consciente', durationSeconds: 3600 },
    { name: 'Introspección guiada', description: 'Explora un tema interno profundamente' },
  ],
  [
    { name: 'Estado de flujo', description: '30 minutos de meditación profunda', durationSeconds: 1800 },
    { name: 'Trascendencia', description: 'Sesión espiritual completa' },
    { name: 'Ritual del Sabio', description: 'Combinación de meditación, respiración y journaling' },
    { name: 'Despertar Interior', description: 'Práctica meditativa avanzada 40 min', durationSeconds: 2400 },
    { name: 'Conciencia Plena Total', description: 'Día entero en estado de mindfulness' },
  ],
];

const END_TASKS: SkillTask[][] = [
  [
    { name: 'Plancha', description: 'Mantén plancha 30 segundos', durationSeconds: 30 },
    { name: 'Resistencia básica', description: 'Trote ligero 5 minutos', durationSeconds: 300 },
    { name: 'Wall sit', description: 'Sentado contra pared 30 segundos', durationSeconds: 30 },
    { name: 'Jumping jacks', description: '50 jumping jacks seguidos' },
    { name: 'Marcha en el lugar', description: '5 minutos sin parar', durationSeconds: 300 },
  ],
  [
    { name: 'Plancha extendida', description: 'Mantén plancha 1 minuto', durationSeconds: 60 },
    { name: 'Cardio continuo', description: '10 minutos sin parar', durationSeconds: 600 },
    { name: 'Sentadilla isométrica', description: 'Mantén posición baja 45 segundos', durationSeconds: 45 },
    { name: 'Cuerda invisible', description: 'Simula saltar cuerda 5 min', durationSeconds: 300 },
    { name: 'Step-ups', description: '3 minutos subiendo y bajando escalón', durationSeconds: 180 },
  ],
  [
    { name: 'Circuito de resistencia', description: '15 minutos de ejercicio continuo', durationSeconds: 900 },
    { name: 'Plancha lateral', description: '1 minuto cada lado', durationSeconds: 120 },
    { name: 'Burpee endurance', description: '1 burpee por minuto durante 15 min', durationSeconds: 900 },
    { name: 'Trote sostenido', description: '15 minutos a ritmo constante', durationSeconds: 900 },
    { name: 'Circuito AMRAP', description: 'Máximas rondas en 12 minutos', durationSeconds: 720 },
  ],
  [
    { name: 'Resistencia prolongada', description: '20 minutos de esfuerzo constante', durationSeconds: 1200 },
    { name: 'Wall sit extremo', description: '3 minutos contra la pared', durationSeconds: 180 },
    { name: 'EMOM de 15 min', description: 'Cada minuto al minuto, 3 ejercicios', durationSeconds: 900 },
    { name: 'Cardio mixto', description: '20 min alternando alta y baja intensidad', durationSeconds: 1200 },
    { name: 'Plancha dinámica', description: 'Variaciones de plancha por 5 min', durationSeconds: 300 },
  ],
  [
    { name: 'Prueba de voluntad', description: '25 minutos de cardio intenso', durationSeconds: 1500 },
    { name: 'Resistencia extrema', description: 'Circuito de 30 minutos', durationSeconds: 1800 },
    { name: 'Maratón de burpees', description: '100 burpees por tiempo' },
    { name: 'Reto Tabata doble', description: '16 intervalos de 20/10', durationSeconds: 480 },
    { name: 'Ironman casero', description: 'Circuito de 3 estaciones x 25 min', durationSeconds: 1500 },
  ],
  [
    { name: 'Fortaleza absoluta', description: '40 minutos sin descanso', durationSeconds: 2400 },
    { name: 'Prueba del Invencible', description: 'Resistencia al límite' },
    { name: 'Protocolo Inmortal', description: '50 minutos de esfuerzo sostenido', durationSeconds: 3000 },
    { name: 'Muralla de Hierro', description: 'Isométricos encadenados 20 min', durationSeconds: 1200 },
    { name: 'Juicio Final', description: 'Circuito extremo: 1 hora sin rendirse', durationSeconds: 3600 },
  ],
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
