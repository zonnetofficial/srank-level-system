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

  useEffect(() => {
    const now = new Date().getTime();
    const last = new Date(state.lastSavedTime).getTime();
    if (now < last - 60000) setTimeWarning(true);
  }, []);

  useEffect(() => { saveState(state); }, [state]);

  const today = getToday();
  const todayQuest = state.questLog.find(q => q.date === today);
  const restDay = !todayQuest && isRestDay(state.questLog);

  // Reset daily INT counters if date changed
  useEffect(() => {
    const s = state as any;
    if (s.intTestsDate && s.intTestsDate !== today) {
      setState(prev => ({ ...prev, intTestsToday: 0, intPerfectsToday: 0, intTestsDate: today } as any));
    }
  }, [today]);

  const completeExercise = useCallback((exerciseIndex: number) => {
    setState(prev => {
      const quest = prev.questLog.find(q => q.date === today);
      if (!quest || quest.status !== 'pending' || !quest.exercises) return prev;
      const newExercises = quest.exercises.map((e, i) =>
        i === exerciseIndex ? { ...e, completed: true } : e
      );
      const newLog = prev.questLog.map(q =>
        q.date === today ? { ...q, exercises: newExercises } : q
      );
      return { ...prev, questLog: newLog };
    });
  }, [today]);

  const completeRun = useCallback(() => {
    setState(prev => {
      const newLog = prev.questLog.map(q =>
        q.date === today ? { ...q, runCompleted: true } : q
      );
      return { ...prev, questLog: newLog };
    });
  }, [today]);

  const completeQuest = useCallback(() => {
    setState(prev => {
      const quest = prev.questLog.find(q => q.date === today);
      if (!quest || quest.status !== 'pending') return prev;
      // Check all exercises and run complete
      if (!quest.exercises?.every(e => e.completed)) return prev;
      if (!quest.runCompleted) return prev;

      const xpGain = getQuestXP(prev.level);
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = xpForLevel(newLevel);
      }

      const newTitles = prev.classTitles.map(t => ({
        ...t,
        obtained: t.obtained || newLevel >= t.requiredLevel,
      }));

      const newStreak = prev.currentStreak + 1;
      const newCompleted = prev.totalCompleted + 1;

      const newStats = { ...prev.stats };
      const newPoints = { ...prev.statPoints };

      if (newCompleted % 3 === 0) { newStats.end++; newPoints.end++; }
      if (newCompleted % 4 === 0) { newStats.agi++; newPoints.agi++; }
      if (newStreak % 5 === 0) { newStats.int++; newPoints.int++; }

      const nonRest = [...prev.questLog.filter(q => q.status !== 'rest'), { date: today, status: 'completed' as QuestStatus }];
      const last7 = nonRest.slice(-7);
      if (last7.length >= 7) {
        const fails = last7.filter(q => q.status === 'failed').length;
        if (fails <= 2 && newCompleted % 7 === 0) {
          newStats.str++; newPoints.str++;
          newStats.vit++; newPoints.vit++;
        }
      }

      const newExercises = getNextExercises(prev.exerciseProgression);
      const newRunProg = prev.runMode === 'time'
        ? Math.min(prev.runProgression + 1, 60)
        : prev.runProgression;
      const newRunMode = prev.runMode === 'time' && newRunProg >= 60 ? 'distance' : prev.runMode;

      const newLog = prev.questLog.map(q =>
        q.date === today
          ? { ...q, status: 'completed' as QuestStatus, exercises: q.exercises?.map(e => ({ ...e, completed: true })) }
          : q
      );

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
          runCompleted: false,
        });
      }
      return { ...prev, questLog: newLog };
    });
  }, [today, restDay]);

  const isSkillAvailable = useCallback((stat: StatKey): boolean => {
    const cooldown = state.skillCooldowns[stat];
    const currentWeekStart = getWeekStart(today);
    const weeklyUses = cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0;

    if (stat === 'int') {
      const intCooldown = (state as any).intTestCooldown as string | null;
      if (intCooldown) {
        const cooldownDate = parseLocalDate(intCooldown);
        const todayDate = parseLocalDate(today);
        if (todayDate < cooldownDate) return false;
      }
      // Check max 6 tests per day
      const testsToday = (state as any).intTestsToday || 0;
      const testsDate = (state as any).intTestsDate;
      if (testsDate === today && testsToday >= 6) return false;
      // Check if last non-perfect test was today (blocks further tests)
      return cooldown.lastUsed !== today;
    }
    // STR & END: every 4 days, 1 per day
    if (stat === 'str' || stat === 'end') {
      if (cooldown.lastUsed === today) return false;
      if (!cooldown.lastUsed) return true;
      const last = parseLocalDate(cooldown.lastUsed);
      const now = parseLocalDate(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 4;
    }
    // AGI: 3 times per week, max 1 per day
    if (stat === 'agi') {
      if (cooldown.lastUsed === today) return false;
      return weeklyUses < 3;
    }
    // VIT: 4 times per week, max 1 per day
    if (stat === 'vit') {
      if (cooldown.lastUsed === today) return false;
      return weeklyUses < 4;
    }
    return false;
  }, [state.skillCooldowns, today, (state as any).intTestCooldown, (state as any).intTestsToday, (state as any).intTestsDate]);

  const completeSkillTask = useCallback((stat: StatKey, points: number) => {
    setState(prev => {
      const currentWeekStart = getWeekStart(today);
      const cooldown = prev.skillCooldowns[stat];
      const weeklyUses = cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0;

      if (cooldown.lastUsed === today) return prev;
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

  const completeIntTest = useCallback((points: number, failed: boolean, perfectCount: number, newCorrectIds: string[]) => {
    setState(prev => {
      const newStats = { ...prev.stats, int: prev.stats.int + points };
      const newPoints = { ...prev.statPoints, int: prev.statPoints.int + points };
      const currentWeekStart = getWeekStart(today);
      const cooldown = prev.skillCooldowns.int;

      let intTestCooldown: string | null = (prev as any).intTestCooldown || null;
      if (failed) {
        const d = parseLocalDate(today);
        d.setDate(d.getDate() + 2);
        intTestCooldown = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      // Track answered correctly
      const prevCorrect: string[] = (prev as any).answeredCorrectly || [];
      const mergedCorrect = [...new Set([...prevCorrect, ...newCorrectIds])];

      const prevTestsToday = ((prev as any).intTestsDate === today) ? ((prev as any).intTestsToday || 0) : 0;
      const newTestsToday = prevTestsToday + 1;

      // If perfect and under limit, allow another test (don't set lastUsed to today)
      // If not perfect or failed, block for today
      const canContinue = !failed && perfectCount > 0 && newTestsToday < 6;

      const newCooldowns = {
        ...prev.skillCooldowns,
        int: {
          ...cooldown,
          lastUsed: canContinue ? null : today,
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
        intTestsToday: newTestsToday,
        intTestsDate: today,
        answeredCorrectly: mergedCorrect,
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
    completeExercise,
    completeRun,
    isSkillAvailable,
    dismissTimeWarning,
    resetGame,
  };
}
