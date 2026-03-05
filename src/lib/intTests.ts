// Intelligence test questions by difficulty tier with themed grouping
// Tiers: 0 = Novato, 1 = Aprendiz, 2 = Estudioso, 3 = Sabio, 4 = Erudito, 5 = Archimago

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
}

export interface TestTheme {
  id: string;
  name: string;
  intro: string;
  questions: TestQuestion[];
}

// ==================== TIER 0 (Novato) ====================

const TIER_0_THEMES: TestTheme[] = [
  {
    id: 't0-math',
    name: 'Aritmética Básica',
    intro: 'La aritmética es la base de las matemáticas. Se ocupa de las operaciones fundamentales: suma, resta, multiplicación y división. Estos cálculos son esenciales en la vida diaria, desde contar dinero hasta medir ingredientes. El sistema decimal que usamos se basa en potencias de 10, y cada posición en un número representa una potencia diferente.',
    questions: [
      { id: 't0m1', question: '¿Cuánto es 15 × 3?', options: ['35', '45', '55', '40'], correctIndex: 1, points: 1 },
      { id: 't0m2', question: '¿Cuánto es 144 ÷ 12?', options: ['10', '11', '12', '14'], correctIndex: 2, points: 1 },
      { id: 't0m3', question: '¿Cuánto es 25 + 37?', options: ['52', '62', '72', '61'], correctIndex: 1, points: 1 },
      { id: 't0m4', question: '¿Cuánto es 100 - 47?', options: ['53', '63', '43', '57'], correctIndex: 0, points: 1 },
      { id: 't0m5', question: '¿Cuánto es 8 × 7?', options: ['54', '56', '58', '48'], correctIndex: 1, points: 1 },
      { id: 't0m6', question: '¿Cuánto es 200 ÷ 4?', options: ['40', '45', '50', '55'], correctIndex: 2, points: 1 },
      { id: 't0m7', question: '¿Cuánto es 9 × 9?', options: ['72', '81', '89', '79'], correctIndex: 1, points: 1 },
      { id: 't0m8', question: '¿Cuál es el doble de 35?', options: ['60', '65', '70', '75'], correctIndex: 2, points: 1 },
      { id: 't0m9', question: '¿Cuánto es 1000 - 365?', options: ['645', '635', '625', '655'], correctIndex: 1, points: 1 },
      { id: 't0m10', question: '¿Cuánto es 12 × 12?', options: ['124', '134', '144', '154'], correctIndex: 2, points: 1 },
    ],
  },
  {
    id: 't0-geo',
    name: 'Geografía Básica',
    intro: 'La Tierra está dividida en 7 continentes: Asia, África, América del Norte, América del Sur, Europa, Oceanía y la Antártida. Los océanos principales son el Pacífico (el más grande), el Atlántico, el Índico, el Ártico y el Antártico. Cada continente tiene características geográficas únicas, desde las montañas del Himalaya hasta la selva amazónica.',
    questions: [
      { id: 't0g1', question: '¿Cuál es la capital de Francia?', options: ['Madrid', 'París', 'Roma', 'Berlín'], correctIndex: 1, points: 1 },
      { id: 't0g2', question: '¿En qué continente está Brasil?', options: ['Europa', 'Asia', 'América', 'África'], correctIndex: 2, points: 1 },
      { id: 't0g3', question: '¿Cuál es el río más largo del mundo?', options: ['Amazonas', 'Nilo', 'Misisipi', 'Yangtsé'], correctIndex: 1, points: 1 },
      { id: 't0g4', question: '¿Cuál es el continente más grande?', options: ['África', 'América', 'Europa', 'Asia'], correctIndex: 3, points: 1 },
      { id: 't0g5', question: '¿En qué país está la Torre Eiffel?', options: ['Italia', 'Francia', 'España', 'Alemania'], correctIndex: 1, points: 1 },
      { id: 't0g6', question: '¿Cuál es la capital de Japón?', options: ['Pekín', 'Seúl', 'Tokio', 'Bangkok'], correctIndex: 2, points: 1 },
      { id: 't0g7', question: '¿Qué océano está entre América y Europa?', options: ['Pacífico', 'Índico', 'Atlántico', 'Ártico'], correctIndex: 2, points: 1 },
      { id: 't0g8', question: '¿En qué continente está Egipto?', options: ['Asia', 'Europa', 'América', 'África'], correctIndex: 3, points: 1 },
      { id: 't0g9', question: '¿Cuál es el país más grande del mundo?', options: ['China', 'Estados Unidos', 'Canadá', 'Rusia'], correctIndex: 3, points: 1 },
      { id: 't0g10', question: '¿Cuántos océanos hay en la Tierra?', options: ['3', '4', '5', '6'], correctIndex: 2, points: 1 },
    ],
  },
  {
    id: 't0-nature',
    name: 'Naturaleza y Ciencia Básica',
    intro: 'El planeta Tierra alberga millones de especies. Los seres vivos se clasifican en reinos: animal, vegetal, hongos, protistas y bacterias. Nuestro sistema solar tiene 8 planetas que orbitan alrededor del Sol. La atmósfera terrestre está compuesta principalmente de nitrógeno (78%) y oxígeno (21%), lo que permite la vida tal como la conocemos.',
    questions: [
      { id: 't0n1', question: '¿Cuántos planetas tiene el sistema solar?', options: ['7', '8', '9', '10'], correctIndex: 1, points: 1 },
      { id: 't0n2', question: '¿Qué gas respiramos principalmente?', options: ['CO2', 'Nitrógeno', 'Oxígeno', 'Helio'], correctIndex: 2, points: 1 },
      { id: 't0n3', question: '¿Cuántos lados tiene un triángulo?', options: ['2', '3', '4', '5'], correctIndex: 1, points: 1 },
      { id: 't0n4', question: '¿Qué metal es líquido a temperatura ambiente?', options: ['Hierro', 'Mercurio', 'Aluminio', 'Cobre'], correctIndex: 1, points: 1 },
      { id: 't0n5', question: '¿Cuántas horas tiene un día?', options: ['12', '20', '24', '48'], correctIndex: 2, points: 1 },
      { id: 't0n6', question: '¿Cuál es el planeta más cercano al Sol?', options: ['Venus', 'Tierra', 'Mercurio', 'Marte'], correctIndex: 2, points: 1 },
      { id: 't0n7', question: '¿De qué color es la clorofila?', options: ['Rojo', 'Azul', 'Verde', 'Amarillo'], correctIndex: 2, points: 1 },
      { id: 't0n8', question: '¿Cuántos días tiene un año normal?', options: ['360', '364', '365', '366'], correctIndex: 2, points: 1 },
      { id: 't0n9', question: '¿Qué animal es el más grande del mundo?', options: ['Elefante', 'Ballena azul', 'Jirafa', 'Tiburón'], correctIndex: 1, points: 1 },
      { id: 't0n10', question: '¿Cuántos huesos tiene el cuerpo humano adulto?', options: ['186', '206', '216', '256'], correctIndex: 1, points: 1 },
    ],
  },
];

