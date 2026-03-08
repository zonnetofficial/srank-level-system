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
    id: 't0-solarsystem',
    name: 'El Sistema Solar',
    intro: `Nuestro sistema solar se formó hace aproximadamente 4,600 millones de años a partir de una nube de gas y polvo llamada nebulosa solar. En el centro se encuentra el Sol, una estrella de tipo G que contiene el 99.86% de toda la masa del sistema. Orbitan alrededor de él ocho planetas divididos en dos grupos: los planetas rocosos o terrestres (Mercurio, Venus, Tierra y Marte), que son pequeños y densos con superficies sólidas; y los gigantes gaseosos y helados (Júpiter, Saturno, Urano y Neptuno), que son enormes y compuestos principalmente de hidrógeno y helio.

Mercurio es el planeta más cercano al Sol, pero no el más caliente: ese título pertenece a Venus, cuya densa atmósfera de dióxido de carbono atrapa el calor mediante un efecto invernadero extremo, alcanzando temperaturas de hasta 465°C. La Tierra es el único planeta conocido con agua líquida en su superficie y una atmósfera rica en nitrógeno (78%) y oxígeno (21%). Marte, conocido como el planeta rojo por el óxido de hierro en su suelo, tiene el volcán más alto del sistema solar: el Olympus Mons, con 21 km de altura.

Júpiter es el planeta más grande, con una masa 318 veces la de la Tierra. Su Gran Mancha Roja es una tormenta que ha durado al menos 400 años. Saturno es famoso por sus anillos, compuestos principalmente de partículas de hielo. Urano rota de lado, con una inclinación axial de 98 grados. Neptuno tiene los vientos más fuertes del sistema solar, alcanzando 2,100 km/h.

Plutón fue reclasificado como planeta enano en 2006 por la Unión Astronómica Internacional. El cinturón de asteroides se encuentra entre Marte y Júpiter, mientras que el cinturón de Kuiper se extiende más allá de Neptuno. La Luna es el único satélite natural de la Tierra y tarda 27.3 días en completar una órbita.`,
    questions: [
      { id: 't0s1', question: '¿Qué porcentaje de la masa del sistema solar contiene el Sol?', options: ['89.5%', '95.2%', '99.86%', '75.3%'], correctIndex: 2, points: 1 },
      { id: 't0s2', question: '¿Por qué Venus es más caliente que Mercurio a pesar de estar más lejos del Sol?', options: ['Tiene volcanes activos', 'Su atmósfera atrapa el calor por efecto invernadero', 'Refleja menos luz solar', 'Tiene un núcleo más caliente'], correctIndex: 1, points: 1 },
      { id: 't0s3', question: '¿Cuánto mide de altura el Olympus Mons en Marte?', options: ['8 km', '15 km', '21 km', '35 km'], correctIndex: 2, points: 1 },
      { id: 't0s4', question: '¿Qué hace especial la inclinación axial de Urano?', options: ['No tiene inclinación', 'Rota de lado, con 98 grados', 'Rota al revés', 'Tiene inclinación variable'], correctIndex: 1, points: 1 },
      { id: 't0s5', question: '¿De qué están compuestos principalmente los anillos de Saturno?', options: ['Roca volcánica', 'Gas congelado', 'Partículas de hielo', 'Polvo metálico'], correctIndex: 2, points: 1 },
      { id: 't0s6', question: '¿Cuál es el gas más abundante en la atmósfera terrestre?', options: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno', 'Argón'], correctIndex: 2, points: 1 },
      { id: 't0s7', question: '¿Qué velocidad alcanzan los vientos de Neptuno?', options: ['500 km/h', '1,200 km/h', '2,100 km/h', '800 km/h'], correctIndex: 2, points: 1 },
      { id: 't0s8', question: '¿Cuántas veces más masivo que la Tierra es Júpiter?', options: ['150 veces', '200 veces', '318 veces', '500 veces'], correctIndex: 2, points: 1 },
      { id: 't0s9', question: '¿En qué año fue Plutón reclasificado como planeta enano?', options: ['2000', '2003', '2006', '2010'], correctIndex: 2, points: 1 },
      { id: 't0s10', question: '¿Cuánto tiempo lleva la Gran Mancha Roja de Júpiter activa?', options: ['Al menos 100 años', 'Al menos 400 años', 'Al menos 1000 años', 'Unos 50 años'], correctIndex: 1, points: 1 },
      { id: 't0s11', question: '¿Dónde se encuentra el cinturón de asteroides?', options: ['Entre la Tierra y Venus', 'Entre Marte y Júpiter', 'Más allá de Neptuno', 'Entre Júpiter y Saturno'], correctIndex: 1, points: 1 },
      { id: 't0s12', question: '¿Qué temperatura puede alcanzar la superficie de Venus?', options: ['200°C', '350°C', '465°C', '600°C'], correctIndex: 2, points: 1 },
      { id: 't0s13', question: '¿Cuánto tarda la Luna en completar una órbita alrededor de la Tierra?', options: ['14 días', '27.3 días', '30 días', '365 días'], correctIndex: 1, points: 1 },
      { id: 't0s14', question: '¿A qué grupo pertenecen Mercurio, Venus, Tierra y Marte?', options: ['Gigantes gaseosos', 'Planetas enanos', 'Planetas terrestres o rocosos', 'Planetas helados'], correctIndex: 2, points: 1 },
      { id: 't0s15', question: '¿Qué le da el color rojo a Marte?', options: ['Volcanes activos', 'Nubes de metano', 'Óxido de hierro en su suelo', 'Reflexión de la luz solar'], correctIndex: 2, points: 1 },
      { id: 't0s16', question: '¿Hace cuántos años se formó el sistema solar?', options: ['1,000 millones', '2,500 millones', '4,600 millones', '10,000 millones'], correctIndex: 2, points: 1 },
      { id: 't0s17', question: '¿Qué tipo de estrella es el Sol?', options: ['Tipo A', 'Tipo F', 'Tipo G', 'Tipo M'], correctIndex: 2, points: 1 },
      { id: 't0s18', question: '¿Qué es una nebulosa solar?', options: ['Un tipo de estrella', 'Una nube de gas y polvo', 'Un cinturón de asteroides', 'Un agujero negro'], correctIndex: 1, points: 1 },
      { id: 't0s19', question: '¿Dónde se extiende el cinturón de Kuiper?', options: ['Entre el Sol y Mercurio', 'Entre Marte y Júpiter', 'Más allá de Neptuno', 'Dentro de la órbita terrestre'], correctIndex: 2, points: 1 },
      { id: 't0s20', question: '¿Qué compone principalmente a los gigantes gaseosos?', options: ['Roca y metal', 'Hidrógeno y helio', 'Agua y amoníaco', 'Nitrógeno y oxígeno'], correctIndex: 1, points: 1 },
    ],
  },
  {
    id: 't0-math',
    name: 'Fundamentos de Aritmética',
    intro: `La aritmética es la rama más antigua de las matemáticas y se ocupa de las cuatro operaciones fundamentales: suma, resta, multiplicación y división. Los babilonios ya utilizaban un sistema numérico hace más de 4,000 años, aunque usaban base 60 en lugar de base 10. De hecho, heredamos de ellos la división del tiempo en 60 minutos y 60 segundos.

El sistema decimal que usamos hoy proviene de la India y fue transmitido a Europa por los árabes en la Edad Media. Cada posición en un número decimal tiene un valor diez veces mayor que la posición a su derecha: las unidades valen 1, las decenas valen 10, las centenas valen 100, y así sucesivamente. El número cero, un concepto revolucionario, fue formalizado en la India alrededor del siglo V.

La multiplicación puede entenderse como una suma repetida: 4 × 5 significa sumar 4 cinco veces (4 + 4 + 4 + 4 + 4 = 20). La división es la operación inversa de la multiplicación: si 6 × 7 = 42, entonces 42 ÷ 7 = 6. Cuando una división no es exacta, produce un residuo: por ejemplo, 17 ÷ 5 = 3 con residuo 2, porque 5 × 3 = 15 y 17 - 15 = 2.

Las propiedades conmutativa (a + b = b + a), asociativa ((a + b) + c = a + (b + c)) y distributiva (a × (b + c) = a × b + a × c) son fundamentales. La propiedad distributiva es especialmente útil: para calcular 7 × 13, podemos descomponer: 7 × 10 + 7 × 3 = 70 + 21 = 91.

Los números primos son aquellos divisibles solo por 1 y por sí mismos: 2, 3, 5, 7, 11, 13... El 2 es el único primo par. Todo número compuesto puede descomponerse en factores primos de manera única, lo que se conoce como el Teorema Fundamental de la Aritmética.`,
    questions: [
      { id: 't0a1', question: '¿Qué base numérica usaban los babilonios?', options: ['Base 10', 'Base 12', 'Base 60', 'Base 20'], correctIndex: 2, points: 1 },
      { id: 't0a2', question: '¿Cuál es el residuo de 17 ÷ 5?', options: ['1', '2', '3', '4'], correctIndex: 1, points: 1 },
      { id: 't0a3', question: 'Usando la propiedad distributiva, ¿cuánto es 7 × 13?', options: ['84', '91', '87', '93'], correctIndex: 1, points: 1 },
      { id: 't0a4', question: '¿En qué siglo se formalizó el concepto del número cero en la India?', options: ['Siglo III', 'Siglo V', 'Siglo VIII', 'Siglo I'], correctIndex: 1, points: 1 },
      { id: 't0a5', question: '¿Cuál es el único número primo par?', options: ['1', '2', '3', '4'], correctIndex: 1, points: 1 },
      { id: 't0a6', question: '¿Qué propiedad establece que a × (b + c) = a × b + a × c?', options: ['Conmutativa', 'Asociativa', 'Distributiva', 'Identidad'], correctIndex: 2, points: 1 },
      { id: 't0a7', question: 'Si 6 × 7 = 42, ¿cuánto es 42 ÷ 7?', options: ['5', '6', '7', '8'], correctIndex: 1, points: 1 },
      { id: 't0a8', question: '¿Cuánto vale la posición de las centenas en el sistema decimal?', options: ['10', '50', '100', '1000'], correctIndex: 2, points: 1 },
      { id: 't0a9', question: '¿Qué significa 4 × 5 como suma repetida?', options: ['4 + 5', '4 + 4 + 4 + 4 + 4', '5 + 5 + 5 + 5 + 5', '4 × 4 × 4'], correctIndex: 1, points: 1 },
      { id: 't0a10', question: '¿Cómo se llama el teorema que dice que todo número se descompone en primos de forma única?', options: ['Teorema de Pitágoras', 'Teorema Fundamental de la Aritmética', 'Teorema de Euclides', 'Teorema del valor medio'], correctIndex: 1, points: 1 },
      { id: 't0a11', question: '¿Quiénes transmitieron el sistema decimal a Europa?', options: ['Los romanos', 'Los griegos', 'Los árabes', 'Los chinos'], correctIndex: 2, points: 1 },
      { id: 't0a12', question: '¿Cuánto es 5 × 3 según la multiplicación?', options: ['8', '12', '15', '20'], correctIndex: 2, points: 1 },
      { id: 't0a13', question: '¿Qué propiedad dice que a + b = b + a?', options: ['Distributiva', 'Asociativa', 'Conmutativa', 'Inversa'], correctIndex: 2, points: 1 },
      { id: 't0a14', question: '¿Cuáles de estos números son todos primos?', options: ['2, 4, 6, 8', '1, 3, 5, 9', '2, 3, 5, 7', '3, 6, 9, 12'], correctIndex: 2, points: 1 },
      { id: 't0a15', question: '¿Por qué heredamos los 60 minutos de la hora?', options: ['Por los romanos', 'Por el sistema babilónico base 60', 'Por los egipcios', 'Por convención moderna'], correctIndex: 1, points: 1 },
      { id: 't0a16', question: '¿Cuánto es 144 ÷ 12?', options: ['10', '11', '12', '14'], correctIndex: 2, points: 1 },
      { id: 't0a17', question: '¿Qué operación es la inversa de la multiplicación?', options: ['Suma', 'Resta', 'División', 'Potenciación'], correctIndex: 2, points: 1 },
      { id: 't0a18', question: '¿Cuánto es (3 + 4) + 5 usando la propiedad asociativa?', options: ['10', '11', '12', '15'], correctIndex: 2, points: 1 },
      { id: 't0a19', question: '¿Es el 1 un número primo?', options: ['Sí', 'No', 'Depende', 'Solo en algunos sistemas'], correctIndex: 1, points: 1 },
      { id: 't0a20', question: '¿Cuánto es 8 × 7?', options: ['48', '54', '56', '58'], correctIndex: 2, points: 1 },
    ],
  },
  {
    id: 't0-humanbody',
    name: 'El Cuerpo Humano',
    intro: `El cuerpo humano es una máquina extraordinaria compuesta por aproximadamente 37.2 billones de células organizadas en tejidos, órganos y sistemas. El esqueleto adulto tiene 206 huesos (los bebés nacen con unos 270 que se fusionan con el crecimiento). El hueso más largo es el fémur, en el muslo, y el más pequeño es el estribo, en el oído medio, con apenas 3 milímetros.

El sistema circulatorio está impulsado por el corazón, que late unas 100,000 veces al día, bombeando aproximadamente 7,500 litros de sangre. Los glóbulos rojos transportan oxígeno gracias a una proteína llamada hemoglobina, que contiene hierro y le da a la sangre su color rojo. Un adulto promedio tiene entre 4.5 y 5.5 litros de sangre.

El cerebro humano pesa alrededor de 1.4 kg y contiene unos 86 mil millones de neuronas. Aunque representa solo el 2% del peso corporal, consume el 20% de la energía total. El cerebro está dividido en dos hemisferios conectados por el cuerpo calloso. El hemisferio izquierdo generalmente se asocia con el lenguaje y la lógica, mientras que el derecho se relaciona con la creatividad y la percepción espacial.

El sistema digestivo mide aproximadamente 9 metros de largo, desde la boca hasta el ano. El intestino delgado, donde se absorbe la mayoría de los nutrientes, tiene unos 6 metros. El hígado es el órgano interno más grande, pesando alrededor de 1.5 kg, y realiza más de 500 funciones, incluyendo la producción de bilis y la desintoxicación.

La piel es el órgano más grande del cuerpo, con una superficie de aproximadamente 2 metros cuadrados. Se renueva completamente cada 27 días. Los pulmones tienen una superficie interna de unos 70 metros cuadrados gracias a los alvéolos, estructuras diminutas donde ocurre el intercambio de gases.`,
    questions: [
      { id: 't0h1', question: '¿Cuántas células tiene aproximadamente el cuerpo humano?', options: ['1 millón', '37.2 billones', '206 millones', '86 mil millones'], correctIndex: 1, points: 1 },
      { id: 't0h2', question: '¿Por qué los bebés tienen más huesos que los adultos?', options: ['Porque pierden huesos', 'Porque los huesos se fusionan al crecer', 'Porque les crecen huesos nuevos', 'No es cierto'], correctIndex: 1, points: 1 },
      { id: 't0h3', question: '¿Cuántos litros de sangre bombea el corazón por día?', options: ['2,000', '5,000', '7,500', '10,000'], correctIndex: 2, points: 1 },
      { id: 't0h4', question: '¿Qué proteína da color rojo a la sangre?', options: ['Insulina', 'Queratina', 'Hemoglobina', 'Colágeno'], correctIndex: 2, points: 1 },
      { id: 't0h5', question: '¿Qué porcentaje de la energía corporal consume el cerebro?', options: ['5%', '10%', '15%', '20%'], correctIndex: 3, points: 1 },
      { id: 't0h6', question: '¿Cuánto mide el hueso más pequeño del cuerpo (estribo)?', options: ['3 mm', '1 cm', '5 mm', '2 cm'], correctIndex: 0, points: 1 },
      { id: 't0h7', question: '¿Qué conecta los dos hemisferios cerebrales?', options: ['El tálamo', 'El cerebelo', 'El cuerpo calloso', 'La médula'], correctIndex: 2, points: 1 },
      { id: 't0h8', question: '¿Cuánto mide aproximadamente el sistema digestivo completo?', options: ['3 metros', '6 metros', '9 metros', '12 metros'], correctIndex: 2, points: 1 },
      { id: 't0h9', question: '¿Cuántas funciones realiza el hígado?', options: ['Más de 50', 'Más de 200', 'Más de 500', 'Más de 1000'], correctIndex: 2, points: 1 },
      { id: 't0h10', question: '¿Cada cuántos días se renueva completamente la piel?', options: ['7 días', '14 días', '27 días', '60 días'], correctIndex: 2, points: 1 },
      { id: 't0h11', question: '¿Cuántas neuronas tiene el cerebro humano?', options: ['10 mil millones', '50 mil millones', '86 mil millones', '200 mil millones'], correctIndex: 2, points: 1 },
      { id: 't0h12', question: '¿Cuál es el órgano más grande del cuerpo humano?', options: ['El hígado', 'El cerebro', 'La piel', 'Los pulmones'], correctIndex: 2, points: 1 },
      { id: 't0h13', question: '¿Cuántos metros tiene el intestino delgado?', options: ['3 metros', '6 metros', '9 metros', '12 metros'], correctIndex: 1, points: 1 },
      { id: 't0h14', question: '¿Qué elemento contiene la hemoglobina?', options: ['Calcio', 'Zinc', 'Hierro', 'Potasio'], correctIndex: 2, points: 1 },
      { id: 't0h15', question: '¿Cuántas veces late el corazón al día aproximadamente?', options: ['50,000', '75,000', '100,000', '150,000'], correctIndex: 2, points: 1 },
      { id: 't0h16', question: '¿Qué estructuras diminutas en los pulmones permiten el intercambio de gases?', options: ['Bronquios', 'Alvéolos', 'Tráquea', 'Pleura'], correctIndex: 1, points: 1 },
      { id: 't0h17', question: '¿Cuánta superficie interna tienen los pulmones?', options: ['10 m²', '30 m²', '70 m²', '150 m²'], correctIndex: 2, points: 1 },
      { id: 't0h18', question: '¿Qué hemisferio cerebral se asocia generalmente con el lenguaje?', options: ['Derecho', 'Izquierdo', 'Ambos por igual', 'Ninguno'], correctIndex: 1, points: 1 },
      { id: 't0h19', question: '¿Cuánto pesa el cerebro humano?', options: ['0.5 kg', '1.0 kg', '1.4 kg', '2.0 kg'], correctIndex: 2, points: 1 },
      { id: 't0h20', question: '¿Qué produce el hígado para ayudar a la digestión?', options: ['Insulina', 'Bilis', 'Amilasa', 'Pepsina'], correctIndex: 1, points: 1 },
    ],
  },
];

