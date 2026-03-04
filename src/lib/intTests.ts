// Intelligence test questions by difficulty tier
// Tiers: 0 = Novato, 1 = Aprendiz, 2 = Estudioso, 3 = Sabio, 4 = Erudito, 5 = Archimago

export interface TestQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  points: number; // points awarded on correct answer
}

export interface TestSet {
  questions: TestQuestion[];
  tier: number;
  perfectBonus: number;
}

const TIER_0_QUESTIONS: TestQuestion[] = [
  { question: '¿Cuánto es 15 × 3?', options: ['35', '45', '55', '40'], correctIndex: 1, points: 1 },
  { question: '¿Cuál es la capital de Francia?', options: ['Madrid', 'París', 'Roma', 'Berlín'], correctIndex: 1, points: 1 },
  { question: '¿Cuántos planetas tiene el sistema solar?', options: ['7', '8', '9', '10'], correctIndex: 1, points: 1 },
  { question: '¿Qué gas respiramos principalmente?', options: ['CO2', 'Nitrógeno', 'Oxígeno', 'Helio'], correctIndex: 2, points: 1 },
  { question: '¿En qué continente está Brasil?', options: ['Europa', 'Asia', 'América', 'África'], correctIndex: 2, points: 1 },
  { question: '¿Cuántos lados tiene un triángulo?', options: ['2', '3', '4', '5'], correctIndex: 1, points: 1 },
  { question: '¿Qué metal es líquido a temperatura ambiente?', options: ['Hierro', 'Mercurio', 'Aluminio', 'Cobre'], correctIndex: 1, points: 1 },
  { question: '¿Cuántas horas tiene un día?', options: ['12', '20', '24', '48'], correctIndex: 2, points: 1 },
];

const TIER_1_QUESTIONS: TestQuestion[] = [
  { question: '¿Cuál es la raíz cuadrada de 144?', options: ['10', '11', '12', '14'], correctIndex: 2, points: 2 },
  { question: '¿Quién escribió "Don Quijote"?', options: ['Shakespeare', 'Cervantes', 'Borges', 'Neruda'], correctIndex: 1, points: 2 },
  { question: '¿Qué elemento tiene símbolo "Au"?', options: ['Plata', 'Aluminio', 'Oro', 'Argón'], correctIndex: 2, points: 2 },
  { question: '¿En qué año llegó el hombre a la Luna?', options: ['1965', '1969', '1972', '1960'], correctIndex: 1, points: 2 },
  { question: '¿Cuál es el océano más grande?', options: ['Atlántico', 'Índico', 'Ártico', 'Pacífico'], correctIndex: 3, points: 2 },
  { question: '¿Cuántos huesos tiene el cuerpo humano adulto?', options: ['186', '206', '216', '256'], correctIndex: 1, points: 2 },
  { question: '¿Qué país tiene forma de bota?', options: ['España', 'Grecia', 'Italia', 'Portugal'], correctIndex: 2, points: 2 },
  { question: '¿Cuál es el planeta más grande del sistema solar?', options: ['Saturno', 'Júpiter', 'Urano', 'Neptuno'], correctIndex: 1, points: 2 },
];

const TIER_2_QUESTIONS: TestQuestion[] = [
  { question: '¿Qué teorema relaciona los lados de un triángulo rectángulo?', options: ['Tales', 'Pitágoras', 'Euclides', 'Fermat'], correctIndex: 1, points: 4 },
  { question: '¿Cuál es la velocidad de la luz en km/s?', options: ['200,000', '300,000', '400,000', '150,000'], correctIndex: 1, points: 4 },
  { question: '¿Qué partícula tiene carga negativa?', options: ['Protón', 'Neutrón', 'Electrón', 'Fotón'], correctIndex: 2, points: 4 },
  { question: '¿En qué año comenzó la Revolución Francesa?', options: ['1776', '1789', '1804', '1815'], correctIndex: 1, points: 4 },
  { question: '¿Qué compuesto químico es H2SO4?', options: ['Agua', 'Ácido clorhídrico', 'Ácido sulfúrico', 'Amoníaco'], correctIndex: 2, points: 4 },
  { question: '¿Quién formuló la teoría de la relatividad?', options: ['Newton', 'Bohr', 'Einstein', 'Hawking'], correctIndex: 2, points: 4 },
  { question: '¿Cuál es el número primo más pequeño?', options: ['0', '1', '2', '3'], correctIndex: 2, points: 4 },
  { question: '¿Qué civilización construyó Machu Picchu?', options: ['Maya', 'Azteca', 'Inca', 'Olmeca'], correctIndex: 2, points: 4 },
];

