// Skill tasks assigned by title tier for STR, AGI, VIT, END
import { StatKey } from './gameData';

export interface SkillTask {
  name: string;
  description: string;
}

// Tier index maps to skill title index (0=Novato, 1=Aprendiz, etc.)
const STR_TASKS: SkillTask[][] = [
  [
    { name: 'Flexiones básicas', description: 'Realiza 15 flexiones seguidas' },
    { name: 'Sentadillas con peso corporal', description: 'Haz 20 sentadillas' },
    { name: 'Plancha frontal', description: 'Mantén la plancha 20 segundos' },
    { name: 'Zancadas alternas', description: '10 zancadas por pierna' },
    { name: 'Burpees básicos', description: 'Realiza 8 burpees' },
  ],
  [
    { name: 'Flexiones diamante', description: 'Realiza 20 flexiones diamante' },
    { name: 'Sentadillas con salto', description: '15 sentadillas con salto' },
    { name: 'Pike push-ups', description: '12 flexiones en pike' },
    { name: 'Fondos en silla', description: '15 fondos de tríceps' },
    { name: 'Mountain climbers', description: '30 repeticiones en 1 minuto' },
  ],
  [
    { name: 'Reto de dominadas', description: 'Realiza 10 dominadas' },
    { name: 'Press de fuerza', description: '25 reps en 2 minutos' },
    { name: 'Flexiones archer', description: '8 por cada lado' },
    { name: 'Pistol squat asistida', description: '5 por pierna con apoyo' },
    { name: 'Circuito push-pull', description: '3 rondas de flexiones y remo invertido' },
  ],
  [
    { name: 'Circuito de fuerza', description: 'Completa el circuito de 5 ejercicios' },
    { name: 'Reto de resistencia muscular', description: 'Mantén posición 3 minutos' },
    { name: 'Handstand push-ups', description: '5 flexiones en pino contra pared' },
    { name: 'Muscle-up progresión', description: '3 intentos con técnica correcta' },
    { name: 'Superset extremo', description: '4 rondas de 4 ejercicios sin descanso' },
  ],
  [
    { name: 'Reto de repeticiones máximas', description: 'Supera tu marca anterior' },
    { name: 'Prueba de potencia', description: 'Ejercicios explosivos por 5 minutos' },
    { name: 'Circuito guerrero', description: '5 ejercicios compuestos, 5 rondas' },
    { name: 'Resistencia bajo carga', description: 'Mantén peso corporal en posiciones 4 min' },
    { name: 'Tabata de fuerza', description: '8 intervalos de 20/10 con ejercicios pesados' },
  ],
  [
    { name: 'Desafío del Titán', description: 'Circuito extremo de fuerza pura' },
    { name: 'Prueba del Berserker', description: 'Entrenamiento de máxima intensidad' },
    { name: 'Protocolo Espartano', description: '300 repeticiones totales sin parar' },
    { name: 'Forja de Acero', description: 'Isométricos extremos por 10 minutos' },
    { name: 'Juicio del Coloso', description: 'Circuito de cuerpo completo 30 min' },
  ],
];

const AGI_TASKS: SkillTask[][] = [
  [
    { name: 'Estiramientos básicos', description: 'Rutina de flexibilidad 10 min' },
    { name: 'Saltos en el lugar', description: '30 saltos seguidos' },
    { name: 'Equilibrio a un pie', description: '30 segundos por pie' },
    { name: 'Caminata lateral', description: '20 pasos laterales por lado' },
    { name: 'Rodillas altas', description: '40 rodillas altas sin parar' },
  ],
  [
    { name: 'Estiramientos dinámicos', description: 'Rutina de movilidad 15 min' },
    { name: 'Saltos de cuerda', description: '50 saltos sin parar' },
    { name: 'Skipping lateral', description: '3 series de 30 segundos' },
    { name: 'Toe touches dinámicos', description: '15 por pierna alternando' },
    { name: 'Bear crawl', description: 'Desplazamiento en cuadrupedia 2 min' },
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
    { name: 'Reflejos con pelota', description: 'Lanzar y atrapar contra pared 3 min' },
  ],
  [
    { name: 'Circuito de reacción', description: 'Ejercicios de tiempo de reacción' },
    { name: 'Parkour básico', description: 'Movimientos de desplazamiento fluido' },
    { name: 'Sprint-stop-sprint', description: 'Aceleración y frenado brusco x10' },
    { name: 'Movimiento animal flow', description: 'Secuencia de 5 minutos sin parar' },
    { name: 'Saltos de precisión', description: '10 saltos a puntos marcados' },
  ],
  [
    { name: 'Desafío del Fantasma', description: 'Secuencia de movimientos a máxima velocidad' },
    { name: 'Prueba del Asesino', description: 'Agilidad extrema y precisión' },
    { name: 'Protocolo Relámpago', description: 'Circuito de velocidad 20 estaciones' },
    { name: 'Sombra del Viento', description: 'Esquiva y contraataque imaginario 5 min' },
    { name: 'Maestría del Ninja', description: 'Movimientos silenciosos y precisos 10 min' },
  ],
];