// ==================== TIER 1 (Aprendiz) ====================

const TIER_1_THEMES: TestTheme[] = [
  {
    id: 't1-romanempire',
    name: 'El Imperio Romano',
    intro: `El Imperio Romano fue una de las civilizaciones más influyentes de la historia, extendiéndose desde el 27 a.C. con la ascensión de Augusto como primer emperador, hasta la caída de Roma en el 476 d.C. En su máxima extensión bajo el emperador Trajano (117 d.C.), el imperio abarcaba desde Britania hasta Mesopotamia, cubriendo aproximadamente 5 millones de kilómetros cuadrados y albergando entre 55 y 70 millones de personas.

La república que precedió al imperio funcionaba con un senado y dos cónsules elegidos anualmente. Julio César, que nunca fue emperador sino dictador perpetuo, fue asesinado en los Idus de Marzo (15 de marzo) del 44 a.C. por un grupo de senadores liderados por Bruto y Casio. Tras las guerras civiles posteriores, su sobrino-nieto Octaviano se convirtió en Augusto, consolidando el poder imperial.

Roma innovó en ingeniería: los acueductos transportaban agua a las ciudades (el Aqua Appia fue el primero, construido en 312 a.C.); las calzadas romanas formaban una red de más de 80,000 km; y el concreto romano, que usaba ceniza volcánica (puzolana), era tan duradero que estructuras como el Panteón siguen en pie 2,000 años después. El Coliseo, inaugurado en el 80 d.C., tenía capacidad para 50,000 espectadores.

El derecho romano sentó las bases del sistema legal occidental. El "Corpus Iuris Civilis", compilado bajo Justiniano I en el 534 d.C. (ya en el Imperio Bizantino), codificó siglos de legislación. Conceptos como "inocente hasta que se demuestre lo contrario" y la distinción entre derecho público y privado provienen de Roma.

El imperio se dividió oficialmente en el 395 d.C. bajo Teodosio I en Imperio Romano de Occidente (capital: Rávena) y de Oriente (capital: Constantinopla). Mientras Occidente cayó ante las invasiones germánicas en 476, el Imperio Bizantino sobrevivió hasta 1453, cuando Constantinopla fue conquistada por los turcos otomanos.`,
    questions: [
      { id: 't1r1', question: '¿Quién fue el primer emperador romano?', options: ['Julio César', 'Augusto', 'Nerón', 'Trajano'], correctIndex: 1, points: 2 },
      { id: 't1r2', question: '¿Bajo qué emperador alcanzó el imperio su máxima extensión?', options: ['Augusto', 'Adriano', 'Trajano', 'Marco Aurelio'], correctIndex: 2, points: 2 },
      { id: 't1r3', question: '¿Qué fecha son los Idus de Marzo?', options: ['1 de marzo', '15 de marzo', '21 de marzo', '31 de marzo'], correctIndex: 1, points: 2 },
      { id: 't1r4', question: '¿Qué ingrediente hacía tan duradero al concreto romano?', options: ['Arena de río', 'Ceniza volcánica (puzolana)', 'Cal viva', 'Arcilla cocida'], correctIndex: 1, points: 2 },
      { id: 't1r5', question: '¿Cuántos kilómetros formaban la red de calzadas romanas?', options: ['20,000 km', '50,000 km', '80,000 km', '120,000 km'], correctIndex: 2, points: 2 },
      { id: 't1r6', question: '¿Cuántos espectadores cabían en el Coliseo?', options: ['25,000', '50,000', '80,000', '100,000'], correctIndex: 1, points: 2 },
      { id: 't1r7', question: '¿Qué compilación legal realizó Justiniano I?', options: ['Lex Romana', 'Código de Hammurabi', 'Corpus Iuris Civilis', 'Carta Magna'], correctIndex: 2, points: 2 },
      { id: 't1r8', question: '¿En qué año se dividió oficialmente el imperio?', options: ['285 d.C.', '330 d.C.', '395 d.C.', '410 d.C.'], correctIndex: 2, points: 2 },
      { id: 't1r9', question: '¿Cuál fue la capital del Imperio Romano de Occidente tras la división?', options: ['Roma', 'Milán', 'Rávena', 'Cartago'], correctIndex: 2, points: 2 },
      { id: 't1r10', question: '¿En qué año cayó Constantinopla ante los turcos otomanos?', options: ['1204', '1389', '1453', '1492'], correctIndex: 2, points: 2 },
      { id: 't1r11', question: '¿Cuántas personas habitaban el imperio en su apogeo?', options: ['20-30 millones', '55-70 millones', '100-120 millones', '150 millones'], correctIndex: 1, points: 2 },
      { id: 't1r12', question: '¿Cómo se llamó el primer acueducto romano?', options: ['Aqua Claudia', 'Aqua Appia', 'Aqua Virgo', 'Aqua Marcia'], correctIndex: 1, points: 2 },
      { id: 't1r13', question: '¿Qué título ostentaba Julio César al morir?', options: ['Emperador', 'Cónsul', 'Dictador perpetuo', 'Rey'], correctIndex: 2, points: 2 },
      { id: 't1r14', question: '¿Qué principio legal romano usamos hoy?', options: ['Culpable hasta demostrar inocencia', 'La ley del más fuerte', 'Inocente hasta que se demuestre lo contrario', 'Juicio por combate'], correctIndex: 2, points: 2 },
      { id: 't1r15', question: '¿Quiénes lideraron el asesinato de César?', options: ['Augusto y Marco Antonio', 'Bruto y Casio', 'Pompeyo y Craso', 'Cicerón y Catón'], correctIndex: 1, points: 2 },
      { id: 't1r16', question: '¿En qué año fue inaugurado el Coliseo?', options: ['50 d.C.', '80 d.C.', '100 d.C.', '120 d.C.'], correctIndex: 1, points: 2 },
      { id: 't1r17', question: '¿Cuántos kilómetros cuadrados cubría el imperio bajo Trajano?', options: ['2 millones', '5 millones', '8 millones', '10 millones'], correctIndex: 1, points: 2 },
      { id: 't1r18', question: '¿Qué estructura romana con concreto sigue en pie hoy?', options: ['El Foro', 'El Circo Máximo', 'El Panteón', 'Las Termas'], correctIndex: 2, points: 2 },
      { id: 't1r19', question: '¿Qué emperador dividió el imperio oficialmente?', options: ['Constantino', 'Diocleciano', 'Teodosio I', 'Valentiniano'], correctIndex: 2, points: 2 },
      { id: 't1r20', question: '¿En qué año se construyó el primer acueducto?', options: ['500 a.C.', '312 a.C.', '200 a.C.', '100 a.C.'], correctIndex: 1, points: 2 },
    ],
  },
  {
    id: 't1-fractions',
    name: 'Fracciones, Porcentajes y Proporciones',
    intro: `Las fracciones son una forma de representar partes de un todo. Una fracción tiene dos componentes: el numerador (parte superior) indica cuántas partes se toman, y el denominador (parte inferior) indica en cuántas partes iguales se divide el todo. Por ejemplo, 3/4 significa que de un objeto dividido en 4 partes iguales, tomamos 3.

Dos fracciones son equivalentes cuando representan la misma cantidad. Para encontrar fracciones equivalentes, multiplicamos o dividimos ambos términos por el mismo número: 1/2 = 2/4 = 3/6. Para simplificar una fracción, dividimos numerador y denominador por su máximo común divisor (MCD). Por ejemplo, 12/18: el MCD de 12 y 18 es 6, así que 12/18 = 2/3.

Para sumar fracciones con diferente denominador, primero encontramos un denominador común. El mínimo común múltiplo (MCM) de los denominadores nos da el denominador más pequeño posible. Ejemplo: 1/3 + 1/4. El MCM de 3 y 4 es 12, entonces: 4/12 + 3/12 = 7/12.

Los porcentajes son fracciones con denominador 100. El 25% equivale a 25/100 = 1/4. Para calcular el porcentaje de un número, multiplicamos: el 15% de 80 = 0.15 × 80 = 12. Los descuentos funcionan restando: si un producto de $120 tiene 30% de descuento, el descuento es 0.30 × 120 = $36, y el precio final es $84.

Las proporciones establecen la igualdad entre dos razones: a/b = c/d. Si 3 manzanas cuestan $9, ¿cuánto cuestan 7? Planteamos: 3/9 = 7/x, resolviendo: x = (9 × 7) / 3 = 21. La regla de tres es la aplicación práctica más común de las proporciones.

Los números decimales son otra forma de escribir fracciones: 0.75 = 75/100 = 3/4. Algunos decimales son periódicos: 1/3 = 0.333... Se escribe como 0.3̄ (con una barra sobre el 3).`,
    questions: [
      { id: 't1f1', question: '¿Cuál es el MCD de 12 y 18?', options: ['3', '4', '6', '9'], correctIndex: 2, points: 2 },
      { id: 't1f2', question: '¿Cuánto es 1/3 + 1/4?', options: ['2/7', '7/12', '4/12', '1/7'], correctIndex: 1, points: 2 },
      { id: 't1f3', question: 'Si un producto de $120 tiene 30% de descuento, ¿cuánto pagas?', options: ['$36', '$84', '$90', '$96'], correctIndex: 1, points: 2 },
      { id: 't1f4', question: '¿Cuánto es el 15% de 80?', options: ['8', '10', '12', '15'], correctIndex: 2, points: 2 },
      { id: 't1f5', question: 'Si 3 manzanas cuestan $9, ¿cuánto cuestan 7?', options: ['$18', '$19', '$21', '$24'], correctIndex: 2, points: 2 },
      { id: 't1f6', question: '¿A qué fracción equivale 0.75?', options: ['1/2', '2/3', '3/4', '4/5'], correctIndex: 2, points: 2 },
      { id: 't1f7', question: '¿Cuál es el MCM de 3 y 4?', options: ['7', '12', '24', '6'], correctIndex: 1, points: 2 },
      { id: 't1f8', question: '¿Qué fracción simplificada es equivalente a 12/18?', options: ['3/4', '2/3', '4/6', '6/9'], correctIndex: 1, points: 2 },
      { id: 't1f9', question: '¿Cómo se escribe 1/3 en decimal?', options: ['0.33', '0.3̄ (periódico)', '0.30', '0.25'], correctIndex: 1, points: 2 },
      { id: 't1f10', question: '¿Qué porcentaje equivale a la fracción 1/4?', options: ['20%', '25%', '30%', '40%'], correctIndex: 1, points: 2 },
      { id: 't1f11', question: '¿Cuánto es 3/4 de 100?', options: ['65', '70', '75', '80'], correctIndex: 2, points: 2 },
      { id: 't1f12', question: '¿Cuánto es 0.5 × 0.5?', options: ['0.1', '0.25', '0.5', '1.0'], correctIndex: 1, points: 2 },
      { id: 't1f13', question: '¿Qué indica el denominador de una fracción?', options: ['Las partes tomadas', 'Las partes totales', 'El resultado', 'El entero'], correctIndex: 1, points: 2 },
      { id: 't1f14', question: 'Para encontrar fracciones equivalentes, ¿qué hacemos?', options: ['Sumamos mismo número', 'Multiplicamos ambos términos por el mismo número', 'Restamos el numerador', 'Invertimos la fracción'], correctIndex: 1, points: 2 },
      { id: 't1f15', question: '¿Cuánto es el 20% de 250?', options: ['40', '45', '50', '55'], correctIndex: 2, points: 2 },
      { id: 't1f16', question: '¿Cuánto es 2/5 + 1/5?', options: ['1/5', '2/5', '3/5', '4/5'], correctIndex: 2, points: 2 },
      { id: 't1f17', question: '¿Cuál es la raíz cuadrada de 144?', options: ['10', '11', '12', '14'], correctIndex: 2, points: 2 },
      { id: 't1f18', question: '¿Cuánto es 7²?', options: ['42', '47', '49', '56'], correctIndex: 2, points: 2 },
      { id: 't1f19', question: '¿Qué fracción equivale a 50%?', options: ['1/3', '1/4', '1/2', '2/3'], correctIndex: 2, points: 2 },
      { id: 't1f20', question: '¿Cuánto es 1/3 de 90?', options: ['20', '25', '30', '35'], correctIndex: 2, points: 2 },
    ],
  },
];