// ==================== TIER 1 (Aprendiz) ====================

const TIER_1_THEMES: TestTheme[] = [
  {
    id: 't1-math',
    name: 'Fracciones y Proporciones',
    intro: 'Las fracciones representan partes de un todo. Una fracción tiene un numerador (arriba) y un denominador (abajo). Las proporciones son igualdades entre dos razones. El porcentaje es una fracción con denominador 100. Estas herramientas son fundamentales para entender descuentos, probabilidades y mediciones en la vida cotidiana.',
    questions: [
      { id: 't1m1', question: '¿Cuánto es 3/4 de 100?', options: ['65', '70', '75', '80'], correctIndex: 2, points: 2 },
      { id: 't1m2', question: '¿Cuál es el 20% de 250?', options: ['40', '45', '50', '55'], correctIndex: 2, points: 2 },
      { id: 't1m3', question: '¿Cuánto es 2/5 + 1/5?', options: ['1/5', '2/5', '3/5', '4/5'], correctIndex: 2, points: 2 },
      { id: 't1m4', question: 'Si 3x = 21, ¿cuánto vale x?', options: ['5', '6', '7', '8'], correctIndex: 2, points: 2 },
      { id: 't1m5', question: '¿Cuál es la raíz cuadrada de 144?', options: ['10', '11', '12', '14'], correctIndex: 2, points: 2 },
      { id: 't1m6', question: '¿Cuánto es 1/3 de 90?', options: ['20', '25', '30', '35'], correctIndex: 2, points: 2 },
      { id: 't1m7', question: '¿Cuánto es 0.5 × 0.5?', options: ['0.1', '0.25', '0.5', '1.0'], correctIndex: 1, points: 2 },
      { id: 't1m8', question: '¿Qué fracción es equivalente a 50%?', options: ['1/3', '1/4', '1/2', '2/3'], correctIndex: 2, points: 2 },
      { id: 't1m9', question: '¿Cuánto es 7² ?', options: ['42', '47', '49', '56'], correctIndex: 2, points: 2 },
      { id: 't1m10', question: 'Si un producto cuesta $80 con 25% de descuento, ¿cuánto pagas?', options: ['$55', '$60', '$65', '$70'], correctIndex: 1, points: 2 },
    ],
  },
  {
    id: 't1-history',
    name: 'Historia Universal',
    intro: 'La historia de la humanidad abarca desde las primeras civilizaciones en Mesopotamia y Egipto hasta la era moderna. Grandes imperios como el Romano, el Mongol y el Español marcaron el curso del mundo. La invención de la imprenta por Gutenberg en 1440 revolucionó la difusión del conocimiento. Eventos como el descubrimiento de América en 1492 y la Revolución Industrial transformaron la sociedad para siempre.',
    questions: [
      { id: 't1h1', question: '¿Quién escribió "Don Quijote"?', options: ['Shakespeare', 'Cervantes', 'Borges', 'Neruda'], correctIndex: 1, points: 2 },
      { id: 't1h2', question: '¿En qué año llegó el hombre a la Luna?', options: ['1965', '1969', '1972', '1960'], correctIndex: 1, points: 2 },
      { id: 't1h3', question: '¿Qué país tiene forma de bota?', options: ['España', 'Grecia', 'Italia', 'Portugal'], correctIndex: 2, points: 2 },
      { id: 't1h4', question: '¿Quién pintó la Mona Lisa?', options: ['Miguel Ángel', 'Da Vinci', 'Rafael', 'Botticelli'], correctIndex: 1, points: 2 },
      { id: 't1h5', question: '¿En qué año comenzó la Segunda Guerra Mundial?', options: ['1935', '1939', '1941', '1945'], correctIndex: 1, points: 2 },
      { id: 't1h6', question: '¿Qué civilización construyó las pirámides de Giza?', options: ['Griega', 'Romana', 'Egipcia', 'Persa'], correctIndex: 2, points: 2 },
      { id: 't1h7', question: '¿Quién descubrió América?', options: ['Magallanes', 'Colón', 'Vespucio', 'Cortés'], correctIndex: 1, points: 2 },
      { id: 't1h8', question: '¿Cuál fue el primer idioma escrito?', options: ['Latín', 'Griego', 'Sumerio', 'Egipcio'], correctIndex: 2, points: 2 },
      { id: 't1h9', question: '¿En qué siglo fue la Revolución Industrial?', options: ['XVI', 'XVII', 'XVIII', 'XIX'], correctIndex: 2, points: 2 },
      { id: 't1h10', question: '¿Qué imperio construyó el Coliseo?', options: ['Griego', 'Romano', 'Persa', 'Bizantino'], correctIndex: 1, points: 2 },
    ],
  },
  {
    id: 't1-science',
    name: 'Ciencia General',
    intro: 'La ciencia busca explicar el mundo natural mediante observación y experimentación. La tabla periódica organiza los 118 elementos conocidos por sus propiedades. El agua (H₂O) es esencial para la vida y cubre el 71% de la superficie terrestre. La gravedad, descrita por Newton, mantiene los planetas en órbita y nos mantiene en el suelo con una aceleración de 9.8 m/s².',
    questions: [
      { id: 't1s1', question: '¿Qué elemento tiene símbolo "Au"?', options: ['Plata', 'Aluminio', 'Oro', 'Argón'], correctIndex: 2, points: 2 },
      { id: 't1s2', question: '¿Cuál es el océano más grande?', options: ['Atlántico', 'Índico', 'Ártico', 'Pacífico'], correctIndex: 3, points: 2 },
      { id: 't1s3', question: '¿Cuál es el planeta más grande del sistema solar?', options: ['Saturno', 'Júpiter', 'Urano', 'Neptuno'], correctIndex: 1, points: 2 },
      { id: 't1s4', question: '¿Qué órgano bombea la sangre?', options: ['Pulmón', 'Hígado', 'Corazón', 'Riñón'], correctIndex: 2, points: 2 },
      { id: 't1s5', question: '¿Cuál es la fórmula del agua?', options: ['CO2', 'H2O', 'NaCl', 'O2'], correctIndex: 1, points: 2 },
      { id: 't1s6', question: '¿Qué vitamina se obtiene del sol?', options: ['A', 'B', 'C', 'D'], correctIndex: 3, points: 2 },
      { id: 't1s7', question: '¿Cuál es el hueso más largo del cuerpo?', options: ['Húmero', 'Tibia', 'Fémur', 'Radio'], correctIndex: 2, points: 2 },
      { id: 't1s8', question: '¿Qué gas producen las plantas en la fotosíntesis?', options: ['CO2', 'Nitrógeno', 'Oxígeno', 'Hidrógeno'], correctIndex: 2, points: 2 },
      { id: 't1s9', question: '¿Cuántos cromosomas tiene el ser humano?', options: ['23', '44', '46', '48'], correctIndex: 2, points: 2 },
      { id: 't1s10', question: '¿Qué tipo de sangre es el donante universal?', options: ['A+', 'B-', 'AB+', 'O-'], correctIndex: 3, points: 2 },
    ],
  },
];

