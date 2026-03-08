import { useState, useEffect, useRef } from 'react';
import { GameState, StatKey, getSkillTitle, SKILL_TITLES, STAT_LABELS, STAT_ICONS } from '@/lib/gameData';
import { TitleNotification } from '@/components/TitleUnlockModal';

const NOTIF_STORAGE_KEY = 'title-notifications-queue';
const SEEN_TITLES_KEY = 'seen-titles';

interface SeenTitles {
  classTitles: string[]; // names of obtained class titles
  skillTitles: Record<StatKey, string>; // current skill title name per stat
}

function loadSeenTitles(): SeenTitles | null {
  try {
    const raw = localStorage.getItem(SEEN_TITLES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSeenTitles(seen: SeenTitles) {
  localStorage.setItem(SEEN_TITLES_KEY, JSON.stringify(seen));
}

const statKeys: StatKey[] = ['int', 'str', 'agi', 'vit', 'end'];

export function useTitleNotifications(state: GameState) {
  const [notifications, setNotifications] = useState<TitleNotification[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    const seen = loadSeenTitles();

    // First time: initialize seen titles without notifications
    if (!seen) {
      const initial: SeenTitles = {
        classTitles: state.classTitles.filter(t => t.obtained).map(t => t.name),
        skillTitles: {} as Record<StatKey, string>,
      };
      for (const key of statKeys) {
        initial.skillTitles[key] = getSkillTitle(key, state.statPoints[key]).name;
      }
      saveSeenTitles(initial);
      initialized.current = true;
      return;
    }

    if (!initialized.current) {
      initialized.current = true;
    }

    const newNotifs: TitleNotification[] = [];

    // Check class titles
    const obtainedClasses = state.classTitles.filter(t => t.obtained);
    for (const ct of obtainedClasses) {
      if (!seen.classTitles.includes(ct.name)) {
        newNotifs.push({
          id: `class-${ct.name}`,
          type: 'class',
          name: ct.name,
          icon: ct.icon,
        });
      }
    }

    // Check skill titles
    for (const key of statKeys) {
      const current = getSkillTitle(key, state.statPoints[key]);
      const seenName = seen.skillTitles[key];
      if (seenName && current.name !== seenName) {
        // Check if it's a higher title (progression, not regression)
        const titles = SKILL_TITLES[key];
        const seenIdx = titles.findIndex(t => t.name === seenName);
        const curIdx = titles.findIndex(t => t.name === current.name);
        if (curIdx > seenIdx) {
          newNotifs.push({
            id: `skill-${key}-${current.name}`,
            type: 'skill',
            name: current.name,
            icon: STAT_ICONS[key],
            statLabel: STAT_LABELS[key],
          });
        }
      }
    }

    if (newNotifs.length > 0) {
      setNotifications(prev => [...prev, ...newNotifs.filter(n => !prev.some(p => p.id === n.id))]);
    }
  }, [state.classTitles, state.statPoints, state.level]);

  const acceptTitle = (id: string) => {
    // Mark as seen
    const seen = loadSeenTitles();
    if (seen) {
      const notif = notifications.find(n => n.id === id);
      if (notif) {
        if (notif.type === 'class') {
          seen.classTitles = [...new Set([...seen.classTitles, notif.name])];
        } else {
          const statKey = id.split('-')[1] as StatKey;
          seen.skillTitles[statKey] = notif.name;
        }
        saveSeenTitles(seen);
      }
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const rejectTitle = (id: string) => {
    // Still mark as seen so it doesn't pop up again
    const seen = loadSeenTitles();
    if (seen) {
      const notif = notifications.find(n => n.id === id);
      if (notif) {
        if (notif.type === 'class') {
          seen.classTitles = [...new Set([...seen.classTitles, notif.name])];
        } else {
          const statKey = id.split('-')[1] as StatKey;
          seen.skillTitles[statKey] = notif.name;
        }
        saveSeenTitles(seen);
      }
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const currentNotification = notifications.length > 0 ? notifications[0] : null;

  return { currentNotification, acceptTitle, rejectTitle };
}
