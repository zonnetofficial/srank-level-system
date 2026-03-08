import { getToday, parseLocalDate, formatLocalDate } from './gameData';

export type MiniGameType = 'memory' | 'reaction' | 'math';

export interface MandatoryMission {
  id: string;
  date: string; // YYYY-MM-DD
  type: MiniGameType;
  title: string;
  description: string;
  icon: string;
  difficulty: number; // 1-3 scales with level
  status: 'active' | 'completed' | 'failed';
  rewardRarity: ItemRarity;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface MissionSchedule {
  lastScheduleCheck: string; // YYYY-MM-DD
  periodStart: string; // YYYY-MM-DD (start of 2-week period)
  missionsThisPeriod: number;
  maxThisPeriod: number; // 1-3 random
  missions: MandatoryMission[];
}

const MISSION_TEMPLATES: { type: MiniGameType; title: string; description: string; icon: string }[] = [
  { type: 'memory', title: 'Prueba de Memoria', description: 'Encuentra todos los pares antes de que se agote el tiempo', icon: '🧩' },
  { type: 'reaction', title: 'Reflejos Mortales', description: 'Reacciona lo más rápido posible cuando aparezca la señal', icon: '⚡' },
  { type: 'math', title: 'Cálculo Veloz', description: 'Resuelve operaciones matemáticas contra reloj', icon: '🔢' },
];

// Rarity drop rates based on difficulty
const RARITY_WEIGHTS: Record<number, Record<ItemRarity, number>> = {
  1: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
  2: { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 },
  3: { common: 15, uncommon: 30, rare: 35, epic: 15, legendary: 5 },
};

export function rollRewardRarity(difficulty: number): ItemRarity {
  const weights = RARITY_WEIGHTS[difficulty] || RARITY_WEIGHTS[1];
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return rarity as ItemRarity;
  }
  return 'common';
}

export function getDifficulty(level: number): number {
  if (level <= 15) return 1;
  if (level <= 40) return 2;
  return 3;
}

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

export function createInitialSchedule(): MissionSchedule {
  const today = getToday();
  return {
    lastScheduleCheck: today,
    periodStart: today,
    missionsThisPeriod: 0,
    maxThisPeriod: Math.floor(Math.random() * 3) + 1,
    missions: [],
  };
}

export function checkAndScheduleMission(
  schedule: MissionSchedule,
  level: number
): MissionSchedule {
  const today = getToday();
  if (schedule.lastScheduleCheck === today) return schedule;

  const todayDate = parseLocalDate(today);
  const periodStart = parseLocalDate(schedule.periodStart);
  const daysSincePeriodStart = Math.floor((todayDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

  let newSchedule = { ...schedule, lastScheduleCheck: today };

  // New 2-week period
  if (daysSincePeriodStart >= 14) {
    newSchedule = {
      ...newSchedule,
      periodStart: today,
      missionsThisPeriod: 0,
      maxThisPeriod: Math.floor(Math.random() * 3) + 1,
    };
  }

  // Already hit max for this period
  if (newSchedule.missionsThisPeriod >= newSchedule.maxThisPeriod) return newSchedule;

  // Already has an active mission today
  const hasActiveToday = newSchedule.missions.some(m => m.date === today && m.status === 'active');
  if (hasActiveToday) return newSchedule;

  // Check for unfailed active missions from past days → mark as failed
  newSchedule.missions = newSchedule.missions.map(m => {
    if (m.status === 'active' && m.date < today) {
      return { ...m, status: 'failed' as const };
    }
    return m;
  });

  // Probability of mission appearing today (spread across remaining days)
  const currentPeriodStart = parseLocalDate(newSchedule.periodStart);
  const daysIntoPeriod = Math.floor((todayDate.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(1, 14 - daysIntoPeriod);
  const missionsRemaining = newSchedule.maxThisPeriod - newSchedule.missionsThisPeriod;
  const probability = missionsRemaining / daysRemaining;

  const rng = seededRandom(today + '-mission-' + newSchedule.periodStart);
  if (rng() < probability) {
    const template = MISSION_TEMPLATES[Math.floor(rng() * MISSION_TEMPLATES.length)];
    const difficulty = getDifficulty(level);
    const rewardRarity = rollRewardRarity(difficulty);

    const mission: MandatoryMission = {
      id: `mission-${today}-${Date.now()}`,
      date: today,
      type: template.type,
      title: template.title,
      description: template.description,
      icon: template.icon,
      difficulty,
      status: 'active',
      rewardRarity,
    };

    newSchedule.missions = [...newSchedule.missions, mission];
    newSchedule.missionsThisPeriod++;
  }

  return newSchedule;
}

export function getActiveMission(schedule: MissionSchedule): MandatoryMission | null {
  const today = getToday();
  return schedule.missions.find(m => m.date === today && m.status === 'active') || null;
}

export function getXPPenalty(currentXp: number): number {
  return Math.floor(currentXp * 0.5);
}