// ==================== TIER 2 (Estudioso) ====================

const TIER_2_THEMES: TestTheme[] = [
  {
    id: 't2-algebra',
    name: 'Álgebra y Ecuaciones',
    intro: 'El álgebra utiliza letras y símbolos para representar números y relaciones. Una ecuación es una igualdad con incógnitas que debemos resolver. El teorema de Pitágoras (a² + b² = c²) relaciona los lados de un triángulo rectángulo. Las ecuaciones cuadráticas (ax² + bx + c = 0) se resuelven con la fórmula general: x = (-b ± √(b²-4ac)) / 2a.',
    questions: [
      { id: 't2a1', question: 'Si 2x + 5 = 17, ¿cuánto vale x?', options: ['4', '5', '6', '7'], correctIndex: 2, points: 4 },
      { id: 't2a2', question: '¿Cuál es el valor de x en x² = 64?', options: ['6', '7', '8', '9'], correctIndex: 2, points: 4 },
      { id: 't2a3', question: '¿Qué teorema relaciona los lados de un triángulo rectángulo?', options: ['Tales', 'Pitágoras', 'Euclides', 'Fermat'], correctIndex: 1, points: 4 },
      { id: 't2a4', question: 'Resuelve: 3(x - 2) = 15', options: ['5', '6', '7', '8'], correctIndex: 2, points: 4 },
      { id: 't2a5', question: '¿Cuál es el número primo más pequeño?', options: ['0', '1', '2', '3'], correctIndex: 2, points: 4 },
      { id: 't2a6', question: 'Si a = 3 y b = 4, ¿cuánto es a² + b²?', options: ['20', '24', '25', '27'], correctIndex: 2, points: 4 },
      { id: 't2a7', question: '¿Cuánto es log₁₀(1000)?', options: ['2', '3', '4', '10'], correctIndex: 1, points: 4 },
      { id: 't2a8', question: 'Si f(x) = 2x + 1, ¿cuánto es f(5)?', options: ['9', '10', '11', '12'], correctIndex: 2, points: 4 },
      { id: 't2a9', question: '¿Cuál es la pendiente de y = 3x + 2?', options: ['1', '2', '3', '5'], correctIndex: 2, points: 4 },
      { id: 't2a10', question: 'Simplifica: (x²)(x³)', options: ['x⁵', 'x⁶', '2x⁵', 'x⁸'], correctIndex: 0, points: 4 },
    ],
  },
  {
    id: 't2-physics',
    name: 'Física Fundamental',
    intro: 'La física estudia las leyes que gobiernan el universo. Isaac Newton formuló las tres leyes del movimiento y la ley de gravitación universal. La velocidad de la luz en el vacío es de aproximadamente 300,000 km/s. La energía no se crea ni se destruye, solo se transforma (primera ley de la termodinámica). El átomo está compuesto por protones, neutrones y electrones.',
    questions: [
      { id: 't2p1', question: '¿Cuál es la velocidad de la luz en km/s?', options: ['200,000', '300,000', '400,000', '150,000'], correctIndex: 1, points: 4 },
      { id: 't2p2', question: '¿Qué partícula tiene carga negativa?', options: ['Protón', 'Neutrón', 'Electrón', 'Fotón'], correctIndex: 2, points: 4 },
      { id: 't2p3', question: '¿Quién formuló la teoría de la relatividad?', options: ['Newton', 'Bohr', 'Einstein', 'Hawking'], correctIndex: 2, points: 4 },
      { id: 't2p4', question: '¿Cuál es la unidad de fuerza en el SI?', options: ['Julio', 'Vatio', 'Newton', 'Pascal'], correctIndex: 2, points: 4 },
      { id: 't2p5', question: '¿Qué ley dice F = ma?', options: ['Primera de Newton', 'Segunda de Newton', 'Tercera de Newton', 'Ley de Hooke'], correctIndex: 1, points: 4 },
      { id: 't2p6', question: '¿Cuál es la aceleración de la gravedad en la Tierra?', options: ['8.9 m/s²', '9.8 m/s²', '10.2 m/s²', '11.0 m/s²'], correctIndex: 1, points: 4 },
      { id: 't2p7', question: '¿Qué tipo de energía tiene un objeto en movimiento?', options: ['Potencial', 'Cinética', 'Térmica', 'Nuclear'], correctIndex: 1, points: 4 },
      { id: 't2p8', question: '¿En qué unidad se mide la corriente eléctrica?', options: ['Voltio', 'Ohmio', 'Amperio', 'Vatio'], correctIndex: 2, points: 4 },
      { id: 't2p9', question: '¿Qué fenómeno explica el arcoíris?', options: ['Reflexión', 'Refracción', 'Difracción', 'Dispersión'], correctIndex: 3, points: 4 },
      { id: 't2p10', question: '¿Cuál es la tercera ley de Newton?', options: ['Ley de inercia', 'F = ma', 'Acción y reacción', 'Ley de gravedad'], correctIndex: 2, points: 4 },
    ],
  },
  {
    id: 't2-history2',
    name: 'Historia y Civilizaciones',
    intro: 'Las grandes civilizaciones dejaron legados que perduran. Los griegos sentaron las bases de la democracia y la filosofía. Roma creó un sistema legal que influye hasta hoy. La Revolución Francesa de 1789 transformó la política mundial con los ideales de libertad, igualdad y fraternidad. Las guerras mundiales del siglo XX remodelaron el mapa geopolítico y dieron origen a organismos como la ONU.',
    questions: [
      { id: 't2h1', question: '¿En qué año comenzó la Revolución Francesa?', options: ['1776', '1789', '1804', '1815'], correctIndex: 1, points: 4 },
      { id: 't2h2', question: '¿Qué civilización construyó Machu Picchu?', options: ['Maya', 'Azteca', 'Inca', 'Olmeca'], correctIndex: 2, points: 4 },
      { id: 't2h3', question: '¿Quién fue el primer emperador de Roma?', options: ['Julio César', 'Augusto', 'Nerón', 'Calígula'], correctIndex: 1, points: 4 },
      { id: 't2h4', question: '¿En qué año cayó el Muro de Berlín?', options: ['1985', '1987', '1989', '1991'], correctIndex: 2, points: 4 },
      { id: 't2h5', question: '¿Qué tratado puso fin a la Primera Guerra Mundial?', options: ['París', 'Versalles', 'Viena', 'Westfalia'], correctIndex: 1, points: 4 },
      { id: 't2h6', question: '¿Cuál fue la capital del Imperio Bizantino?', options: ['Roma', 'Atenas', 'Constantinopla', 'Alejandría'], correctIndex: 2, points: 4 },
      { id: 't2h7', question: '¿Quién lideró la independencia de India?', options: ['Nehru', 'Gandhi', 'Bose', 'Jinnah'], correctIndex: 1, points: 4 },
      { id: 't2h8', question: '¿En qué siglo fue el Renacimiento?', options: ['XIII-XIV', 'XIV-XVI', 'XVI-XVII', 'XVII-XVIII'], correctIndex: 1, points: 4 },
      { id: 't2h9', question: '¿Qué imperio dominó Mesoamérica antes de los españoles?', options: ['Inca', 'Maya', 'Azteca', 'Olmeca'], correctIndex: 2, points: 4 },
      { id: 't2h10', question: '¿Quién fue Alejandro Magno?', options: ['Emperador romano', 'Rey macedonio', 'Faraón egipcio', 'Rey persa'], correctIndex: 1, points: 4 },
    ],
  },
];

