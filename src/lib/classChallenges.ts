// Class change challenges - 5 tasks per class (one per stat)
import { StatKey } from './gameData';

export interface ClassChallengeTask {
  stat: StatKey;
  name: string;
  description: string;
  durationSeconds?: number;
}

export interface ClassChallenge {
  className: string;
  intro: string;
  tasks: ClassChallengeTask[];
}

const CLASS_CHALLENGES: Record<string, ClassChallenge> = {
  Guerrero: {
    className: 'Guerrero',
    intro: 'Para ascender a Guerrero debes demostrar que posees la fuerza, resistencia y determinación de un verdadero combatiente. Completa los 5 desafíos para obtener tu nuevo título.',
    tasks: [
      { stat: 'str', name: 'Prueba de Combate', description: 'Realiza 30 flexiones seguidas sin descanso', },
      { stat: 'end', name: 'Resistencia del Soldado', description: 'Mantén plancha durante 1 minuto', durationSeconds: 60 },
      { stat: 'agi', name: 'Reflejos de Batalla', description: 'Realiza 40 saltos alternados lo más rápido posible' },
      { stat: 'vit', name: 'Voluntad de Hierro', description: 'Medita enfocado en tu objetivo por 5 minutos', durationSeconds: 300 },
      { stat: 'int', name: 'Estrategia Militar', description: 'Estudia y memoriza 5 tácticas de combate clásicas' },
    ],
  },
  Explorador: {
    className: 'Explorador',
    intro: 'Un Explorador conoce su cuerpo, su mente y el mundo. Demuestra que eres digno de este título completando los 5 desafíos de exploración.',
    tasks: [
      { stat: 'agi', name: 'Travesía Ágil', description: 'Realiza un circuito de agilidad: 20 saltos laterales + 20 rodillas altas + 10 burpees' },
      { stat: 'end', name: 'Marcha Forzada', description: 'Trota sin parar durante 10 minutos', durationSeconds: 600 },
      { stat: 'str', name: 'Escalada del Explorador', description: 'Realiza 15 dominadas o flexiones archer (8 por lado)' },
      { stat: 'int', name: 'Cartografía Mental', description: 'Dibuja de memoria el mapa de tu zona con al menos 10 puntos de referencia' },
      { stat: 'vit', name: 'Conexión con la Naturaleza', description: 'Realiza una caminata consciente de 10 minutos al aire libre', durationSeconds: 600 },
    ],
  },
  Monje: {
    className: 'Monje',
    intro: 'El camino del Monje requiere equilibrio perfecto entre cuerpo y espíritu. Demuestra tu disciplina interior y exterior.',
    tasks: [
      { stat: 'vit', name: 'Meditación Profunda', description: 'Medita en silencio absoluto durante 15 minutos', durationSeconds: 900 },
      { stat: 'str', name: 'Fuerza Interior', description: 'Mantén la posición de sentadilla isométrica por 2 minutos', durationSeconds: 120 },
      { stat: 'agi', name: 'Flujo del Agua', description: 'Realiza una secuencia de Tai Chi o yoga flow por 10 minutos', durationSeconds: 600 },
      { stat: 'end', name: 'Ayuno del Espíritu', description: 'Completa 20 minutos de ejercicio continuo suave', durationSeconds: 1200 },
      { stat: 'int', name: 'Sabiduría Ancestral', description: 'Lee un texto filosófico y escribe una reflexión de al menos 200 palabras' },
    ],
  },
  Asesino: {
    className: 'Asesino',
    intro: 'La senda del Asesino exige velocidad letal, precisión quirúrgica y una mente fría. Solo los más rápidos y astutos sobreviven.',
    tasks: [
      { stat: 'agi', name: 'Velocidad Letal', description: 'Sprint de 30 segundos al máximo, descanso 10s, repetir 8 veces', durationSeconds: 320 },
      { stat: 'str', name: 'Golpe Decisivo', description: 'Realiza 50 flexiones explosivas (palmeadas o con impulso)' },
      { stat: 'int', name: 'Mente del Estratega', description: 'Resuelve 10 problemas de lógica o acertijos en 15 minutos', durationSeconds: 900 },
      { stat: 'end', name: 'Persecución Implacable', description: 'Corre sin parar durante 15 minutos a ritmo alto', durationSeconds: 900 },
      { stat: 'vit', name: 'Control del Aliento', description: 'Realiza la técnica de respiración Wim Hof: 4 rondas completas' },
    ],
  },
  Nigromante: {
    className: 'Nigromante',
    intro: 'El Nigromante domina las fuerzas oscuras a través del conocimiento prohibido y una voluntad inquebrantable. Tu mente y cuerpo serán puestos al límite.',
    tasks: [
      { stat: 'int', name: 'Conocimiento Arcano', description: 'Estudia un tema científico nuevo por 20 minutos y escribe un resumen', durationSeconds: 1200 },
      { stat: 'vit', name: 'Ritual de Oscuridad', description: 'Meditación en oscuridad total por 20 minutos', durationSeconds: 1200 },
      { stat: 'end', name: 'Resistencia Maldita', description: 'Circuito de 25 minutos sin descanso: burpees, plancha, sentadillas', durationSeconds: 1500 },
      { stat: 'str', name: 'Fuerza Necrótica', description: 'Realiza 3 rondas de: 20 flexiones + 20 sentadillas + 10 dominadas' },
      { stat: 'agi', name: 'Sombras Veloces', description: 'Circuito de agilidad con cambios de dirección por 8 minutos', durationSeconds: 480 },
    ],
  },
  Campeón: {
    className: 'Campeón',
    intro: 'Solo los más dedicados alcanzan el título de Campeón. Debes demostrar maestría absoluta en todas las disciplinas.',
    tasks: [
      { stat: 'str', name: 'Fuerza del Campeón', description: 'Completa: 50 flexiones + 50 sentadillas + 20 dominadas sin descanso largo' },
      { stat: 'end', name: 'Resistencia Legendaria', description: 'Ejercicio continuo durante 30 minutos a intensidad moderada-alta', durationSeconds: 1800 },
      { stat: 'agi', name: 'Agilidad Suprema', description: 'Circuito de velocidad y coordinación por 15 minutos', durationSeconds: 900 },
      { stat: 'vit', name: 'Fortaleza Mental', description: 'Meditación profunda de 25 minutos seguida de journaling', durationSeconds: 1500 },
      { stat: 'int', name: 'Intelecto del Líder', description: 'Crea un plan de entrenamiento detallado para 30 días con progresión' },
    ],
  },
  Leyenda: {
    className: 'Leyenda',
    intro: 'Las Leyendas trascienden los límites humanos. Este desafío pondrá a prueba cada fibra de tu ser.',
    tasks: [
      { stat: 'str', name: 'Titán Renacido', description: 'Circuito de fuerza extremo: 100 flexiones, 100 sentadillas, 30 dominadas (dividir en sets)' },
      { stat: 'end', name: 'Maratón del Alma', description: 'Ejercicio sostenido durante 45 minutos', durationSeconds: 2700 },
      { stat: 'agi', name: 'Velocidad Divina', description: 'Tabata completo: 20 rondas de ejercicios de agilidad', durationSeconds: 600 },
      { stat: 'vit', name: 'Trascendencia Espiritual', description: 'Meditación de 30 minutos + reflexión escrita profunda', durationSeconds: 1800 },
      { stat: 'int', name: 'Mente Iluminada', description: 'Estudia y domina un concepto complejo nuevo, escribe un ensayo de 500 palabras' },
    ],
  },
  Dios: {
    className: 'Dios',
    intro: 'El título definitivo. Solo un ser que ha trascendido todos los límites puede aspirar a la divinidad. Prepárate para el desafío final.',
    tasks: [
      { stat: 'str', name: 'Juicio de los Dioses', description: 'Completa 200 repeticiones totales de ejercicios compuestos en menos de 30 min', durationSeconds: 1800 },
      { stat: 'end', name: 'Inmortalidad', description: 'Ejercicio continuo durante 60 minutos sin parar', durationSeconds: 3600 },
      { stat: 'agi', name: 'Omnipresencia', description: 'Circuito de máxima velocidad y agilidad por 20 minutos', durationSeconds: 1200 },
      { stat: 'vit', name: 'Iluminación Total', description: 'Meditación profunda de 45 minutos en silencio absoluto', durationSeconds: 2700 },
      { stat: 'int', name: 'Omnisciencia', description: 'Completa un proyecto de investigación: elige un tema, investiga y redacta un informe completo' },
    ],
  },
};

export function getClassChallenge(className: string): ClassChallenge | null {
  return CLASS_CHALLENGES[className] || null;
}
