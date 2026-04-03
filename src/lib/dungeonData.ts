import type { PlayerStats } from './gameData';

// ==================== TYPES ====================

export type DungeonRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type CharacterClass = 'warrior' | 'mage' | 'assassin' | 'monk';

export interface DungeonCharacter {
  name: string;
  className: CharacterClass;
  sprite: string;
  maxHp: number;
  currentHp: number;
  maxStamina: number;
  currentStamina: number;
  lastHpUpdate: string; // ISO timestamp for regen calculation
  createdAt: string;
  dungeonsCleared: number;
}

export interface DungeonRoom {
  id: number;
  type: 'math' | 'memory' | 'reaction' | 'pattern' | 'logic' | 'typing' | 'truefalse';
  narrative: string;
  difficulty: number; // 1-3
  damage: number; // HP lost on fail
  xpReward: number;
  completed: boolean;
}

export interface DungeonRun {
  rank: DungeonRank;
  rooms: DungeonRoom[];
  currentRoom: number;
  startedAt: string;
  status: 'active' | 'completed' | 'fled' | 'dead';
  xpEarned: number;
}

export interface DungeonLoadoutItem {
  inventoryId: string;
  itemId: string;
  name: string;
  icon: string;
  effect_type: string;
  effect_value: number;
  rarity: string;
  quantity: number; // how many of this item are in loadout
}

export interface DungeonState {
  character: DungeonCharacter | null;
  currentRun: DungeonRun | null;
  cooldowns: Partial<Record<DungeonRank, string>>; // rank -> next available ISO date
  totalCleared: number;
  loadout: DungeonLoadoutItem[];
}

export type RewardChoice = 'heal' | 'luckbox';

export interface LuckBoxReward {
  type: 'vanity' | 'potion' | 'multiplier' | 'dp';
  label: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value?: number;
}

// ==================== CONSTANTS ====================

export const CLASS_INFO: Record<CharacterClass, { label: string; icon: string; description: string; bonus: string }> = {
  warrior: { label: 'Guerrero', icon: '⚔️', description: 'Especialista en combate directo', bonus: '+20% HP máximo' },
  mage: { label: 'Mago', icon: '🔮', description: 'Maestro del conocimiento arcano', bonus: '+20% tiempo en desafíos' },
  assassin: { label: 'Asesino', icon: '🗡️', description: 'Ágil y letal en las sombras', bonus: '+20% Stamina' },
  monk: { label: 'Monje', icon: '🧘', description: 'Equilibrio entre cuerpo y mente', bonus: '+50% regeneración HP' },
};

export const CHARACTER_SPRITES: Record<CharacterClass, string[]> = {
  warrior: ['🛡️', '⚔️', '🗡️', '🪓'],
  mage: ['🔮', '🧙', '✨', '📖'],
  assassin: ['🥷', '🗡️', '💀', '🌑'],
  monk: ['🧘', '☯️', '🙏', '🕉️'],
};

export const DUNGEON_RANKS: Record<DungeonRank, {
  label: string;
  color: string;
  rooms: number;
  recommendedLevel: number;
  baseDamage: number;
  baseXp: number;
  cooldownHours: number;
  icon: string;
}> = {
  E: { label: 'Rango E', color: 'text-muted-foreground', rooms: 6, recommendedLevel: 1, baseDamage: 8, baseXp: 10, cooldownHours: 24, icon: '🏚️' },
  D: { label: 'Rango D', color: 'text-stat-agi', rooms: 7, recommendedLevel: 5, baseDamage: 12, baseXp: 18, cooldownHours: 48, icon: '🏰' },
  C: { label: 'Rango C', color: 'text-primary', rooms: 8, recommendedLevel: 15, baseDamage: 18, baseXp: 30, cooldownHours: 72, icon: '⛩️' },
  B: { label: 'Rango B', color: 'text-stat-vit', rooms: 9, recommendedLevel: 25, baseDamage: 25, baseXp: 50, cooldownHours: 120, icon: '🗿' },
  A: { label: 'Rango A', color: 'text-accent', rooms: 10, recommendedLevel: 40, baseDamage: 35, baseXp: 80, cooldownHours: 168, icon: '🌋' },
  S: { label: 'Rango S', color: 'text-destructive', rooms: 12, recommendedLevel: 60, baseDamage: 50, baseXp: 150, cooldownHours: 336, icon: '💀' },
};

