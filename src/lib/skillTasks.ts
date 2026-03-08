// Skill tasks assigned by title tier for STR, AGI, VIT, END
import { StatKey } from './gameData';

export interface SkillTask {
  name: string;
  description: string;
  /** Total duration in seconds for timed tasks. */
  durationSeconds?: number;
  /** Number of timer rounds. Each round = durationSeconds / timerRounds. Defaults to 1. */
  timerRounds?: number;
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
    { name: 'Estiramientos básicos', description: 'Realiza: tocarse los pies 15s, estiramiento de cuádriceps 15s por pierna, estiramiento de hombros 15s por lado, giro de cadera 10 por lado', durationSeconds: 600 },
    { name: 'Saltos en el lugar', description: 'Haz 30 saltos seguidos con rodillas al pecho alternando velocidad: 10 lentos, 10 rápidos, 10 explosivos' },
    { name: 'Equilibrio a un pie', description: 'Mantente en un pie 30 segundos, luego cambia. Ojos cerrados para mayor dificultad', durationSeconds: 60, timerRounds: 2 },
    { name: 'Caminata lateral', description: 'Da 20 pasos laterales por lado en posición de media sentadilla, manteniendo la espalda recta' },
    { name: 'Rodillas altas', description: 'Eleva las rodillas al pecho alternando piernas, 40 repeticiones totales lo más rápido posible' },
  ],
  [
    { name: 'Movilidad dinámica', description: 'Circuito: 10 círculos de brazos, 10 balanceos de pierna por lado, 10 rotaciones de cadera, 10 giros de tobillo por pie', durationSeconds: 900 },
    { name: 'Saltos de cuerda', description: 'Simula o usa cuerda real: 50 saltos sin parar alternando pies juntos y alternados cada 10 saltos' },
    { name: 'Skipping lateral', description: '3 series de 30 segundos de desplazamiento lateral rápido, cambiando dirección en cada serie', durationSeconds: 90 },
    { name: 'Toe touches dinámicos', description: 'De pie, lanza una pierna al frente y toca la punta con la mano opuesta. 15 por pierna alternando' },
    { name: 'Bear crawl', description: 'Desplázate en cuadrupedia (manos y pies) hacia adelante y atrás durante 2 minutos sin detenerte', durationSeconds: 120 },
  ],
  [
    { name: 'Coordinación cruzada', description: 'Toca rodilla derecha con codo izquierdo y viceversa, 20 reps. Luego talón derecho con mano izquierda atrás, 20 reps' },
    { name: 'Circuito de agilidad', description: 'Marca 4 puntos en cuadrado (2m): toca cada punto en orden ida y vuelta, 5 rondas lo más rápido posible' },
    { name: 'Salto en caja progresivo', description: 'Salta sobre un escalón o banco a 3 alturas diferentes (bajo, medio, alto), 5 saltos cada una' },
    { name: 'Shuttle run', description: 'Marca dos líneas a 10m de distancia: corre de ida y vuelta tocando el suelo en cada extremo, 5 sprints' },
    { name: 'Escalera de pies', description: 'Imagina una escalera en el suelo: pies adentro-afuera rápido, lateral, y zig-zag. 3 patrones x 30s cada uno', durationSeconds: 90 },
  ],
  [
    { name: 'Sprints con cambio', description: 'Sprint 5m → giro 180° → sprint 5m → giro → repite 10 veces sin parar' },
    { name: 'Balance dinámico', description: 'Parado en un pie: extiende la pierna libre atrás (Warrior 3) y mantén 20s. Alterna 5 veces por pierna' },
    { name: 'Plyometrics combo', description: 'Secuencia: 5 saltos en largo + 5 saltos laterales + 5 saltos con giro 180°. Repite 3 rondas' },
    { name: 'Carioca drill', description: 'Desplazamiento lateral cruzando piernas por delante y atrás alternadamente. 4 series de 20 metros' },
    { name: 'Reflejos con pelota', description: 'Lanza una pelota contra la pared y atrápala con una mano, alternando. 3 minutos sin parar', durationSeconds: 180 },
  ],
  [
    { name: 'Circuito de reacción', description: 'Numera 4 esquinas (1-4). Alguien dice un número o elige al azar: corre a esa esquina. 20 repeticiones a máxima velocidad' },
    { name: 'Parkour básico', description: 'Secuencia: salto de precisión a un punto marcado → rodar al suelo → levantarse y saltar un obstáculo bajo. 10 repeticiones' },
    { name: 'Sprint-stop-sprint', description: 'Sprint 10m → frena en seco → sprint 10m en dirección opuesta. 10 repeticiones sin perder el equilibrio al frenar' },
    { name: 'Animal flow', description: 'Secuencia de 5 minutos: bear crawl 30s → crab walk 30s → frog jump 30s → scorpion reach 30s, repite 2.5 rondas', durationSeconds: 300 },
    { name: 'Saltos de precisión', description: 'Marca 10 puntos en el suelo a diferentes distancias. Salta a cada uno con ambos pies sin perder el equilibrio' },
  ],
  [
    { name: 'Desafío del Fantasma', description: 'Secuencia a máxima velocidad: 10 burpees + zigzag entre 6 puntos + 10 saltos de precisión + sprint 20m. Repite 3 rondas' },
    { name: 'Prueba del Asesino', description: 'Circuito: esquiva lateral x20 + rodar al suelo y levantarse x10 + sprint con cambio de dirección x10. Sin descanso' },
    { name: 'Protocolo Relámpago', description: 'Marca 20 estaciones con diferentes movimientos de agilidad. Completa cada una en 15 segundos con 5s de transición', durationSeconds: 400 },
    { name: 'Sombra del Viento', description: 'Imagina un oponente: esquiva, contraataca, desplázate lateralmente. 5 minutos de movimiento continuo e impredecible', durationSeconds: 300 },
    { name: 'Maestría del Ninja', description: 'Muévete por tu espacio tocando puntos altos y bajos alternadamente en silencio total. 10 minutos de movimiento fluido', durationSeconds: 600 },
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
