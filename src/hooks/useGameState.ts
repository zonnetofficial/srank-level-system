import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  createInitialState,
  getToday,
  xpForLevel,
  getQuestXP,
  getNextExercises,
  isRestDay,
  QuestStatus,
  DailyQuestLog,
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

  const completeSkillTask = useCallback((stat: keyof GameState['stats'], points: number) => {
    setState(prev => {
      const newStats = { ...prev.stats, [stat]: prev.stats[stat] + points };
      const newPoints = { ...prev.statPoints, [stat]: prev.statPoints[stat] + points };
      return { ...prev, stats: newStats, statPoints: newPoints };
    });
  }, []);

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
    dismissTimeWarning,
    resetGame,
  };
}