const ROOM_NARRATIVES: Record<DungeonRoom['type'], string[]> = {
  math: [
    'Un golem de piedra bloquea el paso. Sus ojos brillan con ecuaciones arcanas.',
    'Runas matemáticas cubren la puerta sellada ante ti.',
    'Un espíritu guardián exige resolver su acertijo numérico.',
    'Cristales flotantes muestran cálculos que debes descifrar.',
    'La trampa del suelo se activa: resuelve o sé aplastado.',
  ],
  memory: [
    'Glifos brillan en las paredes — memoriza el patrón o sufre.',
    'Espectros aparecen y desaparecen. Recuerda sus posiciones.',
    'Un altar con símbolos cambiantes prueba tu memoria.',
    'Las puertas muestran signos fugaces que debes recordar.',
  ],
  reaction: [
    'Flechas envenenadas salen de las paredes — ¡esquiva!',
    'Un guardian ataca con velocidad sobrenatural.',
    'Rocas caen del techo — reacciona o muere.',
    'Rayos arcanos cruzan el corredor en patrones letales.',
  ],
  pattern: [
    'Runas antiguas forman una secuencia en el muro.',
    'Un mecanismo requiere completar la secuencia correcta.',
    'Cristales se iluminan en orden — repite el patrón.',
    'El piso es un tablero con un enigma de secuencias.',
  ],
  logic: [
    'Un acertijo del dragón antiguo espera tu respuesta.',
    'Tres cofres: uno tiene la llave, los otros son trampas.',
    'Un enigma lógico protege el paso al siguiente nivel.',
    'El espíritu del sabio plantea un desafío de razonamiento.',
  ],
};

// ==================== HELPERS ====================

export function calculateCharacterHP(stats: PlayerStats, charClass: CharacterClass): number {
  const base = 50 + stats.vit * 5;
  return charClass === 'warrior' ? Math.floor(base * 1.2) : base;
}

export function calculateCharacterStamina(stats: PlayerStats, charClass: CharacterClass): number {
  const base = stats.agi * 3 + stats.end * 2;
  return charClass === 'assassin' ? Math.floor(base * 1.2) : base;
}

export function getHPRegen(charClass: CharacterClass): number {
  // HP per minute of real time
  return charClass === 'monk' ? 0.15 : 0.1;
}

export function applyHPRegen(character: DungeonCharacter): DungeonCharacter {
  const now = Date.now();
  const last = new Date(character.lastHpUpdate).getTime();
  const minutesPassed = (now - last) / (1000 * 60);
  const regenRate = getHPRegen(character.className);
  const hpRecovered = Math.floor(minutesPassed * regenRate);

  if (hpRecovered <= 0) return character;

  return {
    ...character,
    currentHp: Math.min(character.maxHp, character.currentHp + hpRecovered),
    lastHpUpdate: new Date().toISOString(),
  };
}

export function getEscapeCost(character: DungeonCharacter): number {
  return Math.ceil(character.maxStamina * 0.2);
}

export function getDungeonDifficulty(rank: DungeonRank): number {
  switch (rank) {
    case 'E': return 1;
    case 'D': return 1;
    case 'C': return 2;
    case 'B': return 2;
    case 'A': return 3;
    case 'S': return 3;
  }
}

export function getTimeBonusMultiplier(charClass: CharacterClass): number {
  return charClass === 'mage' ? 1.2 : 1.0;
}

export function getCooldownReduction(playerLevel: number, recommendedLevel: number): number {
  const diff = playerLevel - recommendedLevel;
  if (diff <= 0) return 1.0;
  return Math.max(0.3, 1.0 - diff * 0.02); // min 30% of cooldown
}

export function isDungeonAvailable(rank: DungeonRank, cooldowns: Partial<Record<DungeonRank, string>>): boolean {
  const next = cooldowns[rank];
  if (!next) return true;
  return new Date().toISOString() >= next;
}

