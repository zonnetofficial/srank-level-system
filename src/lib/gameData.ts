// ==================== TYPES ====================

export type StatKey = 'int' | 'str' | 'agi' | 'vit' | 'end';

export interface PlayerStats {
  int: number;
  str: number;
  agi: number;
  vit: number;
  end: number;
}

export type QuestStatus = 'pending' | 'completed' | 'failed' | 'rest';

export interface DailyQuestLog {
  date: string; // YYYY-MM-DD
  status: QuestStatus;
  runMinutes?: number;
  runDistanceKm?: number;
  runTimeSeconds?: number;
  runCompleted?: boolean;
  exercises?: { name: string; reps: number; completed: boolean }[];
}

export interface SkillTitle {
  name: string;
  requiredPoints: number;
}

export interface ClassTitle {
  name: string;
  requiredLevel: number;
  icon: string;
  obtained: boolean;
}

export interface SkillCooldown {
  stat: StatKey;
  lastUsed: string | null; // YYYY-MM-DD
  usesThisWeek: number;
  weekStart: string; // YYYY-MM-DD (Monday)
}

export interface GameState {
  level: number;
  xp: number;
  xpToNext: number;
  stats: PlayerStats;
  statPoints: PlayerStats; // accumulated points for skill titles
  statBank: PlayerStats; // unassigned stat points waiting for manual assignment
  questLog: DailyQuestLog[];
  classTitles: ClassTitle[];
  lastSavedTime: string; // ISO timestamp
  currentStreak: number;
  totalCompleted: number;
  totalFailed: number;
  skillCooldowns: Record<StatKey, SkillCooldown>;
  runProgression: number; // current run minutes or distance mode
  runMode: 'time' | 'distance'; // time = minutes, distance = km
  exerciseProgression: { name: string; reps: number }[];
  personalRecords: {
    longestStreak: number;
    fastestRun?: number; // seconds for 5km
    maxLevel: number;
  };
  pendingPunishments: number;
  lastCheckedDate: string; // YYYY-MM-DD
  classChangeProgress: Record<string, StatKey[]>; // className -> completed stat tasks
}

// ==================== CONSTANTS ====================

export const STAT_LABELS: Record<StatKey, string> = {
  int: 'Inteligencia',
  str: 'Fuerza',
  agi: 'Agilidad',
  vit: 'Vitalidad',
  end: 'Resistencia',
};

export const STAT_ICONS: Record<StatKey, string> = {
  int: '🧠',
  str: '💪',
  agi: '⚡',
  vit: '❤️',
  end: '🛡️',
};

export const SKILL_TITLES: Record<StatKey, SkillTitle[]> = {
  int: [
    { name: 'Novato', requiredPoints: 0 },
    { name: 'Aprendiz', requiredPoints: 10 },
    { name: 'Estudioso', requiredPoints: 25 },
    { name: 'Sabio', requiredPoints: 50 },
    { name: 'Erudito', requiredPoints: 100 },
    { name: 'Archimago', requiredPoints: 200 },
  ],
  str: [
    { name: 'Novato', requiredPoints: 0 },
    { name: 'Aprendiz', requiredPoints: 10 },
    { name: 'Guerrero', requiredPoints: 25 },
    { name: 'Titán', requiredPoints: 50 },
    { name: 'Campeón', requiredPoints: 100 },
    { name: 'Berserker', requiredPoints: 200 },
  ],
  agi: [
    { name: 'Novato', requiredPoints: 0 },
    { name: 'Ágil', requiredPoints: 10 },
    { name: 'Veloz', requiredPoints: 25 },
    { name: 'Relámpago', requiredPoints: 50 },
    { name: 'Fantasma', requiredPoints: 100 },
    { name: 'Asesino', requiredPoints: 200 },
  ],
  vit: [
    { name: 'Novato', requiredPoints: 0 },
    { name: 'Vital', requiredPoints: 10 },
    { name: 'Sanador', requiredPoints: 25 },
    { name: 'Monje', requiredPoints: 50 },
    { name: 'Iluminado', requiredPoints: 100 },
    { name: 'Inmortal', requiredPoints: 200 },
  ],
  end: [
    { name: 'Novato', requiredPoints: 0 },
    { name: 'Firme', requiredPoints: 10 },
    { name: 'Resistente', requiredPoints: 25 },
    { name: 'Inquebrantable', requiredPoints: 50 },
    { name: 'Fortaleza', requiredPoints: 100 },
    { name: 'Invencible', requiredPoints: 200 },
  ],
};

export const CLASS_TITLES: ClassTitle[] = [
  { name: 'Aventurero', requiredLevel: 1, icon: '🗡️', obtained: true },
  { name: 'Guerrero', requiredLevel: 5, icon: '⚔️', obtained: false },
  { name: 'Explorador', requiredLevel: 10, icon: '🧭', obtained: false },
  { name: 'Monje', requiredLevel: 15, icon: '🧘', obtained: false },
  { name: 'Asesino', requiredLevel: 25, icon: '🗡️', obtained: false },
  { name: 'Nigromante', requiredLevel: 35, icon: '💀', obtained: false },
  { name: 'Campeón', requiredLevel: 50, icon: '👑', obtained: false },
  { name: 'Leyenda', requiredLevel: 75, icon: '🌟', obtained: false },
  { name: 'Dios', requiredLevel: 100, icon: '⚡', obtained: false },
];

