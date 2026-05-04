"use client";
import { useEffect, useState } from "react";
import { Store, type JournalEntry } from "@/lib/storage";

export default function WinWall() {
  const [wins, setWins] = useState<{ win: string; date: string; day: number }[]>([]);
  useEffect(() => {
    setWins(Store.getEntries().filter((e) => e.win.trim()).map((e) => ({ win: e.win, date: e.date, day: e.dayNumber })));
  }, []);

  if (wins.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-xl font-black">🏆 Wall of Wins</h3>
      <p className="text-xs text-white/50 mt-1">Every time you doubt — read this.</p>
      <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-2">
        {wins.map((w, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="text-neon shrink-0 text-xs uppercase tracking-widest pt-1">D{w.day}</div>
            <p className="text-sm">{w.win}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