// ==================== TIER 2 (Estudioso) ====================

const TIER_2_THEMES: TestTheme[] = [
  {
    id: 't2-algebra',
    name: 'Álgebra y Ecuaciones',
    intro: `El álgebra es la rama de las matemáticas que generaliza la aritmética usando letras para representar números desconocidos. Una ecuación es una igualdad que contiene una o más incógnitas. La ecuación lineal más simple tiene la forma ax + b = c, donde despejamos x: x = (c - b) / a.

El Teorema de Pitágoras establece que en todo triángulo rectángulo, el cuadrado de la hipotenusa (el lado más largo, opuesto al ángulo recto) es igual a la suma de los cuadrados de los catetos: a² + b² = c². Por ejemplo, si los catetos miden 3 y 4, la hipotenusa mide √(9 + 16) = √25 = 5. Esto se conoce como la terna pitagórica (3, 4, 5).

Las ecuaciones cuadráticas tienen la forma ax² + bx + c = 0. Se resuelven con la fórmula general: x = (-b ± √(b² - 4ac)) / (2a). El discriminante (b² - 4ac) determina el número de soluciones: si es positivo hay dos soluciones reales, si es cero hay una (doble), y si es negativo no hay soluciones reales.

Las funciones lineales se representan como y = mx + b, donde m es la pendiente (inclinación de la recta) y b es la ordenada al origen (punto donde la recta cruza el eje y). Dos rectas paralelas tienen la misma pendiente; dos rectas perpendiculares tienen pendientes cuyo producto es -1.

Los exponentes siguen reglas específicas: x^a × x^b = x^(a+b), (x^a)^b = x^(ab), x^0 = 1 para cualquier x ≠ 0. Los logaritmos son la operación inversa: si 10^3 = 1000, entonces log₁₀(1000) = 3. La propiedad más útil es: log(a × b) = log(a) + log(b).

La factorización transforma expresiones en productos: x² - 9 = (x + 3)(x - 3) es una diferencia de cuadrados. La expresión x² + 5x + 6 = (x + 2)(x + 3) se factoriza buscando dos números que sumen 5 y multipliquen 6.`,
    questions: [
      { id: 't2a1', question: 'Si 2x + 5 = 17, ¿cuánto vale x?', options: ['4', '5', '6', '7'], correctIndex: 2, points: 4 },
      { id: 't2a2', question: '¿Cuánto es la hipotenusa de un triángulo con catetos 3 y 4?', options: ['5', '6', '7', '√7'], correctIndex: 0, points: 4 },
      { id: 't2a3', question: '¿Qué determina el discriminante de una ecuación cuadrática?', options: ['La pendiente', 'El número de soluciones reales', 'El máximo', 'La simetría'], correctIndex: 1, points: 4 },
      { id: 't2a4', question: 'Si el discriminante es negativo, ¿cuántas soluciones reales hay?', options: ['Dos', 'Una', 'Ninguna', 'Infinitas'], correctIndex: 2, points: 4 },
      { id: 't2a5', question: '¿Cuánto es log₁₀(1000)?', options: ['2', '3', '4', '10'], correctIndex: 1, points: 4 },
      { id: 't2a6', question: '¿Cuál es la pendiente de y = 3x + 2?', options: ['1', '2', '3', '5'], correctIndex: 2, points: 4 },
      { id: 't2a7', question: 'Simplifica: (x²)(x³)', options: ['x⁵', 'x⁶', '2x⁵', 'x⁸'], correctIndex: 0, points: 4 },
      { id: 't2a8', question: 'Factoriza: x² - 9', options: ['(x-3)²', '(x+9)(x-1)', '(x+3)(x-3)', '(x-9)(x+1)'], correctIndex: 2, points: 4 },
      { id: 't2a9', question: '¿Cuánto vale x⁰ si x ≠ 0?', options: ['0', '1', 'x', 'Indefinido'], correctIndex: 1, points: 4 },
      { id: 't2a10', question: 'Si dos rectas perpendiculares tienen pendientes m₁ y m₂, ¿qué relación cumplen?', options: ['m₁ = m₂', 'm₁ + m₂ = 0', 'm₁ × m₂ = -1', 'm₁ / m₂ = 1'], correctIndex: 2, points: 4 },
      { id: 't2a11', question: 'Resuelve: 3(x - 2) = 15', options: ['5', '6', '7', '8'], correctIndex: 2, points: 4 },
      { id: 't2a12', question: 'Si f(x) = 2x + 1, ¿cuánto es f(5)?', options: ['9', '10', '11', '12'], correctIndex: 2, points: 4 },
      { id: 't2a13', question: '¿Cuál es la fórmula general para ecuaciones cuadráticas?', options: ['x = -b/2a', 'x = (-b ± √(b²-4ac)) / 2a', 'x = c/a', 'x = b² - 4ac'], correctIndex: 1, points: 4 },
      { id: 't2a14', question: 'Factoriza: x² + 5x + 6', options: ['(x+1)(x+6)', '(x+2)(x+3)', '(x+5)(x+1)', '(x-2)(x-3)'], correctIndex: 1, points: 4 },
      { id: 't2a15', question: '¿Qué propiedad dice log(a × b) = log(a) + log(b)?', options: ['Propiedad del producto', 'Propiedad de la suma', 'Regla de la cadena', 'Propiedad conmutativa'], correctIndex: 0, points: 4 },
      { id: 't2a16', question: 'Si a = 3 y b = 4, ¿cuánto es a² + b²?', options: ['20', '24', '25', '27'], correctIndex: 2, points: 4 },
      { id: 't2a17', question: '¿Cuál es el valor de x en x² = 64?', options: ['6', '7', '8', '9'], correctIndex: 2, points: 4 },
      { id: 't2a18', question: '¿Cuál es el número primo más pequeño?', options: ['0', '1', '2', '3'], correctIndex: 2, points: 4 },
      { id: 't2a19', question: '¿Qué representa b en y = mx + b?', options: ['La pendiente', 'La ordenada al origen', 'El vértice', 'La raíz'], correctIndex: 1, points: 4 },
      { id: 't2a20', question: '¿Cuánto es (x³)²?', options: ['x⁵', 'x⁶', 'x⁹', '2x³'], correctIndex: 1, points: 4 },
    ],
  },
  {
    id: 't2-physics',
    name: 'Física: Movimiento y Fuerzas',
    intro: `La mecánica es la rama de la física que estudia el movimiento de los cuerpos y las fuerzas que lo producen. Isaac Newton (1643-1727) formuló las tres leyes fundamentales del movimiento que revolucionaron nuestra comprensión del universo.

La Primera Ley (Ley de Inercia) establece que un cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza externa actúe sobre él. Un libro sobre una mesa no se mueve porque la fuerza normal de la mesa equilibra su peso. En el espacio, sin fricción, un objeto seguiría moviéndose indefinidamente.

La Segunda Ley relaciona fuerza, masa y aceleración: F = ma. La unidad de fuerza es el Newton (N), donde 1 N = 1 kg × 1 m/s². Si empujas un carro de 10 kg con una fuerza neta de 20 N, su aceleración será 2 m/s². El peso es la fuerza gravitatoria: P = mg, donde g ≈ 9.8 m/s² en la superficie terrestre. Un objeto de 70 kg pesa 686 N.

La Tercera Ley dice que por cada acción hay una reacción igual y opuesta. Cuando caminas, tus pies empujan el suelo hacia atrás, y el suelo te empuja hacia adelante. Un cohete expulsa gases hacia abajo, y la reacción lo impulsa hacia arriba.

La velocidad mide el cambio de posición por unidad de tiempo: v = d/t. La aceleración mide el cambio de velocidad: a = (vf - vi) / t. En caída libre, la velocidad aumenta 9.8 m/s cada segundo. La energía cinética de un objeto en movimiento es Ec = ½mv², y la energía potencial gravitatoria es Ep = mgh.

La fricción es una fuerza que se opone al movimiento y depende del coeficiente de fricción (μ) y la fuerza normal: f = μN. Sin fricción, no podríamos caminar ni los coches podrían frenar. La fricción estática (antes de moverse) es mayor que la cinética (en movimiento).`,
    questions: [
      { id: 't2p1', question: '¿Qué ley de Newton se conoce como la ley de inercia?', options: ['Primera', 'Segunda', 'Tercera', 'Ninguna'], correctIndex: 0, points: 4 },
      { id: 't2p2', question: 'Si empujas un carro de 10 kg con 20 N, ¿cuál es su aceleración?', options: ['1 m/s²', '2 m/s²', '5 m/s²', '10 m/s²'], correctIndex: 1, points: 4 },
      { id: 't2p3', question: '¿Cuánto pesa un objeto de 70 kg en la Tierra?', options: ['70 N', '350 N', '686 N', '700 N'], correctIndex: 2, points: 4 },
      { id: 't2p4', question: '¿Qué dice la Tercera Ley de Newton?', options: ['F = ma', 'Ley de inercia', 'Acción y reacción iguales y opuestas', 'Conservación de energía'], correctIndex: 2, points: 4 },
      { id: 't2p5', question: '¿Cuál es la fórmula de la energía cinética?', options: ['E = mgh', 'E = ½mv²', 'E = mc²', 'E = Fd'], correctIndex: 1, points: 4 },
      { id: 't2p6', question: '¿Qué tipo de fricción es mayor, estática o cinética?', options: ['Cinética', 'Estática', 'Son iguales', 'Depende del material'], correctIndex: 1, points: 4 },
      { id: 't2p7', question: '¿Cuál es la unidad de fuerza en el SI?', options: ['Julio', 'Vatio', 'Newton', 'Pascal'], correctIndex: 2, points: 4 },
      { id: 't2p8', question: '¿Cuánto es la aceleración de la gravedad en la Tierra?', options: ['8.9 m/s²', '9.8 m/s²', '10.2 m/s²', '11.0 m/s²'], correctIndex: 1, points: 4 },
      { id: 't2p9', question: '¿Cómo se impulsa un cohete según la Tercera Ley?', options: ['Empuja contra el aire', 'Expulsa gases y la reacción lo impulsa', 'Usa campos magnéticos', 'Reduce su masa'], correctIndex: 1, points: 4 },
      { id: 't2p10', question: '¿Cuál es la fórmula de la velocidad?', options: ['v = at²', 'v = d/t', 'v = F/m', 'v = mgh'], correctIndex: 1, points: 4 },
      { id: 't2p11', question: '¿Cuánto aumenta la velocidad cada segundo en caída libre?', options: ['5 m/s', '9.8 m/s', '15 m/s', '20 m/s'], correctIndex: 1, points: 4 },
      { id: 't2p12', question: '¿Qué fuerza equilibra el peso de un libro sobre una mesa?', options: ['Fricción', 'Tensión', 'Fuerza normal', 'Empuje'], correctIndex: 2, points: 4 },
      { id: 't2p13', question: '¿Cuánto es 1 Newton en unidades base?', options: ['1 kg·m/s', '1 kg·m/s²', '1 kg²/m', '1 m/kg·s²'], correctIndex: 1, points: 4 },
      { id: 't2p14', question: '¿Qué fórmula calcula la energía potencial gravitatoria?', options: ['½mv²', 'mgh', 'Fd', 'mc²'], correctIndex: 1, points: 4 },
      { id: 't2p15', question: '¿De qué depende la fuerza de fricción?', options: ['Solo de la velocidad', 'Del coeficiente de fricción y la fuerza normal', 'De la masa solamente', 'Del área de contacto'], correctIndex: 1, points: 4 },
      { id: 't2p16', question: '¿Qué pasa con un objeto en el espacio sin fuerzas externas?', options: ['Se detiene', 'Sigue moviéndose indefinidamente', 'Acelera', 'Gira'], correctIndex: 1, points: 4 },
      { id: 't2p17', question: '¿Cuál es la fórmula de la aceleración?', options: ['a = v/d', 'a = F×m', 'a = (vf - vi) / t', 'a = d/t²'], correctIndex: 2, points: 4 },
      { id: 't2p18', question: '¿En qué años vivió Newton?', options: ['1543-1627', '1643-1727', '1743-1827', '1564-1642'], correctIndex: 1, points: 4 },
      { id: 't2p19', question: '¿Por qué podemos caminar gracias a la fricción?', options: ['Nos empuja hacia adelante', 'Empujamos el suelo y la fricción nos impulsa', 'Reduce la gravedad', 'Aumenta nuestra inercia'], correctIndex: 1, points: 4 },
      { id: 't2p20', question: '¿Qué fórmula relaciona peso, masa y gravedad?', options: ['P = m/g', 'P = mg', 'P = m²g', 'P = g/m'], correctIndex: 1, points: 4 },
    ],
  },
];

