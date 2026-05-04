"use client";

export type JourneyState = {
  startedAt: number | null;
  millionAt: number | null;
  netWorth: number;
  goal: number;
};

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  dayNumber: number;
  title: string;
  didToday: string;
  lessons: string;
  mood: number;
  energy: number;
  win: string;
  photoIds: string[];
  createdAt: number;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  done: boolean;
  createdAt: number;
};

export type Milestone = {
  id: string;
  amount: number;
  label: string;
  hitAt: number | null;
};

export type NetWorthSnapshot = { date: string; amount: number; at: number };

export type Habit = { id: string; emoji: string; name: string; createdAt: number; color: string };
export type HabitCheck = { habitId: string; date: string };

export type Letter = {
  id: string;
  title: string;
  body: string;
  unlockAmount: number; // unlocked when net worth >= this
  createdAt: number;
  openedAt: number | null;
};

export type VisionItem = {
  id: string;
  caption: string;
  photoId: string | null;
  link: string;
  createdAt: number;
};

const KEYS = {
  state: "u1m:state",
  entries: "u1m:entries",
  challenges: "u1m:challenges",
  milestones: "u1m:milestones",
  snapshots: "u1m:snapshots",
  habits: "u1m:habits",
  habitChecks: "u1m:habitChecks",
  letters: "u1m:letters",
  vision: "u1m:vision",
};

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function write(k: string, v: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
}

export const Store = {
  getState(): JourneyState {
    return read<JourneyState>(KEYS.state, { startedAt: null, millionAt: null, netWorth: 0, goal: 1_000_000 });
  },
  setState(s: JourneyState) { write(KEYS.state, s); },

  getEntries(): JournalEntry[] { return read<JournalEntry[]>(KEYS.entries, []); },
  setEntries(e: JournalEntry[]) { write(KEYS.entries, e); },

  getChallenges(): Challenge[] { return read<Challenge[]>(KEYS.challenges, []); },
  setChallenges(c: Challenge[]) { write(KEYS.challenges, c); },

  getMilestones(): Milestone[] {
    const m = read<Milestone[]>(KEYS.milestones, []);
    if (m.length) return m;
    const seed: Milestone[] = [
      { id: "m1", amount: 1_000, label: "First $1K", hitAt: null },
      { id: "m2", amount: 10_000, label: "$10K Club", hitAt: null },
      { id: "m3", amount: 50_000, label: "$50K Locked", hitAt: null },
      { id: "m4", amount: 100_000, label: "Six Figures", hitAt: null },
      { id: "m5", amount: 250_000, label: "Quarter Mil", hitAt: null },
      { id: "m6", amount: 500_000, label: "Halfway Hero", hitAt: null },
      { id: "m7", amount: 1_000_000, label: "MILLIONAIRE", hitAt: null },
    ];
    write(KEYS.milestones, seed);
    return seed;
  },
  setMilestones(m: Milestone[]) { write(KEYS.milestones, m); },

  getSnapshots(): NetWorthSnapshot[] { return read<NetWorthSnapshot[]>(KEYS.snapshots, []); },
  setSnapshots(s: NetWorthSnapshot[]) { write(KEYS.snapshots, s); },
  addSnapshot(amount: number) {
    const all = Store.getSnapshots();
    const date = todayISO();
    const next = [...all.filter((s) => s.date !== date), { date, amount, at: Date.now() }].sort((a, b) => a.at - b.at);
    write(KEYS.snapshots, next);
    return next;
  },

  getHabits(): Habit[] { return read<Habit[]>(KEYS.habits, []); },
  setHabits(h: Habit[]) { write(KEYS.habits, h); },
  getHabitChecks(): HabitCheck[] { return read<HabitCheck[]>(KEYS.habitChecks, []); },
  setHabitChecks(c: HabitCheck[]) { write(KEYS.habitChecks, c); },

  getLetters(): Letter[] { return read<Letter[]>(KEYS.letters, []); },
  setLetters(l: Letter[]) { write(KEYS.letters, l); },

  getVision(): VisionItem[] { return read<VisionItem[]>(KEYS.vision, []); },
  setVision(v: VisionItem[]) { write(KEYS.vision, v); },
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function dayNumber(startedAt: number | null) {
  if (!startedAt) return 0;
  const ms = Date.now() - startedAt;
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