const TIER_3_QUESTIONS: TestQuestion[] = [
  { question: '¿Qué principio establece que no se puede conocer simultáneamente posición y momento de una partícula?', options: ['Exclusión de Pauli', 'Incertidumbre de Heisenberg', 'Complementariedad de Bohr', 'Superposición'], correctIndex: 1, points: 6 },
  { question: '¿Cuál es la constante de Avogadro aproximada?', options: ['6.02×10²³', '3.14×10⁸', '9.81×10¹', '1.38×10⁻²³'], correctIndex: 0, points: 6 },
  { question: '¿Qué filósofo escribió "Crítica de la razón pura"?', options: ['Hegel', 'Kant', 'Nietzsche', 'Descartes'], correctIndex: 1, points: 6 },
  { question: '¿En qué lenguaje se basa el álgebra booleana?', options: ['Decimal', 'Hexadecimal', 'Binario', 'Octal'], correctIndex: 2, points: 6 },
  { question: '¿Qué enzima descompone el almidón en la saliva?', options: ['Lipasa', 'Proteasa', 'Amilasa', 'Lactasa'], correctIndex: 2, points: 6 },
  { question: '¿Cuál es la integral de 1/x?', options: ['x²', 'ln|x| + C', '1/x² + C', 'e^x + C'], correctIndex: 1, points: 6 },
  { question: '¿Qué guerra terminó con el Tratado de Versalles?', options: ['Guerra Civil', 'Guerra Fría', 'Primera Guerra Mundial', 'Segunda Guerra Mundial'], correctIndex: 2, points: 6 },
  { question: '¿Qué estructura del ADN descubrieron Watson y Crick?', options: ['Triple hélice', 'Doble hélice', 'Cadena simple', 'Anillo'], correctIndex: 1, points: 6 },
];

const TIER_4_QUESTIONS: TestQuestion[] = [
  { question: '¿Qué establece el teorema de incompletitud de Gödel?', options: ['Todo sistema es consistente', 'Existen verdades indemostrables en sistemas formales', 'Las matemáticas son completas', 'La lógica es decidible'], correctIndex: 1, points: 8 },
  { question: '¿Qué partícula propuesta por Higgs da masa a otras partículas?', options: ['Gluón', 'Bosón de Higgs', 'Gravitón', 'Fotón'], correctIndex: 1, points: 8 },
  { question: '¿Cuál es la complejidad temporal del algoritmo quicksort en promedio?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, points: 8 },
  { question: '¿Qué principio termodinámico establece que la entropía siempre aumenta?', options: ['Primer principio', 'Segundo principio', 'Tercer principio', 'Ley cero'], correctIndex: 1, points: 8 },
  { question: '¿Quién demostró el último teorema de Fermat?', options: ['Euler', 'Gauss', 'Andrew Wiles', 'Riemann'], correctIndex: 2, points: 8 },
  { question: '¿Qué es un espacio de Hilbert?', options: ['Espacio métrico finito', 'Espacio vectorial con producto interno completo', 'Variedad diferencial', 'Grupo topológico'], correctIndex: 1, points: 8 },
];

const TIER_5_QUESTIONS: TestQuestion[] = [
  { question: '¿Qué conjetura no resuelta trata sobre la distribución de números primos y la función zeta?', options: ['Goldbach', 'Riemann', 'Collatz', 'Poincaré'], correctIndex: 1, points: 10 },
  { question: '¿Qué establece el teorema de No-Clonación cuántica?', options: ['Se pueden copiar estados cuánticos', 'No se puede copiar un estado cuántico desconocido', 'Los qubits son deterministas', 'La decoherencia es reversible'], correctIndex: 1, points: 10 },
  { question: '¿Qué es la dualidad AdS/CFT en física teórica?', options: ['Relación entre masa y energía', 'Correspondencia entre gravedad y teoría de campos', 'Unificación electromagnética', 'Modelo estándar extendido'], correctIndex: 1, points: 10 },
  { question: '¿Cuál es la clase de complejidad de los problemas verificables en tiempo polinomial?', options: ['P', 'NP', 'PSPACE', 'EXP'], correctIndex: 1, points: 10 },
  { question: '¿Qué transformación preserva la métrica de Minkowski?', options: ['Galileana', 'Lorentz', 'Fourier', 'Laplace'], correctIndex: 1, points: 10 },
  { question: '¿Qué concepto matemático generaliza la derivada a distribuciones?', options: ['Derivada débil', 'Gradiente', 'Divergencia', 'Laplaciano'], correctIndex: 0, points: 10 },
];

const ALL_TIERS = [TIER_0_QUESTIONS, TIER_1_QUESTIONS, TIER_2_QUESTIONS, TIER_3_QUESTIONS, TIER_4_QUESTIONS, TIER_5_QUESTIONS];

export function getTestForTier(tier: number, seed?: number): TestQuestion[] {
  const clampedTier = Math.min(tier, ALL_TIERS.length - 1);
  const pool = ALL_TIERS[clampedTier];
  // Pick 3 random questions from pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function getTierFromPoints(intPoints: number): number {
  if (intPoints >= 200) return 5;
  if (intPoints >= 100) return 4;
  if (intPoints >= 50) return 3;
  if (intPoints >= 25) return 2;
  if (intPoints >= 10) return 1;
  return 0;
}

export function evaluateTest(questions: TestQuestion[], answers: number[]): { score: number; perfect: boolean; totalPoints: number } {
  let correct = 0;
  let totalPoints = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) {
      correct++;
      totalPoints += questions[i].points;
    }
  }
  const perfect = correct === questions.length;
  return { score: correct, perfect, totalPoints };
}