// ==================== TIER 3 (Sabio) ====================

const TIER_3_THEMES: TestTheme[] = [
  {
    id: 't3-calculus',
    name: 'Introducción al Cálculo',
    intro: `El cálculo, desarrollado independientemente por Isaac Newton y Gottfried Wilhelm Leibniz en el siglo XVII, es el estudio matemático del cambio continuo. Se divide en dos ramas principales: el cálculo diferencial (derivadas) y el cálculo integral (integrales), conectados por el Teorema Fundamental del Cálculo.

La derivada mide la tasa de cambio instantánea de una función. Geométricamente, es la pendiente de la recta tangente a la curva en un punto. La derivada de f(x) se denota como f'(x) o df/dx. Las reglas básicas son: la derivada de xⁿ es nxⁿ⁻¹ (regla de la potencia), la derivada de eˣ es eˣ, la derivada de ln(x) es 1/x, la derivada de sen(x) es cos(x), y la derivada de cos(x) es -sen(x).

Para funciones compuestas se usa la regla de la cadena: si y = f(g(x)), entonces dy/dx = f'(g(x)) · g'(x). Para productos: (fg)' = f'g + fg'. Para cocientes: (f/g)' = (f'g - fg') / g².

La integral es la operación inversa de la derivada. La integral indefinida de f(x) es una función F(x) tal que F'(x) = f(x), más una constante C. La integral de xⁿ es xⁿ⁺¹/(n+1) + C (para n ≠ -1). La integral de 1/x es ln|x| + C. La integral de eˣ es eˣ + C.

La integral definida ∫[a,b] f(x)dx calcula el área bajo la curva entre x = a y x = b. El Teorema Fundamental del Cálculo establece que ∫[a,b] f(x)dx = F(b) - F(a), donde F es cualquier antiderivada de f.

Los puntos críticos de una función ocurren donde f'(x) = 0 o no existe. Si la segunda derivada f''(x) > 0 en un punto crítico, es un mínimo local; si f''(x) < 0, es un máximo local. La segunda derivada también indica la concavidad: cóncava hacia arriba si f'' > 0, cóncava hacia abajo si f'' < 0. Los puntos de inflexión ocurren donde cambia la concavidad.

La serie de Taylor permite aproximar funciones como sumas infinitas de potencias: f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ. La serie de eˣ alrededor de 0 es: 1 + x + x²/2! + x³/3! + ...`,
    questions: [
      { id: 't3c1', question: '¿Cuál es la derivada de x³?', options: ['x²', '2x²', '3x²', '3x³'], correctIndex: 2, points: 6 },
      { id: 't3c2', question: '¿Cuál es la integral de 1/x?', options: ['x²', 'ln|x| + C', '1/x² + C', 'eˣ + C'], correctIndex: 1, points: 6 },
      { id: 't3c3', question: '¿Cuál es la derivada de eˣ?', options: ['xeˣ⁻¹', 'eˣ', 'ln(x)', '1/x'], correctIndex: 1, points: 6 },
      { id: 't3c4', question: '¿Qué representa geométricamente la derivada?', options: ['El área bajo la curva', 'La pendiente de la tangente', 'La longitud del arco', 'El volumen'], correctIndex: 1, points: 6 },
      { id: 't3c5', question: '¿Cuál es la integral de 2x?', options: ['x²', 'x² + C', '2x² + C', 'x + C'], correctIndex: 1, points: 6 },
      { id: 't3c6', question: '¿Qué indica la segunda derivada positiva en un punto crítico?', options: ['Máximo local', 'Mínimo local', 'Punto de inflexión', 'No se puede determinar'], correctIndex: 1, points: 6 },
      { id: 't3c7', question: '¿Cuál es la derivada de sen(x)?', options: ['-sen(x)', 'cos(x)', '-cos(x)', 'tan(x)'], correctIndex: 1, points: 6 },
      { id: 't3c8', question: 'Si f\'(x) = 0 en un punto, ¿qué es ese punto?', options: ['Siempre máximo', 'Siempre mínimo', 'Punto crítico', 'Siempre inflexión'], correctIndex: 2, points: 6 },
      { id: 't3c9', question: '¿Cuál es la serie de Taylor de eˣ alrededor de 0?', options: ['Σ xⁿ/n!', 'Σ xⁿ/n', 'Σ nxⁿ', 'Σ x/n!'], correctIndex: 0, points: 6 },
      { id: 't3c10', question: '¿Qué regla se usa para derivar f(g(x))?', options: ['Producto', 'Cociente', 'Cadena', 'L\'Hôpital'], correctIndex: 2, points: 6 },
      { id: 't3c11', question: '¿Qué es un límite de 1/x cuando x tiende a infinito?', options: ['1', '0', '∞', 'No existe'], correctIndex: 1, points: 6 },
      { id: 't3c12', question: '¿Cuál es la regla del producto para derivadas?', options: ['(fg)\' = f\'g\'', '(fg)\' = f\'g + fg\'', '(fg)\' = f\'+ g\'', '(fg)\' = fg\' - f\'g'], correctIndex: 1, points: 6 },
      { id: 't3c13', question: '¿Qué establece el Teorema Fundamental del Cálculo?', options: ['Toda función es derivable', '∫[a,b] f(x)dx = F(b) - F(a)', 'La integral es siempre positiva', 'f\'\'(x) = 0 implica inflexión'], correctIndex: 1, points: 6 },
      { id: 't3c14', question: '¿Cuál es la derivada de cos(x)?', options: ['sen(x)', '-sen(x)', 'cos(x)', '-cos(x)'], correctIndex: 1, points: 6 },
      { id: 't3c15', question: '¿Cuál es la integral de eˣ?', options: ['xeˣ + C', 'eˣ + C', 'eˣ/x + C', 'ln(eˣ) + C'], correctIndex: 1, points: 6 },
      { id: 't3c16', question: '¿Dónde ocurren los puntos de inflexión?', options: ['Donde f\' = 0', 'Donde cambia la concavidad', 'Donde f = 0', 'Donde f\' es máxima'], correctIndex: 1, points: 6 },
      { id: 't3c17', question: '¿Cuál es la derivada de ln(x)?', options: ['x', 'eˣ', '1/x', 'ln(x)/x'], correctIndex: 2, points: 6 },
      { id: 't3c18', question: '¿Cuántos desarrollaron el cálculo independientemente?', options: ['Uno', 'Dos', 'Tres', 'Cuatro'], correctIndex: 1, points: 6 },
      { id: 't3c19', question: '¿Qué indica concavidad hacia arriba?', options: ['f\'\' < 0', 'f\'\' > 0', 'f\' = 0', 'f = 0'], correctIndex: 1, points: 6 },
      { id: 't3c20', question: '¿Cuál es la integral de xⁿ (n ≠ -1)?', options: ['xⁿ⁺¹ + C', 'xⁿ⁺¹/(n+1) + C', 'nxⁿ⁻¹ + C', 'xⁿ/n + C'], correctIndex: 1, points: 6 },
    ],
  },
  {
    id: 't3-biology',
    name: 'Genética y Biología Molecular',
    intro: `El ADN (ácido desoxirribonucleico) es la molécula que almacena la información genética de todos los seres vivos. Su estructura de doble hélice fue descubierta por James Watson y Francis Crick en 1953, basándose en datos de difracción de rayos X obtenidos por Rosalind Franklin. La doble hélice está formada por dos cadenas de nucleótidos enrolladas entre sí.

Cada nucleótido consta de un grupo fosfato, un azúcar (desoxirribosa en el ADN, ribosa en el ARN) y una base nitrogenada. Las cuatro bases del ADN son Adenina (A), Timina (T), Guanina (G) y Citosina (C). Las bases se emparejan específicamente: A con T (unidas por 2 puentes de hidrógeno) y G con C (unidas por 3 puentes de hidrógeno). Esta complementariedad es fundamental para la replicación.

El proceso de expresión génica tiene dos pasos principales. La transcripción ocurre en el núcleo: la enzima ARN polimerasa lee una cadena de ADN y sintetiza una cadena complementaria de ARN mensajero (ARNm). En el ARN, la Timina se reemplaza por Uracilo (U). La traducción ocurre en los ribosomas del citoplasma: el ARNm se lee en tripletes llamados codones, cada uno codificando un aminoácido específico. Los ARN de transferencia (ARNt) transportan los aminoácidos correspondientes.

El código genético es casi universal: los mismos codones codifican los mismos aminoácidos en casi todos los organismos. El codón AUG codifica metionina y es también la señal de inicio. Los codones UAA, UAG y UGA son señales de parada.

Las enzimas son proteínas catalíticas que aceleran reacciones químicas específicas sin consumirse. La amilasa descompone el almidón, la lipasa actúa sobre las grasas, la proteasa sobre las proteínas y la lactasa sobre la lactosa. Funcionan según el modelo de llave y cerradura: su sitio activo tiene una forma específica que se acopla al sustrato.

La meiosis es el tipo de división celular que produce gametos (óvulos y espermatozoides) con la mitad de cromosomas. A diferencia de la mitosis (que produce 2 células idénticas), la meiosis produce 4 células haploides genéticamente distintas, permitiendo la variabilidad genética mediante el entrecruzamiento cromosómico.`,
    questions: [
      { id: 't3b1', question: '¿Quién obtuvo los datos de rayos X cruciales para descubrir la estructura del ADN?', options: ['Watson', 'Crick', 'Rosalind Franklin', 'Mendel'], correctIndex: 2, points: 6 },
      { id: 't3b2', question: '¿Cuántos puentes de hidrógeno unen Guanina con Citosina?', options: ['1', '2', '3', '4'], correctIndex: 2, points: 6 },
      { id: 't3b3', question: '¿Qué base reemplaza a la Timina en el ARN?', options: ['Adenina', 'Guanina', 'Citosina', 'Uracilo'], correctIndex: 3, points: 6 },
      { id: 't3b4', question: '¿Qué enzima sintetiza ARNm durante la transcripción?', options: ['ADN polimerasa', 'ARN polimerasa', 'Ligasa', 'Helicasa'], correctIndex: 1, points: 6 },
      { id: 't3b5', question: '¿Qué codón funciona como señal de inicio?', options: ['UAA', 'AUG', 'UGA', 'UAG'], correctIndex: 1, points: 6 },
      { id: 't3b6', question: '¿Dónde ocurre la traducción?', options: ['Núcleo', 'Mitocondria', 'Ribosomas del citoplasma', 'Membrana celular'], correctIndex: 2, points: 6 },
      { id: 't3b7', question: '¿Cuántas células produce la meiosis?', options: ['2 diploides', '2 haploides', '4 diploides', '4 haploides'], correctIndex: 3, points: 6 },
      { id: 't3b8', question: '¿Qué enzima descompone las grasas?', options: ['Amilasa', 'Proteasa', 'Lipasa', 'Lactasa'], correctIndex: 2, points: 6 },
      { id: 't3b9', question: '¿Cómo funciona una enzima con su sustrato?', options: ['Por difusión', 'Modelo llave y cerradura', 'Por ósmosis', 'Al azar'], correctIndex: 1, points: 6 },
      { id: 't3b10', question: '¿Qué tipo de azúcar tiene el ADN?', options: ['Ribosa', 'Desoxirribosa', 'Glucosa', 'Fructosa'], correctIndex: 1, points: 6 },
      { id: 't3b11', question: '¿Cuántos pares de bases tiene aproximadamente el genoma humano?', options: ['3 millones', '30 millones', '300 millones', '3 mil millones'], correctIndex: 3, points: 6 },
      { id: 't3b12', question: '¿Qué permite la variabilidad genética en la meiosis?', options: ['La mitosis', 'El entrecruzamiento cromosómico', 'La transcripción', 'La traducción'], correctIndex: 1, points: 6 },
      { id: 't3b13', question: '¿Qué molécula transporta oxígeno en la sangre?', options: ['Insulina', 'Hemoglobina', 'Colesterol', 'Glucosa'], correctIndex: 1, points: 6 },
      { id: 't3b14', question: '¿Qué orgánulo es la central energética de la célula?', options: ['Núcleo', 'Ribosoma', 'Mitocondria', 'Lisosoma'], correctIndex: 2, points: 6 },
      { id: 't3b15', question: '¿Cuáles son los codones de parada?', options: ['AUG, AGU, GAU', 'UAA, UAG, UGA', 'AAA, GGG, CCC', 'ATG, TAG, TAA'], correctIndex: 1, points: 6 },
      { id: 't3b16', question: '¿Qué tipo de célula carece de núcleo?', options: ['Eucariota', 'Procariota', 'Animal', 'Vegetal'], correctIndex: 1, points: 6 },
      { id: 't3b17', question: '¿Con qué base se empareja la Adenina en el ADN?', options: ['Guanina', 'Citosina', 'Timina', 'Uracilo'], correctIndex: 2, points: 6 },
      { id: 't3b18', question: '¿Qué son los codones?', options: ['Proteínas', 'Tripletes de nucleótidos en el ARNm', 'Tipos de enzimas', 'Bases nitrogenadas'], correctIndex: 1, points: 6 },
      { id: 't3b19', question: '¿Qué aminoácido codifica AUG?', options: ['Alanina', 'Leucina', 'Metionina', 'Glicina'], correctIndex: 2, points: 6 },
      { id: 't3b20', question: '¿Cuántos cromosomas tiene el ser humano?', options: ['23', '44', '46', '48'], correctIndex: 2, points: 6 },
    ],
  },
];