// ==================== TIER 3 (Sabio) ====================

const TIER_3_THEMES: TestTheme[] = [
  {
    id: 't3-calculus',
    name: 'Cálculo y Análisis',
    intro: 'El cálculo, desarrollado por Newton y Leibniz, estudia el cambio continuo. La derivada mide la tasa de cambio instantánea de una función; geométricamente, es la pendiente de la recta tangente. La integral es la operación inversa: calcula el área bajo una curva. El Teorema Fundamental del Cálculo conecta ambos conceptos. Las derivadas comunes incluyen: d/dx(xⁿ) = nxⁿ⁻¹, d/dx(eˣ) = eˣ, d/dx(ln x) = 1/x.',
    questions: [
      { id: 't3c1', question: '¿Cuál es la integral de 1/x?', options: ['x²', 'ln|x| + C', '1/x² + C', 'eˣ + C'], correctIndex: 1, points: 6 },
      { id: 't3c2', question: '¿Cuál es la derivada de x³?', options: ['x²', '2x²', '3x²', '3x³'], correctIndex: 2, points: 6 },
      { id: 't3c3', question: '¿Cuál es la derivada de eˣ?', options: ['xeˣ⁻¹', 'eˣ', 'ln(x)', '1/x'], correctIndex: 1, points: 6 },
      { id: 't3c4', question: '¿Qué es un límite cuando x tiende a infinito de 1/x?', options: ['1', '0', '∞', 'No existe'], correctIndex: 1, points: 6 },
      { id: 't3c5', question: '¿Cuál es la integral de 2x?', options: ['x²', 'x² + C', '2x² + C', 'x + C'], correctIndex: 1, points: 6 },
      { id: 't3c6', question: '¿Qué representa la segunda derivada de una función?', options: ['Velocidad', 'Pendiente', 'Concavidad', 'Área'], correctIndex: 2, points: 6 },
      { id: 't3c7', question: '¿Cuál es la derivada de sen(x)?', options: ['-sen(x)', 'cos(x)', '-cos(x)', 'tan(x)'], correctIndex: 1, points: 6 },
      { id: 't3c8', question: 'Si f\'(x) = 0 en un punto, ¿qué puede ser ese punto?', options: ['Siempre máximo', 'Siempre mínimo', 'Punto crítico', 'Inflexión siempre'], correctIndex: 2, points: 6 },
      { id: 't3c9', question: '¿Cuál es la serie de Taylor de eˣ alrededor de 0?', options: ['Σ xⁿ/n!', 'Σ xⁿ/n', 'Σ nxⁿ', 'Σ x/n!'], correctIndex: 0, points: 6 },
      { id: 't3c10', question: '¿Qué regla se usa para derivar f(g(x))?', options: ['Producto', 'Cociente', 'Cadena', 'L\'Hôpital'], correctIndex: 2, points: 6 },
    ],
  },
  {
    id: 't3-philosophy',
    name: 'Filosofía y Pensamiento',
    intro: 'La filosofía busca comprender la realidad, el conocimiento y la ética mediante la razón. Sócrates usaba la mayéutica para llegar a la verdad a través de preguntas. Platón distinguió entre el mundo sensible y el mundo de las Ideas. Aristóteles sistematizó la lógica formal. Kant revolucionó la epistemología con su "Crítica de la razón pura", distinguiendo entre juicios a priori y a posteriori. Descartes planteó "Pienso, luego existo" como base del conocimiento.',
    questions: [
      { id: 't3p1', question: '¿Qué filósofo escribió "Crítica de la razón pura"?', options: ['Hegel', 'Kant', 'Nietzsche', 'Descartes'], correctIndex: 1, points: 6 },
      { id: 't3p2', question: '¿Qué método usaba Sócrates?', options: ['Dialéctica', 'Mayéutica', 'Empirismo', 'Deducción'], correctIndex: 1, points: 6 },
      { id: 't3p3', question: '¿Quién dijo "Pienso, luego existo"?', options: ['Platón', 'Kant', 'Descartes', 'Hume'], correctIndex: 2, points: 6 },
      { id: 't3p4', question: '¿Qué filósofo propuso la "voluntad de poder"?', options: ['Marx', 'Hegel', 'Nietzsche', 'Schopenhauer'], correctIndex: 2, points: 6 },
      { id: 't3p5', question: '¿Qué es la alegoría de la caverna?', options: ['Mito griego', 'Idea de Platón', 'Teoría de Aristóteles', 'Paradoja de Zenón'], correctIndex: 1, points: 6 },
      { id: 't3p6', question: '¿Quién escribió "El contrato social"?', options: ['Locke', 'Hobbes', 'Rousseau', 'Montesquieu'], correctIndex: 2, points: 6 },
      { id: 't3p7', question: '¿Qué corriente afirma que todo conocimiento viene de la experiencia?', options: ['Racionalismo', 'Empirismo', 'Idealismo', 'Positivismo'], correctIndex: 1, points: 6 },
      { id: 't3p8', question: '¿Quién es considerado el padre de la lógica formal?', options: ['Platón', 'Sócrates', 'Aristóteles', 'Tales'], correctIndex: 2, points: 6 },
      { id: 't3p9', question: '¿Qué filósofo escribió "El ser y la nada"?', options: ['Heidegger', 'Sartre', 'Camus', 'Kierkegaard'], correctIndex: 1, points: 6 },
      { id: 't3p10', question: '¿Qué concepto central desarrolló Marx?', options: ['Voluntad de poder', 'Lucha de clases', 'Imperativo categórico', 'Tabula rasa'], correctIndex: 1, points: 6 },
    ],
  },
  {
    id: 't3-biology',
    name: 'Biología Avanzada',
    intro: 'El ADN (ácido desoxirribonucleico) contiene las instrucciones genéticas de todos los seres vivos. Su estructura de doble hélice fue descubierta por Watson y Crick en 1953. Los genes codifican proteínas mediante la transcripción (ADN→ARN) y traducción (ARN→proteína). Las enzimas son catalizadores biológicos que aceleran reacciones químicas. La amilasa en la saliva descompone almidón, la lipasa actúa sobre las grasas.',
    questions: [
      { id: 't3b1', question: '¿Qué estructura del ADN descubrieron Watson y Crick?', options: ['Triple hélice', 'Doble hélice', 'Cadena simple', 'Anillo'], correctIndex: 1, points: 6 },
      { id: 't3b2', question: '¿Qué enzima descompone el almidón en la saliva?', options: ['Lipasa', 'Proteasa', 'Amilasa', 'Lactasa'], correctIndex: 2, points: 6 },
      { id: 't3b3', question: '¿Qué orgánulo es la central energética de la célula?', options: ['Núcleo', 'Ribosoma', 'Mitocondria', 'Lisosoma'], correctIndex: 2, points: 6 },
      { id: 't3b4', question: '¿Qué proceso convierte glucosa en energía sin oxígeno?', options: ['Fotosíntesis', 'Respiración aeróbica', 'Fermentación', 'Oxidación'], correctIndex: 2, points: 6 },
      { id: 't3b5', question: '¿Cuántos pares de bases tiene el genoma humano aprox.?', options: ['3 millones', '30 millones', '300 millones', '3 mil millones'], correctIndex: 3, points: 6 },
      { id: 't3b6', question: '¿Qué tipo de célula carece de núcleo?', options: ['Eucariota', 'Procariota', 'Animal', 'Vegetal'], correctIndex: 1, points: 6 },
      { id: 't3b7', question: '¿Qué molécula transporta oxígeno en la sangre?', options: ['Insulina', 'Hemoglobina', 'Colesterol', 'Glucosa'], correctIndex: 1, points: 6 },
      { id: 't3b8', question: '¿Qué es la meiosis?', options: ['División celular que produce 2 células iguales', 'División que produce 4 células haploides', 'Fusión de gametos', 'Duplicación del ADN'], correctIndex: 1, points: 6 },
      { id: 't3b9', question: '¿Qué sistema del cuerpo produce anticuerpos?', options: ['Nervioso', 'Endocrino', 'Inmunológico', 'Digestivo'], correctIndex: 2, points: 6 },
      { id: 't3b10', question: '¿Qué bases nitrogenadas se emparejan en el ADN (A con...)?', options: ['Guanina', 'Citosina', 'Timina', 'Uracilo'], correctIndex: 2, points: 6 },
    ],
  },
];

