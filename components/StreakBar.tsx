"use client";
import { useEffect, useState } from "react";
import { Store, type JournalEntry } from "@/lib/storage";

export default function StreakBar() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  useEffect(() => { setEntries(Store.getEntries()); }, []);

  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (dates.has(d)) streak++; else if (i > 0) break;
  }

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return { d, hit: dates.has(d) };
  });

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Journal Streak</div>
          <div className="text-3xl font-black text-neon">{streak} 🔥</div>
        </div>
        <div className="text-xs text-white/50">last 30 days</div>
      </div>
      <div className="grid grid-cols-30 gap-1 mt-3" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
        {last30.map((x) => (
          <div key={x.d} title={x.d} className={"aspect-square rounded-sm " + (x.hit ? "bg-neon" : "bg-white/10")} />
        ))}
      </div>
    </div>
  );
}
