# Until $1M — The Journey

A high-energy personal app to document the journey from zero to a million.

## Features

- **Permanent Journey Clock** — starts on first press, never resets until you hit the "I'm a Millionaire" button.
- **Day counter** that auto-increments since launch day.
- **Daily journal** — what you did, lessons learned, biggest win, mood + energy sliders.
- **Photo upload** per day (stored locally in IndexedDB).
- **Custom challenges** with progress bars (e.g. 30-day sprint, no-junk-food month, $X in revenue by date).
- **Milestone tracker** — auto-unlocks badges as your net worth crosses thresholds ($1K → $1M).
- **Web notifications** for daily journaling reminders.
- **Streak heatmap** of last 30 days of journaling.
- **Daily quote** that rotates.
- **Backup / restore** — export your full journey as JSON.

All data lives in your browser (localStorage + IndexedDB). No backend required.

## Stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · idb

## Local dev
```bash
npm install
npm run dev
```

## Deploy on Vercel
Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). Zero config — Vercel auto-detects Next.js.

Or via CLI:
```bash
npm i -g vercel
vercel
```

## Ideas to add next
- **Vision board** page with pinned images.
- **Voice memos** per journal entry.
- **Public mode** (read-only share link via Vercel KV).
- **Chart of net worth over time**.
- **"Letter to future me"** unlocked at certain milestones.
- **Habit tracker** strip alongside journal.
- **Time blocks / Pomodoro** mini-tool.
- **Export as PDF book** at $1M.
# Until1M