// ==================== TIER 4 (Erudito) ====================

const TIER_4_THEMES: TestTheme[] = [
  {
    id: 't4-advmath',
    name: 'Matemáticas Avanzadas',
    intro: 'La teoría de números estudia las propiedades de los enteros. Los números primos son los ladrillos fundamentales de la aritmética. El Teorema Fundamental de la Aritmética establece que todo entero mayor que 1 tiene una factorización prima única. La complejidad computacional clasifica problemas según los recursos necesarios para resolverlos. La clase P contiene problemas solubles en tiempo polinomial, mientras que NP incluye aquellos cuya solución es verificable en tiempo polinomial.',
    questions: [
      { id: 't4m1', question: '¿Qué establece el teorema de incompletitud de Gödel?', options: ['Todo sistema es consistente', 'Existen verdades indemostrables en sistemas formales', 'Las matemáticas son completas', 'La lógica es decidible'], correctIndex: 1, points: 8 },
      { id: 't4m2', question: '¿Cuál es la complejidad temporal del quicksort en promedio?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, points: 8 },
      { id: 't4m3', question: '¿Quién demostró el último teorema de Fermat?', options: ['Euler', 'Gauss', 'Andrew Wiles', 'Riemann'], correctIndex: 2, points: 8 },
      { id: 't4m4', question: '¿Qué es un espacio de Hilbert?', options: ['Espacio métrico finito', 'Espacio vectorial con producto interno completo', 'Variedad diferencial', 'Grupo topológico'], correctIndex: 1, points: 8 },
      { id: 't4m5', question: '¿Qué es una transformada de Fourier?', options: ['Integral que descompone en frecuencias', 'Derivada de orden superior', 'Función inversa', 'Serie convergente'], correctIndex: 0, points: 8 },
      { id: 't4m6', question: '¿Cuál es el determinante de la matriz identidad?', options: ['0', '1', '-1', 'Depende del orden'], correctIndex: 1, points: 8 },
      { id: 't4m7', question: '¿Qué es un grupo abeliano?', options: ['Grupo finito', 'Grupo conmutativo', 'Grupo cíclico', 'Grupo simple'], correctIndex: 1, points: 8 },
      { id: 't4m8', question: '¿Qué tipo de convergencia implica la convergencia uniforme?', options: ['Absoluta', 'Puntual', 'Condicional', 'Ninguna'], correctIndex: 1, points: 8 },
      { id: 't4m9', question: 'El Teorema de Bolzano-Weierstrass aplica a secuencias...', options: ['Divergentes', 'Acotadas en ℝⁿ', 'Monótonas', 'Complejas'], correctIndex: 1, points: 8 },
      { id: 't4m10', question: '¿Cuál es la cardinalidad de los números reales?', options: ['ℵ₀', 'ℵ₁', '2^ℵ₀', 'ℵ₂'], correctIndex: 2, points: 8 },
    ],
  },
  {
    id: 't4-quantum',
    name: 'Física Moderna y Cuántica',
    intro: 'La mecánica cuántica describe el comportamiento de partículas subatómicas. El principio de incertidumbre de Heisenberg establece que no se puede conocer simultáneamente la posición y el momento de una partícula con precisión arbitraria. La dualidad onda-partícula muestra que la luz y la materia exhiben propiedades tanto de ondas como de partículas. El Modelo Estándar clasifica las partículas fundamentales en quarks, leptones y bosones.',
    questions: [
      { id: 't4q1', question: '¿Qué principio establece que no se puede conocer posición y momento simultáneamente?', options: ['Exclusión de Pauli', 'Incertidumbre de Heisenberg', 'Complementariedad de Bohr', 'Superposición'], correctIndex: 1, points: 8 },
      { id: 't4q2', question: '¿Cuál es la constante de Avogadro aproximada?', options: ['6.02×10²³', '3.14×10⁸', '9.81×10¹', '1.38×10⁻²³'], correctIndex: 0, points: 8 },
      { id: 't4q3', question: '¿Qué partícula propuesta por Higgs da masa a otras partículas?', options: ['Gluón', 'Bosón de Higgs', 'Gravitón', 'Fotón'], correctIndex: 1, points: 8 },
      { id: 't4q4', question: '¿Qué principio termodinámico establece que la entropía siempre aumenta?', options: ['Primer principio', 'Segundo principio', 'Tercer principio', 'Ley cero'], correctIndex: 1, points: 8 },
      { id: 't4q5', question: '¿Qué es el efecto fotoeléctrico?', options: ['Emisión de luz por calor', 'Emisión de electrones por luz', 'Reflexión total', 'Polarización'], correctIndex: 1, points: 8 },
      { id: 't4q6', question: '¿Qué ecuación describe el estado cuántico de una partícula?', options: ['Maxwell', 'Schrödinger', 'Dirac', 'Euler'], correctIndex: 1, points: 8 },
      { id: 't4q7', question: '¿Qué es el spin de una partícula?', options: ['Velocidad angular', 'Momento angular intrínseco', 'Carga magnética', 'Masa efectiva'], correctIndex: 1, points: 8 },
      { id: 't4q8', question: '¿Qué fuerza mantiene unidos los quarks?', options: ['Electromagnética', 'Gravitatoria', 'Nuclear fuerte', 'Nuclear débil'], correctIndex: 2, points: 8 },
      { id: 't4q9', question: '¿Qué es la radiación de cuerpo negro?', options: ['Radiación de agujeros negros', 'Radiación térmica de un cuerpo ideal', 'Luz ultravioleta', 'Radiación gamma'], correctIndex: 1, points: 8 },
      { id: 't4q10', question: '¿Qué fenómeno demuestra el experimento de la doble rendija?', options: ['Gravedad cuántica', 'Dualidad onda-partícula', 'Fusión nuclear', 'Efecto Doppler'], correctIndex: 1, points: 8 },
    ],
  },
];

// ==================== TIER 5 (Archimago) ====================

const TIER_5_THEMES: TestTheme[] = [
  {
    id: 't5-theoretical',
    name: 'Física Teórica Avanzada',
    intro: 'La física teórica busca una teoría unificada de todas las fuerzas fundamentales. La relatividad general de Einstein describe la gravedad como curvatura del espacio-tiempo. La correspondencia AdS/CFT (Anti-de Sitter/Conformal Field Theory) propuesta por Maldacena sugiere una dualidad entre gravedad en un espacio curvo y una teoría cuántica de campos en su frontera. La teoría de cuerdas propone que las partículas fundamentales son modos de vibración de cuerdas unidimensionales.',
    questions: [
      { id: 't5t1', question: '¿Qué conjetura no resuelta trata sobre la distribución de primos y la función zeta?', options: ['Goldbach', 'Riemann', 'Collatz', 'Poincaré'], correctIndex: 1, points: 10 },
      { id: 't5t2', question: '¿Qué establece el teorema de No-Clonación cuántica?', options: ['Se pueden copiar estados cuánticos', 'No se puede copiar un estado cuántico desconocido', 'Los qubits son deterministas', 'La decoherencia es reversible'], correctIndex: 1, points: 10 },
      { id: 't5t3', question: '¿Qué es la dualidad AdS/CFT?', options: ['Relación masa-energía', 'Correspondencia entre gravedad y teoría de campos', 'Unificación electromagnética', 'Modelo estándar extendido'], correctIndex: 1, points: 10 },
      { id: 't5t4', question: '¿Cuál es la clase de complejidad de problemas verificables en tiempo polinomial?', options: ['P', 'NP', 'PSPACE', 'EXP'], correctIndex: 1, points: 10 },
      { id: 't5t5', question: '¿Qué transformación preserva la métrica de Minkowski?', options: ['Galileana', 'Lorentz', 'Fourier', 'Laplace'], correctIndex: 1, points: 10 },
      { id: 't5t6', question: '¿Qué concepto generaliza la derivada a distribuciones?', options: ['Derivada débil', 'Gradiente', 'Divergencia', 'Laplaciano'], correctIndex: 0, points: 10 },
      { id: 't5t7', question: '¿Qué es la entropía de Bekenstein-Hawking?', options: ['Entropía termodinámica clásica', 'Entropía proporcional al área del horizonte', 'Medida de desorden cuántico', 'Información perdida'], correctIndex: 1, points: 10 },
      { id: 't5t8', question: '¿Cuántas dimensiones propone la teoría de cuerdas (M-theory)?', options: ['4', '10', '11', '26'], correctIndex: 2, points: 10 },
      { id: 't5t9', question: '¿Qué es un tensor de Riemann?', options: ['Medida de curvatura del espacio-tiempo', 'Vector de momento', 'Escalar de energía', 'Campo electromagnético'], correctIndex: 0, points: 10 },
      { id: 't5t10', question: '¿Qué problema del milenio trata sobre P vs NP?', options: ['Si todo problema NP es P', 'Si P es vacío', 'Si NP es decidible', 'Si P = PSPACE'], correctIndex: 0, points: 10 },
    ],
  },
  {
    id: 't5-puremath',
    name: 'Matemática Pura',
    intro: 'La matemática pura explora estructuras abstractas independientes de aplicaciones físicas. La topología estudia propiedades que se preservan bajo deformaciones continuas. La teoría de categorías proporciona un lenguaje unificador para toda la matemática. El programa de Langlands busca conexiones profundas entre la teoría de números y la geometría algebraica. Los grupos de Lie, esenciales en física, son variedades diferenciables con estructura de grupo.',
    questions: [
      { id: 't5p1', question: '¿Qué es una variedad diferenciable?', options: ['Espacio topológico localmente euclidiano con atlas suave', 'Grupo algebraico finito', 'Espacio de Banach', 'Anillo conmutativo'], correctIndex: 0, points: 10 },
      { id: 't5p2', question: '¿Qué estudia la cohomología?', options: ['Ecuaciones diferenciales', 'Invariantes algebraicos de espacios topológicos', 'Convergencia de series', 'Grupos finitos'], correctIndex: 1, points: 10 },
      { id: 't5p3', question: '¿Qué es el programa de Langlands?', options: ['Axiomas de la teoría de conjuntos', 'Red de conjeturas conectando número y geometría', 'Clasificación de grupos simples', 'Teoría de nudos'], correctIndex: 1, points: 10 },
      { id: 't5p4', question: '¿Qué es un funtor en teoría de categorías?', options: ['Función entre conjuntos', 'Morfismo entre categorías', 'Elemento de un grupo', 'Operador lineal'], correctIndex: 1, points: 10 },
      { id: 't5p5', question: '¿Cuál es la característica de Euler de una esfera?', options: ['0', '1', '2', '-2'], correctIndex: 2, points: 10 },
      { id: 't5p6', question: '¿Qué establece el teorema de clasificación de superficies?', options: ['Toda superficie compacta es orientable', 'Toda superficie compacta es una esfera con asas o crosscaps', 'Toda superficie es plana', 'No existen superficies no orientables'], correctIndex: 1, points: 10 },
      { id: 't5p7', question: '¿Qué es un esquema en geometría algebraica?', options: ['Gráfica de una función', 'Espacio localmente isomorfo al espectro de un anillo', 'Subconjunto de ℝⁿ', 'Diagrama de Venn'], correctIndex: 1, points: 10 },
      { id: 't5p8', question: '¿Qué es la conjetura de Hodge?', options: ['Sobre primos gemelos', 'Clases de cohomología y subvariedades algebraicas', 'Distribución de ceros', 'Completitud de axiomas'], correctIndex: 1, points: 10 },
    ],
  },
];

const ALL_THEMES = [TIER_0_THEMES, TIER_1_THEMES, TIER_2_THEMES, TIER_3_THEMES, TIER_4_THEMES, TIER_5_THEMES];

export function getTestForTier(tier: number, answeredCorrectly: string[] = []): { theme: TestTheme; questions: TestQuestion[] } {
  const clampedTier = Math.min(tier, ALL_THEMES.length - 1);
  const themes = ALL_THEMES[clampedTier];
  
  // Pick a random theme
  const theme = themes[Math.floor(Math.random() * themes.length)];
  
  // Filter out correctly answered questions
  const available = theme.questions.filter(q => !answeredCorrectly.includes(q.id));
  
  // If not enough available questions in this theme, try another theme
  if (available.length < 5) {
    for (const t of themes) {
      const avail = t.questions.filter(q => !answeredCorrectly.includes(q.id));
      if (avail.length >= 5) {
        const shuffled = [...avail].sort(() => Math.random() - 0.5);
        return { theme: t, questions: shuffled.slice(0, 5) };
      }
    }
    // Fallback: use all available from any theme in this tier
    const allAvailable = themes.flatMap(t => t.questions.filter(q => !answeredCorrectly.includes(q.id)));
    const shuffled = [...allAvailable].sort(() => Math.random() - 0.5);
    return { theme, questions: shuffled.slice(0, Math.min(5, shuffled.length)) };
  }
  
  // Pick 5 random questions
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return { theme, questions: shuffled.slice(0, 5) };
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