const BASE_EXERCISES = [
  { name: 'Abdominales', reps: 10 },
  { name: 'Sentadillas', reps: 10 },
  { name: 'Lagartijas', reps: 10 },
];

const EXTRA_EXERCISES = [
  'Burpees', 'Plancha (seg)', 'Zancadas', 'Fondos', 'Mountain Climbers',
  'Saltos de tijera', 'Peso muerto', 'Press militar',
];

// ==================== HELPERS ====================

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getToday(): string {
  return formatLocalDate(new Date());
}

export function getWeekStart(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return formatLocalDate(monday);
}

export function xpForLevel(level: number): number {
  return Math.floor(20 + 10 * level);
}

export function getSkillTitle(stat: StatKey, points: number): SkillTitle {
  const titles = SKILL_TITLES[stat];
  let current = titles[0];
  for (const t of titles) {
    if (points >= t.requiredPoints) current = t;
    else break;
  }
  return current;
}

export function getNextSkillTitle(stat: StatKey, points: number): SkillTitle | null {
  const titles = SKILL_TITLES[stat];
  for (const t of titles) {
    if (points < t.requiredPoints) return t;
  }
  return null;
}

export function getClassTitle(level: number, titles: ClassTitle[]): ClassTitle {
  let current = titles[0];
  for (const t of titles) {
    if (t.obtained) current = t;
  }
  return current;
}

export function getNextClassTitle(level: number, titles: ClassTitle[]): ClassTitle | null {
  for (const t of titles) {
    if (!t.obtained) return t;
  }
  return null;
}

export function isRestDay(questLog: DailyQuestLog[]): boolean {
  const recent = questLog.slice(-5);
  if (recent.length >= 5 && recent.every(q => q.status === 'completed')) return true;
  const today = new Date();
  return today.getDay() === 0 || today.getDay() === 4; // Sunday or Thursday
}

// ==================== INITIAL STATE ====================

export function createInitialState(): GameState {
  return {
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    stats: { int: 1, str: 1, agi: 1, vit: 1, end: 1 },
    statPoints: { int: 0, str: 0, agi: 0, vit: 0, end: 0 },
    questLog: [],
    classTitles: CLASS_TITLES.map(t => ({ ...t, obtained: t.requiredLevel <= 1 })),
    lastSavedTime: new Date().toISOString(),
    currentStreak: 0,
    totalCompleted: 0,
    totalFailed: 0,
    skillCooldowns: {
      int: { stat: 'int', lastUsed: null, usesThisWeek: 0, weekStart: getWeekStart(getToday()) },
      str: { stat: 'str', lastUsed: null, usesThisWeek: 0, weekStart: getWeekStart(getToday()) },
      agi: { stat: 'agi', lastUsed: null, usesThisWeek: 0, weekStart: getWeekStart(getToday()) },
      vit: { stat: 'vit', lastUsed: null, usesThisWeek: 0, weekStart: getWeekStart(getToday()) },
      end: { stat: 'end', lastUsed: null, usesThisWeek: 0, weekStart: getWeekStart(getToday()) },
    },
    runProgression: 10,
    runMode: 'time',
    exerciseProgression: [...BASE_EXERCISES],
    personalRecords: { longestStreak: 0, maxLevel: 1 },
    pendingPunishments: 0,
    lastCheckedDate: getToday(),
    classChangeProgress: {},
  };
}

// ==================== STAT CALCULATION ====================

export function calculateStatGains(questLog: DailyQuestLog[]): Partial<PlayerStats> {
  const gains: Partial<PlayerStats> = {};
  const completed = questLog.filter(q => q.status === 'completed');
  const nonRest = questLog.filter(q => q.status !== 'rest');

  // STR: +1 per 3 completed (physical — grows fast)
  if (completed.length > 0 && completed.length % 3 === 0) gains.str = 1;

  // AGI: +1 per 3 completed (physical — grows fast)
  if (completed.length > 0 && completed.length % 3 === 0) gains.agi = 1;

  // END: +1 per 4 completed (moderate)
  if (completed.length > 0 && completed.length % 4 === 0) gains.end = 1;

  // VIT: +1 per 5 completed (moderate, also boosted by rest days)
  if (completed.length > 0 && completed.length % 5 === 0) gains.vit = 1;

  // INT: +1 per 7 consecutive completed (slowest, boosted by skill tasks)
  let streak = 0;
  for (let i = nonRest.length - 1; i >= 0; i--) {
    if (nonRest[i].status === 'completed') streak++;
    else break;
  }
  if (streak > 0 && streak % 7 === 0) gains.int = 1;

  return gains;
}

export function getQuestXP(level: number): number {
  return 15 + Math.floor(level * 3);
}

// ==================== EXERCISE PROGRESSION ====================

export function getNextExercises(current: { name: string; reps: number }[]): { name: string; reps: number }[] {
  const updated = current.map(ex => ({
    ...ex,
    reps: Math.min(ex.reps + 1, 100),
  }));

  // Check if all at 100 → add new exercise
  if (updated.every(ex => ex.reps >= 100)) {
    const usedNames = updated.map(e => e.name);
    const available = EXTRA_EXERCISES.filter(n => !usedNames.includes(n));
    if (available.length > 0) {
      updated.push({ name: available[0], reps: 25 });
    }
  }

  return updated;
}