export function getCooldownRemaining(rank: DungeonRank, cooldowns: Partial<Record<DungeonRank, string>>): string | null {
  const next = cooldowns[rank];
  if (!next) return null;
  const remaining = new Date(next).getTime() - Date.now();
  if (remaining <= 0) return null;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function generateDungeonRooms(rank: DungeonRank): DungeonRoom[] {
  const config = DUNGEON_RANKS[rank];
  const types: DungeonRoom['type'][] = ['math', 'memory', 'reaction', 'pattern', 'logic'];
  const difficulty = getDungeonDifficulty(rank);
  const rooms: DungeonRoom[] = [];

  for (let i = 0; i < config.rooms; i++) {
    const type = types[i % types.length];
    const narratives = ROOM_NARRATIVES[type];
    const roomDifficulty = Math.min(3, difficulty + (i >= config.rooms - 2 ? 1 : 0)); // last 2 rooms harder
    const damageVariance = 0.8 + Math.random() * 0.4;

    rooms.push({
      id: i,
      type,
      narrative: narratives[Math.floor(Math.random() * narratives.length)],
      difficulty: roomDifficulty,
      damage: Math.floor(config.baseDamage * damageVariance * (1 + i * 0.1)),
      xpReward: Math.floor(config.baseXp * (1 + i * 0.15)),
      completed: false,
    });
  }

  // Shuffle to keep it varied
  for (let i = rooms.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tempType = rooms[i].type;
    const tempNarrative = rooms[i].narrative;
    rooms[i].type = rooms[j].type;
    rooms[i].narrative = rooms[j].narrative;
    rooms[j].type = tempType;
    rooms[j].narrative = tempNarrative;
  }

  return rooms;
}

export function rollLuckBox(rank: DungeonRank): LuckBoxReward {
  const roll = Math.random();
  const rankMultiplier = { E: 1, D: 1.5, C: 2, B: 3, A: 5, S: 10 }[rank];

  // Rarity roll
  let rarity: LuckBoxReward['rarity'];
  if (roll < 0.4) rarity = 'common';
  else if (roll < 0.7) rarity = 'uncommon';
  else if (roll < 0.88) rarity = 'rare';
  else if (roll < 0.96) rarity = 'epic';
  else rarity = 'legendary';

  // Type roll
  const typeRoll = Math.random();
  if (typeRoll < 0.25) {
    return { type: 'dp', label: `${Math.floor(5 * rankMultiplier)} DP`, icon: '💎', rarity, value: Math.floor(5 * rankMultiplier) };
  } else if (typeRoll < 0.5) {
    const potions = [
      { label: 'Poción de Vida', icon: '❤️‍🩹' },
      { label: 'Poción de Stamina', icon: '💨' },
      { label: 'Elixir de Vitalidad', icon: '🧪' },
    ];
    const p = potions[Math.floor(Math.random() * potions.length)];
    return { type: 'potion', label: p.label, icon: p.icon, rarity };
  } else if (typeRoll < 0.75) {
    const multipliers = [
      { label: 'XP x1.5 (1 quest)', icon: '⚡', value: 1.5 },
      { label: 'XP x2 (1 quest)', icon: '🔥', value: 2 },
    ];
    const m = rarity === 'legendary' || rarity === 'epic' ? multipliers[1] : multipliers[0];
    return { type: 'multiplier', label: m.label, icon: m.icon, rarity, value: m.value };
  } else {
    const vanity = [
      { label: 'Marco Dorado', icon: '🖼️' },
      { label: 'Aura Oscura', icon: '🌑' },
      { label: 'Corona de Fuego', icon: '🔥' },
      { label: 'Halo Divino', icon: '😇' },
      { label: 'Marca del Cazador', icon: '🎯' },
    ];
    const v = vanity[Math.floor(Math.random() * vanity.length)];
    return { type: 'vanity', label: v.label, icon: v.icon, rarity };
  }
}

export function createInitialDungeonState(): DungeonState {
  return {
    character: null,
    currentRun: null,
    cooldowns: {},
    totalCleared: 0,
    loadout: [],
  };
}

export function getLoadoutBonuses(loadout: DungeonLoadoutItem[] | undefined | null) {
  if (!Array.isArray(loadout)) return { extraTime: 0, damageReduction: 0, luckBoost: 0, hasRevive: false };
  let extraTime = 0;
  let damageReduction = 0;
  let luckBoost = 0;
  let hasRevive = false;

  for (const item of loadout) {
    const qty = item.quantity || 1;
    switch (item.effect_type) {
      case 'extra_time': extraTime += item.effect_value * qty; break;
      case 'damage_reduction': damageReduction += item.effect_value; break;
      case 'luck_boost': luckBoost += item.effect_value; break;
      case 'revive': hasRevive = true; break;
    }
  }
  // Cap damage reduction at 80%
  damageReduction = Math.min(80, damageReduction);
  return { extraTime, damageReduction, luckBoost, hasRevive };
}

const DUNGEON_STORAGE_KEY = 'dungeon-state';

export function loadDungeonState(): DungeonState {
  try {
    const raw = localStorage.getItem(DUNGEON_STORAGE_KEY);
    if (!raw) return createInitialDungeonState();
    const parsed = JSON.parse(raw) as DungeonState;
    // Apply HP regen on load
    if (parsed.character) {
      parsed.character = applyHPRegen(parsed.character);
    }
    return parsed;
  } catch {
    return createInitialDungeonState();
  }
}

export function saveDungeonState(state: DungeonState) {
  localStorage.setItem(DUNGEON_STORAGE_KEY, JSON.stringify(state));
}

export const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-stat-agi',
  rare: 'text-primary',
  epic: 'text-stat-vit',
  legendary: 'text-accent',
};