// ==================== TIER 4 (Erudito) ====================

const TIER_4_THEMES: TestTheme[] = [
  {
    id: 't4-quantum',
    name: 'Mecánica Cuántica',
    intro: `La mecánica cuántica es la teoría que describe el comportamiento de la materia y la energía a escalas atómicas y subatómicas. A diferencia de la física clásica, donde los objetos tienen posiciones y velocidades definidas, en mecánica cuántica las partículas se describen mediante funciones de onda que dan probabilidades.

El principio de incertidumbre de Heisenberg (1927) establece que no se puede conocer simultáneamente la posición y el momento de una partícula con precisión arbitraria: Δx·Δp ≥ ℏ/2, donde ℏ es la constante de Planck reducida. Esto no es una limitación tecnológica sino una propiedad fundamental de la naturaleza.

La ecuación de Schrödinger es la ecuación fundamental: iℏ ∂ψ/∂t = Ĥψ, donde ψ es la función de onda y Ĥ es el operador hamiltoniano. La función de onda colapsa al realizar una medición, dando un resultado definido. El famoso experimento mental del gato de Schrödinger ilustra la paradoja de la superposición a escala macroscópica.

El principio de exclusión de Pauli establece que dos fermiones idénticos no pueden ocupar el mismo estado cuántico simultáneamente. Esto explica la estructura electrónica de los átomos y por qué los electrones se organizan en capas. Los bosones (como fotones) no siguen esta restricción y pueden ocupar el mismo estado.

El Modelo Estándar clasifica las partículas fundamentales: seis quarks (up, down, charm, strange, top, bottom), seis leptones (electrón, muón, tau y sus neutrinos), y los bosones mediadores de fuerzas (fotón para la electromagnética, W y Z para la débil, gluones para la fuerte). El bosón de Higgs, descubierto en 2012 en el CERN, explica el mecanismo por el cual las partículas adquieren masa.

El entrelazamiento cuántico es un fenómeno donde dos partículas quedan correlacionadas de tal manera que medir el estado de una determina instantáneamente el estado de la otra, independientemente de la distancia. Einstein lo llamó "acción fantasmagórica a distancia". El experimento de la doble rendija demuestra la dualidad onda-partícula: partículas individuales crean patrones de interferencia.`,
    questions: [
      { id: 't4q1', question: '¿Qué establece el principio de incertidumbre de Heisenberg?', options: ['Que todo es relativo', 'Que no se puede conocer posición y momento simultáneamente con precisión arbitraria', 'Que la energía se conserva', 'Que la velocidad de la luz es constante'], correctIndex: 1, points: 8 },
      { id: 't4q2', question: '¿Qué fenómeno demuestra el experimento de la doble rendija?', options: ['Gravedad cuántica', 'Dualidad onda-partícula', 'Fusión nuclear', 'Efecto Doppler'], correctIndex: 1, points: 8 },
      { id: 't4q3', question: '¿En qué año se descubrió el bosón de Higgs en el CERN?', options: ['2008', '2010', '2012', '2015'], correctIndex: 2, points: 8 },
      { id: 't4q4', question: '¿Qué principio dice que dos fermiones no pueden estar en el mismo estado cuántico?', options: ['Heisenberg', 'Exclusión de Pauli', 'Complementariedad de Bohr', 'Superposición'], correctIndex: 1, points: 8 },
      { id: 't4q5', question: '¿Cuántos quarks hay en el Modelo Estándar?', options: ['3', '4', '6', '8'], correctIndex: 2, points: 8 },
      { id: 't4q6', question: '¿Qué ecuación describe el estado cuántico de una partícula?', options: ['Maxwell', 'Schrödinger', 'Euler', 'Navier-Stokes'], correctIndex: 1, points: 8 },
      { id: 't4q7', question: '¿Cómo llamó Einstein al entrelazamiento cuántico?', options: ['Efecto mariposa', 'Acción fantasmagórica a distancia', 'Paradoja temporal', 'Dualidad cuántica'], correctIndex: 1, points: 8 },
      { id: 't4q8', question: '¿Qué fuerza media el gluón?', options: ['Electromagnética', 'Gravitatoria', 'Nuclear fuerte', 'Nuclear débil'], correctIndex: 2, points: 8 },
      { id: 't4q9', question: '¿Qué partícula media la fuerza electromagnética?', options: ['Gluón', 'Bosón W', 'Fotón', 'Gravitón'], correctIndex: 2, points: 8 },
      { id: 't4q10', question: '¿Qué pasa con la función de onda al medir?', options: ['Se amplifica', 'Colapsa a un resultado definido', 'Se duplica', 'Desaparece'], correctIndex: 1, points: 8 },
      { id: 't4q11', question: '¿Qué es ℏ?', options: ['Constante de Boltzmann', 'Constante de Planck reducida', 'Constante de gravitación', 'Número de Avogadro'], correctIndex: 1, points: 8 },
      { id: 't4q12', question: '¿Los fotones son fermiones o bosones?', options: ['Fermiones', 'Bosones', 'Ambos', 'Ninguno'], correctIndex: 1, points: 8 },
      { id: 't4q13', question: '¿Qué bosones median la fuerza débil?', options: ['Fotones', 'Gluones', 'W y Z', 'Higgs'], correctIndex: 2, points: 8 },
      { id: 't4q14', question: '¿Qué paradoja ilustra la superposición a escala macroscópica?', options: ['Paradoja de los gemelos', 'Gato de Schrödinger', 'Demonio de Maxwell', 'Paradoja EPR'], correctIndex: 1, points: 8 },
      { id: 't4q15', question: '¿Qué explica el bosón de Higgs?', options: ['La gravedad', 'Cómo las partículas adquieren masa', 'El entrelazamiento', 'La radiación'], correctIndex: 1, points: 8 },
      { id: 't4q16', question: '¿Qué tipo de partículas son los electrones?', options: ['Quarks', 'Bosones', 'Leptones', 'Hadrones'], correctIndex: 2, points: 8 },
      { id: 't4q17', question: '¿Cuántos leptones hay en el Modelo Estándar?', options: ['3', '4', '6', '8'], correctIndex: 2, points: 8 },
      { id: 't4q18', question: '¿Qué propiedad intrínseca tienen las partículas subatómicas?', options: ['Color', 'Spin', 'Sabor clásico', 'Temperatura'], correctIndex: 1, points: 8 },
      { id: 't4q19', question: '¿El principio de incertidumbre es una limitación tecnológica?', options: ['Sí', 'No, es una propiedad fundamental de la naturaleza', 'Depende del instrumento', 'Solo aplica a fotones'], correctIndex: 1, points: 8 },
      { id: 't4q20', question: '¿Por qué los electrones se organizan en capas atómicas?', options: ['Por la gravedad', 'Por el principio de exclusión de Pauli', 'Por la temperatura', 'Al azar'], correctIndex: 1, points: 8 },
    ],
  },
];

