import { useState, useEffect, useCallback, useRef } from 'react';
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
  formatLocalDate,
} from '@/lib/gameData';
import {
  createInitialSchedule,
  checkAndScheduleMission,
  getXPPenalty,
} from '@/lib/mandatoryMissions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'daily-quest-rpg-state';

// Wipe localStorage on first cloud sync migration
const SYNC_VERSION = 'cloud-sync-v1';
if (typeof window !== 'undefined' && localStorage.getItem('sync-version') !== SYNC_VERSION) {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('dungeon-state');
  localStorage.setItem('sync-version', SYNC_VERSION);
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    // Backward compat
    if (parsed.pendingPunishments === undefined) parsed.pendingPunishments = 0;
    if (!parsed.lastCheckedDate) parsed.lastCheckedDate = getToday();
    if (!parsed.classChangeProgress) parsed.classChangeProgress = {};
    if (!parsed.statBank) parsed.statBank = { int: 0, str: 0, agi: 0, vit: 0, end: 0 };
    if (!parsed.missionSchedule) parsed.missionSchedule = createInitialSchedule();
    return parsed;
  } catch {
    return createInitialState();
  }
}

function saveState(state: GameState) {
  state.lastSavedTime = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getObtainedTitleIndex(state: GameState): number {
  let idx = 0;
  for (let i = 0; i < state.classTitles.length; i++) {
    if (state.classTitles[i].obtained) idx = i;
  }
  return idx;
}

function getStatPenalty(state: GameState): number {
  return (getObtainedTitleIndex(state) + 1) * 5;
}

function detectAndApplyPunishments(state: GameState): GameState {
  const today = getToday();
  const lastChecked = state.lastCheckedDate || today;

  if (lastChecked >= today) return { ...state, lastCheckedDate: today };

  const startDate = parseLocalDate(lastChecked);
  startDate.setDate(startDate.getDate() + 1);
  const todayDate = parseLocalDate(today);

  let failedDays = 0;
  const updatedLog = [...state.questLog];
  const currentDate = new Date(startDate);

  while (currentDate < todayDate) {
    const dateStr = formatLocalDate(currentDate);
    const dayOfWeek = currentDate.getDay();
    const isRest = dayOfWeek === 0 || dayOfWeek === 4; // Sunday or Thursday

    if (!isRest) {
      const existing = updatedLog.find(q => q.date === dateStr);
      if (!existing) {
        failedDays++;
        updatedLog.push({ date: dateStr, status: 'failed' });
      } else if (existing.status === 'pending') {
        failedDays++;
        const idx = updatedLog.findIndex(q => q.date === dateStr);
        updatedLog[idx] = { ...existing, status: 'failed' };
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (failedDays === 0) {
    return { ...state, questLog: updatedLog, lastCheckedDate: today };
  }

  const penalty = getStatPenalty(state);
  const totalPenalty = penalty * failedDays;
  // Task-type punishments do NOT accumulate — cap at 1
  const newPendingPunishments = 1;
  const newStats = { ...state.stats };
  const newPoints = { ...state.statPoints };

  for (const key of ['int', 'str', 'agi', 'vit', 'end'] as StatKey[]) {
    newStats[key] = Math.max(1, newStats[key] - totalPenalty);
    newPoints[key] = Math.max(0, newPoints[key] - totalPenalty);
  }

  // Also fail expired mandatory missions
  let missionSchedule = state.missionSchedule;
  if (missionSchedule) {
    let missionXpLoss = 0;
    const updatedMissions = missionSchedule.missions.map(m => {
      if (m.status === 'active' && m.date < today) {
        missionXpLoss += Math.floor(state.xp * 0.5);
        return { ...m, status: 'failed' as const };
      }
      return m;
    });
    missionSchedule = { ...missionSchedule, missions: updatedMissions };
  }

  return {
    ...state,
    stats: newStats,
    statPoints: newPoints,
    questLog: updatedLog,
    currentStreak: 0,
    totalFailed: state.totalFailed + failedDays,
    pendingPunishments: newPendingPunishments,
    lastCheckedDate: today,
    missionSchedule,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    let loaded = loadState();
    // Do NOT detect punishments here — wait for cloud auth to confirm user is logged in
    // Auto-start quest if none exists for today
    const today = getToday();
    if (!loaded.questLog.find(q => q.date === today)) {
      const rest = isRestDay(loaded.questLog);
      const newLog = [...loaded.questLog];
      const isFirstLogin = loaded.questLog.length === 0;
      if (rest) {
        newLog.push({ date: today, status: 'rest' });
        // First-time users on rest day: no free stat points
        if (!isFirstLogin) {
          loaded = {
            ...loaded,
            questLog: newLog,
            statBank: { ...loaded.statBank, int: loaded.statBank.int + 1, vit: loaded.statBank.vit + 1 },
          };
        } else {
          loaded = { ...loaded, questLog: newLog };
        }
      } else {
        newLog.push({
          date: today,
          status: 'pending',
          exercises: loaded.exerciseProgression.map(e => ({ ...e, completed: false })),
          runMinutes: loaded.runMode === 'time' ? loaded.runProgression : undefined,
          runCompleted: false,
        });
        loaded = { ...loaded, questLog: newLog };
      }
    }
    // Schedule mandatory missions
    if (!loaded.missionSchedule) loaded.missionSchedule = createInitialSchedule();
    loaded.missionSchedule = checkAndScheduleMission(loaded.missionSchedule, loaded.level);
    return loaded;
  });
  const [timeWarning, setTimeWarning] = useState(false);

  useEffect(() => {
    const now = new Date().getTime();
    const last = new Date(state.lastSavedTime).getTime();
    if (now < last - 60000) setTimeWarning(true);
  }, []);

  useEffect(() => { saveState(state); }, [state]);

  // ─── Cloud Sync ───
  const { user } = useAuth();
  const cloudLoaded = useRef(false);
  const cloudSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from cloud when user is available
  useEffect(() => {
    if (!user || cloudLoaded.current) return;
    cloudLoaded.current = true;

    supabase
      .from('user_game_state' as any)
      .select('game_state')
      .eq('user_id', user.id)
      .single()
      .then(({ data }: any) => {
        if (data?.game_state && typeof data.game_state === 'object' && data.game_state.level) {
          let cloudState = data.game_state as unknown as GameState;
          if (!cloudState.statBank) cloudState.statBank = { int: 0, str: 0, agi: 0, vit: 0, end: 0 };
          if (!cloudState.classChangeProgress) cloudState.classChangeProgress = {};
          if (!cloudState.missionSchedule) cloudState.missionSchedule = createInitialSchedule();
          if (cloudState.pendingPunishments === undefined) cloudState.pendingPunishments = 0;
          if (!cloudState.lastCheckedDate) cloudState.lastCheckedDate = getToday();
          cloudState = detectAndApplyPunishments(cloudState);
          // Auto-create today's quest if missing (same logic as initial load)
          const todayStr = getToday();
          if (!cloudState.questLog.find(q => q.date === todayStr)) {
            const rest = isRestDay(cloudState.questLog);
            const newLog = [...cloudState.questLog];
            if (rest) {
              newLog.push({ date: todayStr, status: 'rest' });
              cloudState = { ...cloudState, questLog: newLog, statBank: { ...cloudState.statBank, int: cloudState.statBank.int + 1, vit: cloudState.statBank.vit + 1 } };
            } else {
              newLog.push({
                date: todayStr,
                status: 'pending',
                exercises: cloudState.exerciseProgression.map(e => ({ ...e, completed: false })),
                runMinutes: cloudState.runMode === 'time' ? cloudState.runProgression : undefined,
                runCompleted: false,
              });
              cloudState = { ...cloudState, questLog: newLog };
            }
          }
          if (!cloudState.missionSchedule) cloudState.missionSchedule = createInitialSchedule();
          cloudState.missionSchedule = checkAndScheduleMission(cloudState.missionSchedule, cloudState.level);
          setState(cloudState);
          saveState(cloudState);
        } else {
          // No cloud data — detect punishments on local state then upload
          let localState = detectAndApplyPunishments(state);
          setState(localState);
          saveState(localState);
          supabase.rpc('save_game_state' as any, {
            p_game_state: localState as any,
          });
        }
      });
  }, [user?.id]);

  // Debounced cloud save via secure RPC
  useEffect(() => {
    if (!user) return;
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(() => {
      supabase.rpc('save_game_state' as any, {
        p_game_state: state as any,
      }).then(() => {});
    }, 3000);
    return () => { if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current); };
  }, [state, user?.id]);

  const today = getToday();
  const todayQuest = state.questLog.find(q => q.date === today);
  const restDay = todayQuest?.status === 'rest';

  // Reset daily INT counters if date changed
  useEffect(() => {
    const s = state as any;
    if (s.intTestsDate && s.intTestsDate !== today) {
      setState(prev => ({ ...prev, intTestsToday: 0, intPerfectsToday: 0, intTestsDate: today } as any));
    }
  }, [today]);

  // Midnight notification
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const scheduleCheck = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msToMidnight = midnight.getTime() - now.getTime();

      return setTimeout(() => {
        const quest = state.questLog.find(q => q.date === getToday());
        if (!quest || quest.status === 'pending' || !quest) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚔️ Daily Quest', {
              body: 'Misión diaria fallida. Tu castigo te espera.',
              icon: '/favicon.ico',
            });
          }
        }
        // Schedule next check
        scheduleCheck();
      }, msToMidnight + 1000);
    };

    const timerId = scheduleCheck();
    return () => clearTimeout(timerId);
  }, []);

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

  const levelRef = useRef(state.level);

  const completeQuest = useCallback(() => {
    setState(prev => {
      const quest = prev.questLog.find(q => q.date === today);
      if (!quest || quest.status !== 'pending') return prev;
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

      // Don't auto-obtain: class titles require completing a challenge
      const newTitles = prev.classTitles;

      const newStreak = prev.currentStreak + 1;
      const newCompleted = prev.totalCompleted + 1;

      const newStats = { ...prev.stats };
      const newPoints = { ...prev.statPoints };
      const newBank = { ...prev.statBank };

      // Stat gains go to bank (not auto-assigned)
      if (newCompleted % 3 === 0) { newBank.str++; }
      if (newCompleted % 3 === 0) { newBank.agi++; }
      if (newCompleted % 4 === 0) { newBank.end++; }
      if (newCompleted % 5 === 0) { newBank.vit++; }
      if (newStreak % 7 === 0) { newBank.int++; }

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
        statBank: newBank,
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

  // Detect level-up and play SFX
  useEffect(() => {
    if (state.level > levelRef.current) {
      import('@/lib/audioEngine').then(m => m.sfxLevelUp());
    }
    levelRef.current = state.level;
  }, [state.level]);

  const startQuest = useCallback(() => {
    setState(prev => {
      if (prev.questLog.find(q => q.date === today)) return prev;
      const newLog = [...prev.questLog];
      if (restDay) {
        newLog.push({ date: today, status: 'rest' });
        // Rest day bonus goes to bank
        const newBank = { ...prev.statBank, int: prev.statBank.int + 1, vit: prev.statBank.vit + 1 };
        return { ...prev, questLog: newLog, statBank: newBank };
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
      const testsToday = (state as any).intTestsToday || 0;
      const testsDate = (state as any).intTestsDate;
      if (testsDate === today && testsToday >= 6) return false;
      return cooldown.lastUsed !== today;
    }
    if (stat === 'str' || stat === 'end') {
      if (cooldown.lastUsed === today) return false;
      if (!cooldown.lastUsed) return true;
      const last = parseLocalDate(cooldown.lastUsed);
      const now = parseLocalDate(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 4;
    }
    if (stat === 'agi') {
      if (cooldown.lastUsed === today) return false;
      return weeklyUses < 3;
    }
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

      const newBank = { ...prev.statBank, [stat]: prev.statBank[stat] + points };

      // XP from skill task
      const skillXp = Math.floor(getQuestXP(prev.level) * 0.5);
      let newXp = prev.xp + skillXp;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = xpForLevel(newLevel);
      }
      const newTitles = prev.classTitles;

      const newCooldowns = {
        ...prev.skillCooldowns,
        [stat]: {
          ...cooldown,
          lastUsed: today,
          usesThisWeek: (cooldown.weekStart === currentWeekStart ? cooldown.usesThisWeek : 0) + 1,
          weekStart: currentWeekStart,
        },
      };
      return {
        ...prev,
        statBank: newBank,
        skillCooldowns: newCooldowns,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
        classTitles: newTitles,
        personalRecords: {
          ...prev.personalRecords,
          maxLevel: Math.max(prev.personalRecords.maxLevel, newLevel),
        },
      };
    });
  }, [today]);

  const completeIntTest = useCallback((points: number, failed: boolean, perfectCount: number, newCorrectIds: string[]) => {
    setState(prev => {
      const newBank = { ...prev.statBank, int: prev.statBank.int + points };
      const currentWeekStart = getWeekStart(today);
      const cooldown = prev.skillCooldowns.int;

      let intTestCooldown: string | null = (prev as any).intTestCooldown || null;
      if (failed) {
        const d = parseLocalDate(today);
        d.setDate(d.getDate() + 2);
        intTestCooldown = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      const prevCorrect: string[] = (prev as any).answeredCorrectly || [];
      const mergedCorrect = [...new Set([...prevCorrect, ...newCorrectIds])];

      const prevTestsToday = ((prev as any).intTestsDate === today) ? ((prev as any).intTestsToday || 0) : 0;
      const newTestsToday = prevTestsToday + 1;

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

      // XP from INT test
      const intXp = Math.floor(getQuestXP(prev.level) * 0.5);
      let newXp = prev.xp + intXp;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = xpForLevel(newLevel);
      }
      const newTitles = prev.classTitles;

      return {
        ...prev,
        statBank: newBank,
        skillCooldowns: newCooldowns,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
        classTitles: newTitles,
        personalRecords: {
          ...prev.personalRecords,
          maxLevel: Math.max(prev.personalRecords.maxLevel, newLevel),
        },
        intTestCooldown: failed ? intTestCooldown : (prev as any).intTestCooldown || null,
        intPerfectsToday: perfectCount,
        intTestsToday: newTestsToday,
        intTestsDate: today,
        answeredCorrectly: mergedCorrect,
      } as any;
    });
  }, [today]);

  // Punishment handlers
  const completePunishment = useCallback(() => {
    setState(prev => {
      const newPunishments = Math.max(0, prev.pendingPunishments - 1);
      // Recover INT +1 to bank
      const newBank = { ...prev.statBank, int: prev.statBank.int + 1 };
      // Gain 1/4 of current XP
      const xpBonus = Math.floor(prev.xp / 4);
      let newXp = prev.xp + xpBonus;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = xpForLevel(newLevel);
      }
      return {
        ...prev,
        pendingPunishments: newPunishments,
        statBank: newBank,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
      };
    });
  }, []);

  const failPunishment = useCallback(() => {
    setState(prev => {
      const newPunishments = Math.max(0, prev.pendingPunishments - 1);
      // Lose half of current XP
      const newXp = Math.floor(prev.xp / 2);
      return {
        ...prev,
        pendingPunishments: newPunishments,
        xp: newXp,
      };
    });
  }, []);

  const dismissTimeWarning = useCallback(() => setTimeWarning(false), []);

  const resetGame = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    saveState(fresh);
  }, []);

  const simulateDays = useCallback((days: number) => {
    setState(prev => {
      let s = { ...prev, stats: { ...prev.stats }, statPoints: { ...prev.statPoints }, statBank: { ...prev.statBank }, questLog: [...prev.questLog] };
      const todayDate = parseLocalDate(getToday());

      for (let i = days; i >= 1; i--) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - i);
        const dateStr = formatLocalDate(d);
        if (s.questLog.find(q => q.date === dateStr)) continue;

        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 4) {
          s.questLog.push({ date: dateStr, status: 'rest' });
          s.statBank = { ...s.statBank, int: s.statBank.int + 1, vit: s.statBank.vit + 1 };
          continue;
        }

        s.questLog.push({ date: dateStr, status: 'completed', exercises: [], runCompleted: true });
        s.totalCompleted++;
        s.currentStreak++;

        const xpGain = getQuestXP(s.level);
        s.xp += xpGain;
        while (s.xp >= s.xpToNext) {
          s.xp -= s.xpToNext;
          s.level++;
          s.xpToNext = xpForLevel(s.level);
        }

        if (s.totalCompleted % 3 === 0) { s.statBank.str++; }
        if (s.totalCompleted % 3 === 0) { s.statBank.agi++; }
        if (s.totalCompleted % 4 === 0) { s.statBank.end++; }
        if (s.totalCompleted % 5 === 0) { s.statBank.vit++; }
        if (s.currentStreak % 7 === 0) { s.statBank.int++; }
      }

      s.classTitles = s.classTitles || prev.classTitles;
      s.personalRecords = {
        ...prev.personalRecords,
        longestStreak: Math.max(prev.personalRecords.longestStreak, s.currentStreak),
        maxLevel: Math.max(prev.personalRecords.maxLevel, s.level),
      };

      return s;
    });
  }, []);

  // Class change challenge: complete one stat task for a class
  const completeClassChallengeTask = useCallback((className: string, stat: StatKey) => {
    setState(prev => {
      const progress = { ...prev.classChangeProgress };
      const completed = progress[className] ? [...progress[className]] : [];
      if (completed.includes(stat)) return prev; // already done
      completed.push(stat);
      progress[className] = completed;

      // Check if all 5 stats completed
      const allDone = completed.length >= 5;
      let newTitles = prev.classTitles;
      if (allDone) {
        newTitles = prev.classTitles.map(t =>
          t.name === className ? { ...t, obtained: true } : t
        );
      }

      return {
        ...prev,
        classChangeProgress: progress,
        classTitles: newTitles,
      };
    });
  }, []);

  const assignBankPoints = useCallback(() => {
    setState(prev => {
      const bank = prev.statBank;
      const totalBank = bank.int + bank.str + bank.agi + bank.vit + bank.end;
      if (totalBank === 0) return prev;

      const newStats = { ...prev.stats };
      const newPoints = { ...prev.statPoints };
      for (const key of ['int', 'str', 'agi', 'vit', 'end'] as StatKey[]) {
        newStats[key] += bank[key];
        newPoints[key] += bank[key];
      }

      return {
        ...prev,
        stats: newStats,
        statPoints: newPoints,
        statBank: { int: 0, str: 0, agi: 0, vit: 0, end: 0 },
      };
    });
  }, []);

  const completeMandatoryMission = useCallback(() => {
    setState(prev => {
      if (!prev.missionSchedule) return prev;
      const today = getToday();
      const missions = prev.missionSchedule.missions.map(m =>
        m.date === today && m.status === 'active' ? { ...m, status: 'completed' as const } : m
      );
      return { ...prev, missionSchedule: { ...prev.missionSchedule, missions } };
    });
  }, []);

  const failMandatoryMission = useCallback(() => {
    setState(prev => {
      if (!prev.missionSchedule) return prev;
      const today = getToday();
      const missions = prev.missionSchedule.missions.map(m =>
        m.date === today && m.status === 'active' ? { ...m, status: 'failed' as const } : m
      );
      // Lose 50% of current XP
      const newXp = Math.floor(prev.xp * 0.5);
      return {
        ...prev,
        xp: newXp,
        missionSchedule: { ...prev.missionSchedule, missions },
      };
    });
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
    completePunishment,
    failPunishment,
    simulateDays,
    completeClassChallengeTask,
    assignBankPoints,
    completeMandatoryMission,
    failMandatoryMission,
  };
}
