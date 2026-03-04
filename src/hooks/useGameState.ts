import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  StatKey,
  createInitialState,
  getToday,
  getWeekStart,
  xpForLevel,
  getQuestXP,
  getNextExercises,
  isRestDay,
  QuestStatus,
  DailyQuestLog,
  parseLocalDate,
} from '@/lib/gameData';

const STORAGE_KEY = 'daily-quest-rpg-state';

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return JSON.parse(raw) as GameState;
  } catch {
    return createInitialState();
  }
}

function saveState(state: GameState) {
  state.lastSavedTime = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);
  const [timeWarning, setTimeWarning] = useState(false);

  // Anti-cheat check
  useEffect(() => {
    const now = new Date().getTime();
    const last = new Date(state.lastSavedTime).getTime();
    if (now < last - 60000) { // 1 min tolerance
      setTimeWarning(true);
    }
  }, []);

  // Save on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = getToday();
  const todayQuest = state.questLog.find(q => q.date === today);
  const restDay = !todayQuest && isRestDay(state.questLog);

  const completeQuest = useCallback(() => {
    setState(prev => {
      if (prev.questLog.find(q => q.date === today && q.status !== 'pending')) return prev;

      const xpGain = getQuestXP(prev.level);
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;

      // Level up check
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = xpForLevel(newLevel);
      }

      // Update class titles
      const newTitles = prev.classTitles.map(t => ({
        ...t,
        obtained: t.obtained || newLevel >= t.requiredLevel,
      }));

      const newStreak = prev.currentStreak + 1;
      const newCompleted = prev.totalCompleted + 1;

      // Stat gains based on streaks
      const newStats = { ...prev.stats };
      const newPoints = { ...prev.statPoints };

      // END: every 3 completed
      if (newCompleted % 3 === 0) { newStats.end++; newPoints.end++; }
      // AGI: every 4 completed
      if (newCompleted % 4 === 0) { newStats.agi++; newPoints.agi++; }
      // INT: every 5 streak
      if (newStreak % 5 === 0) { newStats.int++; newPoints.int++; }
      // STR & VIT: check last 7 non-rest
      const nonRest = [...prev.questLog.filter(q => q.status !== 'rest'), { date: today, status: 'completed' as QuestStatus }];
      const last7 = nonRest.slice(-7);
      if (last7.length >= 7) {
        const fails = last7.filter(q => q.status === 'failed').length;
        if (fails <= 2) {
          if (newCompleted % 7 === 0) {
            newStats.str++; newPoints.str++;
            newStats.vit++; newPoints.vit++;
          }
        }
      }

      // Exercise progression
      const newExercises = getNextExercises(prev.exerciseProgression);
      const newRunProg = prev.runMode === 'time'
        ? Math.min(prev.runProgression + 1, 60)
        : prev.runProgression;
      const newRunMode = prev.runMode === 'time' && newRunProg >= 60 ? 'distance' : prev.runMode;

      // Update quest log
      const existingIdx = prev.questLog.findIndex(q => q.date === today);
      const newLog = [...prev.questLog];
      const questEntry: DailyQuestLog = {
        date: today,
        status: 'completed',
        exercises: newExercises.map(e => ({ ...e, completed: true })),
        runMinutes: newRunMode === 'time' ? newRunProg : undefined,
      };

      if (existingIdx >= 0) {
        newLog[existingIdx] = questEntry;
      } else {
        newLog.push(questEntry);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNext: newXpToNext,
        stats: newStats,
        statPoints: newPoints,
        questLog: newLog,
        classTitles: newTitles,
        currentStreak: newStreak,
        totalCompleted: newCompleted,
        runProgression: newRunProg,
        runMode: newRunMode as 'time' | 'distance',
        exerciseProgression: newExercises,
        personalRecords: {
          ...prev.personalRecords,
          longestStreak: Math.max(prev.personalRecords.longestStreak, newStreak),
          maxLevel: Math.max(prev.personalRecords.maxLevel, newLevel),
        },
      };
    });
  }, [today]);

  const startQuest = useCallback(() => {
    setState(prev => {
      if (prev.questLog.find(q => q.date === today)) return prev;

      const newLog = [...prev.questLog];
      if (restDay) {
        newLog.push({ date: today, status: 'rest' });
      } else {
        newLog.push({
          date: today,
          status: 'pending',
          exercises: prev.exerciseProgression.map(e => ({ ...e, completed: false })),
          runMinutes: prev.runMode === 'time' ? prev.runProgression : undefined,
        });
      }
      return { ...prev, questLog: newLog };
    });
  }, [today, restDay]);

  const isSkillAvailable = useCallback((stat: StatKey): boolean => {
    const cooldown = state.skillCooldowns[stat];
    const currentWeekStart = getWeekStart(today);

    // Reset weekly counter if new week
    const weeklyUses = cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0;

    if (stat === 'int') {
      // INT test: check intTestCooldown in state
      const intCooldown = (state as any).intTestCooldown as string | null;
      if (intCooldown) {
        const cooldownDate = parseLocalDate(intCooldown);
        const todayDate = parseLocalDate(today);
        if (todayDate < cooldownDate) return false;
      }
      // Also check if already used today (passed/failed)
      return cooldown.lastUsed !== today;
    }
    if (stat === 'str' || stat === 'end') {
      // Every 4 days
      if (!cooldown.lastUsed) return true;
      const last = parseLocalDate(cooldown.lastUsed);
      const now = parseLocalDate(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 4;
    }
    if (stat === 'agi') {
      // 3 times per week
      return weeklyUses < 3;
    }
    if (stat === 'vit') {
      // 4 times per week
      return weeklyUses < 4;
    }
    return false;
  }, [state.skillCooldowns, today, (state as any).intTestCooldown]);

  const completeSkillTask = useCallback((stat: StatKey, points: number) => {
    setState(prev => {
      const currentWeekStart = getWeekStart(today);
      const cooldown = prev.skillCooldowns[stat];

      // Reset weekly counter if new week
      const weeklyUses = cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0;

      // Check cooldown
      if (stat === 'int' && cooldown.lastUsed === today) return prev;
      if ((stat === 'str' || stat === 'end') && cooldown.lastUsed) {
        const last = parseLocalDate(cooldown.lastUsed);
        const now = parseLocalDate(today);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 4) return prev;
      }
      if (stat === 'agi' && weeklyUses >= 3) return prev;
      if (stat === 'vit' && weeklyUses >= 4) return prev;

      const newStats = { ...prev.stats, [stat]: prev.stats[stat] + points };
      const newPoints = { ...prev.statPoints, [stat]: prev.statPoints[stat] + points };
      const newCooldowns = {
        ...prev.skillCooldowns,
        [stat]: {
          ...cooldown,
          lastUsed: today,
          usesThisWeek: (cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0) + 1,
          weekStart: currentWeekStart,
        },
      };
      return { ...prev, stats: newStats, statPoints: newPoints, skillCooldowns: newCooldowns };
    });
  }, [today]);

  // INT test: complete with result info
  const completeIntTest = useCallback((points: number, failed: boolean, perfectCount: number) => {
    setState(prev => {
      const newStats = { ...prev.stats, int: prev.stats.int + points };
      const newPoints = { ...prev.statPoints, int: prev.statPoints.int + points };
      const currentWeekStart = getWeekStart(today);
      const cooldown = prev.skillCooldowns.int;

      let intTestCooldown: string | null = null;
      if (failed) {
        // Failed: next test in 2 days
        const d = parseLocalDate(today);
        d.setDate(d.getDate() + 2);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        intTestCooldown = `${year}-${month}-${day}`;
      }

      const newCooldowns = {
        ...prev.skillCooldowns,
        int: {
          ...cooldown,
          lastUsed: perfectCount > 0 ? null : today, // if perfect, allow another today
          usesThisWeek: (cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0) + 1,
          weekStart: currentWeekStart,
        },
      };

      return {
        ...prev,
        stats: newStats,
        statPoints: newPoints,
        skillCooldowns: newCooldowns,
        intTestCooldown: failed ? intTestCooldown : (prev as any).intTestCooldown || null,
        intPerfectsToday: perfectCount,
      } as any;
    });
  }, [today]);

  const dismissTimeWarning = useCallback(() => setTimeWarning(false), []);

  const resetGame = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    saveState(fresh);
  }, []);

  return {
    state,
    today,
    todayQuest,
    restDay,
    timeWarning,
    startQuest,
    completeQuest,
    completeSkillTask,
    completeIntTest,
    isSkillAvailable,
    dismissTimeWarning,
    resetGame,
  };
}