// ==================== TIER 5 (Archimago) ====================

const TIER_5_THEMES: TestTheme[] = [
  {
    id: 't5-theoretical',
    name: 'Física Teórica y Matemática Pura',
    intro: `La frontera del conocimiento humano se encuentra en la intersección de la física teórica y la matemática abstracta. La relatividad general de Einstein (1915) describe la gravedad como la curvatura del espacio-tiempo causada por la masa y la energía, codificada en las ecuaciones de campo: Gμν + Λgμν = (8πG/c⁴)Tμν, donde Gμν es el tensor de Einstein, Λ la constante cosmológica y Tμν el tensor de energía-momento.

Los agujeros negros son regiones donde la curvatura es tan extrema que nada puede escapar más allá del horizonte de eventos. La entropía de Bekenstein-Hawking establece que la entropía de un agujero negro es proporcional al área de su horizonte, no a su volumen: S = kA/(4ℓ²_P), donde ℓ_P es la longitud de Planck. Hawking demostró que los agujeros negros emiten radiación térmica, lo que plantea la paradoja de la información.

La teoría de cuerdas propone que las partículas fundamentales no son puntos sino cuerdas vibrantes unidimensionales. Las diferentes modos de vibración corresponden a diferentes partículas. La teoría requiere dimensiones extra: la teoría de supercuerdas necesita 10 dimensiones y la M-theory 11. La correspondencia AdS/CFT, propuesta por Juan Maldacena en 1997, sugiere una equivalencia holográfica entre una teoría gravitatoria en un espacio Anti-de Sitter y una teoría cuántica de campos conforme en su frontera.

En matemática pura, la conjetura de Riemann (1859) sobre los ceros no triviales de la función zeta ζ(s) = Σ 1/nˢ sigue sin resolver. Afirma que todos los ceros no triviales tienen parte real 1/2. La topología estudia propiedades preservadas bajo deformaciones continuas: la característica de Euler de una esfera es 2, de un toro es 0. Los grupos de Lie son variedades diferenciables con estructura de grupo, esenciales en física de partículas.

La complejidad computacional clasifica problemas: P son los solubles en tiempo polinomial, NP los verificables en tiempo polinomial. El problema P vs NP (¿son iguales?) es uno de los siete Problemas del Milenio. La cardinalidad de los números reales es 2^ℵ₀ (hipótesis del continuo de Cantor: ¿es igual a ℵ₁?). El teorema de incompletitud de Gödel demuestra que en todo sistema formal consistente suficientemente potente existen verdades indemostrables.`,
    questions: [
      { id: 't5t1', question: '¿Qué describe el tensor de Einstein Gμν?', options: ['Energía', 'Curvatura del espacio-tiempo', 'Velocidad de la luz', 'Momento angular'], correctIndex: 1, points: 10 },
      { id: 't5t2', question: '¿A qué es proporcional la entropía de un agujero negro según Bekenstein-Hawking?', options: ['Su masa', 'Su volumen', 'El área de su horizonte', 'Su temperatura'], correctIndex: 2, points: 10 },
      { id: 't5t3', question: '¿Cuántas dimensiones requiere la M-theory?', options: ['4', '10', '11', '26'], correctIndex: 2, points: 10 },
      { id: 't5t4', question: '¿Quién propuso la correspondencia AdS/CFT?', options: ['Hawking', 'Witten', 'Maldacena', 'Penrose'], correctIndex: 2, points: 10 },
      { id: 't5t5', question: '¿Qué afirma la conjetura de Riemann?', options: ['Todo primo es impar', 'Los ceros no triviales de ζ(s) tienen parte real 1/2', 'P = NP', 'El universo es finito'], correctIndex: 1, points: 10 },
      { id: 't5t6', question: '¿Qué demuestra el teorema de incompletitud de Gödel?', options: ['Que las matemáticas son completas', 'Que existen verdades indemostrables en sistemas formales consistentes', 'Que todo es decidible', 'Que P ≠ NP'], correctIndex: 1, points: 10 },
      { id: 't5t7', question: '¿Cuál es la cardinalidad de los números reales?', options: ['ℵ₀', 'ℵ₁', '2^ℵ₀', 'ℵ₂'], correctIndex: 2, points: 10 },
      { id: 't5t8', question: '¿Cuál es la característica de Euler de un toro?', options: ['-2', '-1', '0', '2'], correctIndex: 2, points: 10 },
      { id: 't5t9', question: '¿Qué transformación preserva la métrica de Minkowski?', options: ['Galileana', 'Lorentz', 'Fourier', 'Laplace'], correctIndex: 1, points: 10 },
      { id: 't5t10', question: '¿Qué paradoja plantea la radiación de Hawking?', options: ['Paradoja EPR', 'Paradoja de la información', 'Paradoja de los gemelos', 'Paradoja de Zenón'], correctIndex: 1, points: 10 },
      { id: 't5t11', question: '¿Qué es un tensor de Riemann?', options: ['Medida de curvatura del espacio-tiempo', 'Vector de momento', 'Escalar de energía', 'Campo electromagnético'], correctIndex: 0, points: 10 },
      { id: 't5t12', question: '¿Qué establece el teorema de No-Clonación cuántica?', options: ['Se pueden copiar estados', 'No se puede copiar un estado cuántico desconocido', 'Los qubits son clásicos', 'La decoherencia es reversible'], correctIndex: 1, points: 10 },
      { id: 't5t13', question: '¿Qué es Λ en las ecuaciones de Einstein?', options: ['Longitud de Planck', 'Constante cosmológica', 'Constante de acoplamiento', 'Tensor de Ricci'], correctIndex: 1, points: 10 },
      { id: 't5t14', question: '¿Qué son los grupos de Lie?', options: ['Conjuntos finitos', 'Variedades diferenciables con estructura de grupo', 'Espacios vectoriales', 'Anillos conmutativos'], correctIndex: 1, points: 10 },
      { id: 't5t15', question: '¿Cuál es la clase de complejidad de problemas verificables en tiempo polinomial?', options: ['P', 'NP', 'PSPACE', 'EXP'], correctIndex: 1, points: 10 },
      { id: 't5t16', question: '¿Qué propone la teoría de cuerdas sobre las partículas?', options: ['Son puntos', 'Son cuerdas vibrantes unidimensionales', 'Son esferas', 'Son campos'], correctIndex: 1, points: 10 },
      { id: 't5t17', question: '¿Qué es la correspondencia holográfica?', options: ['Un tipo de holograma', 'Equivalencia entre gravedad y teoría de campos en la frontera', 'Un efecto óptico', 'Un tipo de simetría'], correctIndex: 1, points: 10 },
      { id: 't5t18', question: '¿En qué año formuló Einstein la relatividad general?', options: ['1905', '1912', '1915', '1920'], correctIndex: 2, points: 10 },
      { id: 't5t19', question: '¿Qué es la hipótesis del continuo?', options: ['Que el espacio es continuo', 'Que 2^ℵ₀ = ℵ₁', 'Que existe un continuo de universos', 'Que el tiempo es discreto'], correctIndex: 1, points: 10 },
      { id: 't5t20', question: '¿Cuántos Problemas del Milenio hay?', options: ['5', '6', '7', '10'], correctIndex: 2, points: 10 },
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
  
  // Variable question count: between 15 and 20
  const questionCount = 15 + Math.floor(Math.random() * 6); // 15, 16, 17, 18, 19, or 20
  
  // If not enough available questions in this theme, try another theme
  if (available.length < questionCount) {
    for (const t of themes) {
      const avail = t.questions.filter(q => !answeredCorrectly.includes(q.id));
      if (avail.length >= questionCount) {
        const shuffled = [...avail].sort(() => Math.random() - 0.5);
        return { theme: t, questions: shuffled.slice(0, questionCount) };
      }
    }
    // Fallback: use all available from any theme in this tier
    const allAvailable = themes.flatMap(t => t.questions.filter(q => !answeredCorrectly.includes(q.id)));
    const shuffled = [...allAvailable].sort(() => Math.random() - 0.5);
    const count = Math.min(questionCount, shuffled.length);
    return { theme, questions: shuffled.slice(0, Math.max(count, 1)) };
  }
  
  // Pick random questions
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return { theme, questions: shuffled.slice(0, questionCount) };
}

export function getTierFromPoints(intPoints: number): number {
  if (intPoints >= 200) return 5;
  if (intPoints >= 100) return 4;
  if (intPoints >= 50) return 3;
  if (intPoints >= 25) return 2;
  if (intPoints >= 10) return 1;
  return 0;
}

export function evaluateTest(questions: TestQuestion[], answers: number[]): { score: number; perfect: boolean; passed: boolean; totalPoints: number } {
  let correct = 0;
  let totalPoints = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) {
      correct++;
      totalPoints += questions[i].points;
    }
  }
  const ratio = questions.length > 0 ? correct / questions.length : 0;
  return {
    score: correct,
    perfect: correct === questions.length,
    passed: ratio >= 0.7,
    totalPoints,
  };
}