const VIT_TASKS: SkillTask[][] = [
  [
    { name: 'Meditación guiada', description: 'Medita 5 minutos' },
    { name: 'Respiración profunda', description: '10 ciclos de respiración' },
    { name: 'Body scan', description: 'Escaneo corporal consciente 5 min' },
    { name: 'Gratitud diaria', description: 'Escribe 3 cosas por las que estás agradecido' },
    { name: 'Caminata consciente', description: 'Camina 10 min prestando atención plena' },
  ],
  [
    { name: 'Meditación enfocada', description: 'Medita 10 minutos' },
    { name: 'Respiración 4-7-8', description: '5 ciclos completos' },
    { name: 'Yoga básico', description: 'Secuencia de 5 posturas, 10 min' },
    { name: 'Diario de emociones', description: 'Registra y analiza 3 emociones del día' },
    { name: 'Desconexión digital', description: '30 min sin pantallas, actividad relajante' },
  ],
  [
    { name: 'Meditación Zen', description: '15 minutos de meditación silenciosa' },
    { name: 'Journaling', description: 'Reflexión escrita de 10 minutos' },
    { name: 'Respiración Wim Hof', description: '3 rondas de 30 respiraciones' },
    { name: 'Tai Chi básico', description: 'Secuencia de 8 movimientos' },
    { name: 'Lectura contemplativa', description: 'Lee 15 min y reflexiona sobre lo leído' },
  ],
  [
    { name: 'Meditación avanzada', description: '20 minutos sin distracciones' },
    { name: 'Visualización', description: 'Sesión de visualización positiva' },
    { name: 'Pranayama completo', description: '4 técnicas de respiración, 15 min' },
    { name: 'Yoga restaurativo', description: 'Secuencia de relajación profunda 20 min' },
    { name: 'Autocompasión', description: 'Práctica de bondad hacia ti mismo 15 min' },
  ],
  [
    { name: 'Práctica contemplativa', description: '25 minutos de práctica profunda' },
    { name: 'Mindfulness activo', description: 'Atención plena en actividad diaria' },
    { name: 'Meditación caminando', description: '20 min de meditación en movimiento' },
    { name: 'Retiro silencioso', description: '1 hora de silencio total consciente' },
    { name: 'Introspección guiada', description: 'Explora un tema interno profundamente' },
  ],
  [
    { name: 'Estado de flujo', description: '30 minutos de meditación profunda' },
    { name: 'Trascendencia', description: 'Sesión espiritual completa' },
    { name: 'Ritual del Sabio', description: 'Combinación de meditación, respiración y journaling' },
    { name: 'Despertar Interior', description: 'Práctica meditativa avanzada 40 min' },
    { name: 'Conciencia Plena Total', description: 'Día entero en estado de mindfulness' },
  ],
];

const END_TASKS: SkillTask[][] = [
  [
    { name: 'Plancha', description: 'Mantén plancha 30 segundos' },
    { name: 'Resistencia básica', description: 'Trote ligero 5 minutos' },
    { name: 'Wall sit', description: 'Sentado contra pared 30 segundos' },
    { name: 'Jumping jacks', description: '50 jumping jacks seguidos' },
    { name: 'Marcha en el lugar', description: '5 minutos sin parar' },
  ],
  [
    { name: 'Plancha extendida', description: 'Mantén plancha 1 minuto' },
    { name: 'Cardio continuo', description: '10 minutos sin parar' },
    { name: 'Sentadilla isométrica', description: 'Mantén posición baja 45 segundos' },
    { name: 'Cuerda invisible', description: 'Simula saltar cuerda 5 min' },
    { name: 'Step-ups', description: '3 minutos subiendo y bajando escalón' },
  ],
  [
    { name: 'Circuito de resistencia', description: '15 minutos de ejercicio continuo' },
    { name: 'Plancha lateral', description: '1 minuto cada lado' },
    { name: 'Burpee endurance', description: '1 burpee por minuto durante 15 min' },
    { name: 'Trote sostenido', description: '15 minutos a ritmo constante' },
    { name: 'Circuito AMRAP', description: 'Máximas rondas en 12 minutos' },
  ],
  [
    { name: 'Resistencia prolongada', description: '20 minutos de esfuerzo constante' },
    { name: 'Wall sit extremo', description: '3 minutos contra la pared' },
    { name: 'EMOM de 15 min', description: 'Cada minuto al minuto, 3 ejercicios' },
    { name: 'Cardio mixto', description: '20 min alternando alta y baja intensidad' },
    { name: 'Plancha dinámica', description: 'Variaciones de plancha por 5 min' },
  ],
  [
    { name: 'Prueba de voluntad', description: '25 minutos de cardio intenso' },
    { name: 'Resistencia extrema', description: 'Circuito de 30 minutos' },
    { name: 'Maratón de burpees', description: '100 burpees por tiempo' },
    { name: 'Reto Tabata doble', description: '16 intervalos de 20/10' },
    { name: 'Ironman casero', description: 'Circuito de 3 estaciones x 25 min' },
  ],
  [
    { name: 'Fortaleza absoluta', description: '40 minutos sin descanso' },
    { name: 'Prueba del Invencible', description: 'Resistencia al límite' },
    { name: 'Protocolo Inmortal', description: '50 minutos de esfuerzo sostenido' },
    { name: 'Muralla de Hierro', description: 'Isométricos encadenados 20 min' },
    { name: 'Juicio Final', description: 'Circuito extremo: 1 hora sin rendirse' },
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
