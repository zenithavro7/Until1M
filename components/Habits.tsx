"use client";
import { useEffect, useState } from "react";
import { Store, todayISO, uid, type Habit, type HabitCheck } from "@/lib/storage";

const COLORS = ["#c4ff00", "#22d3ee", "#ff2bd6", "#7c3aed", "#fbbf24", "#34d399"];
const SUGGEST = ["💪 Workout", "📚 Read 30m", "✍️ Write", "🧘 Meditate", "💧 Hydrate", "🌅 No phone first hour"];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checks, setChecks] = useState<HabitCheck[]>([]);
  const [name, setName] = useState("");

  useEffect(() => { setHabits(Store.getHabits()); setChecks(Store.getHabitChecks()); }, []);

  const isChecked = (hid: string, d: string) => checks.some((c) => c.habitId === hid && c.date === d);

  const toggle = (hid: string, d: string) => {
    const has = isChecked(hid, d);
    const next = has ? checks.filter((c) => !(c.habitId === hid && c.date === d)) : [...checks, { habitId: hid, date: d }];
    setChecks(next); Store.setHabitChecks(next);
  };

  const add = (label?: string) => {
    const n = (label ?? name).trim();
    if (!n) return;
    const emoji = (n.match(/^\p{Extended_Pictographic}/u)?.[0]) || "✨";
    const cleanName = emoji ? n.replace(/^\p{Extended_Pictographic}\s*/u, "") : n;
    const h: Habit = { id: uid(), emoji, name: cleanName, createdAt: Date.now(), color: COLORS[habits.length % COLORS.length] };
    const next = [...habits, h]; setHabits(next); Store.setHabits(next); setName("");
  };

  const remove = (hid: string) => {
    const nh = habits.filter((h) => h.id !== hid); setHabits(nh); Store.setHabits(nh);
    const nc = checks.filter((c) => c.habitId !== hid); setChecks(nc); Store.setHabitChecks(nc);
  };

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { d: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1) };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">⚙️ Habits</h3>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex gap-2">
          <input className="flex-1" placeholder="✨ Add a daily habit (emoji + name)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button className="btn btn-primary" onClick={() => add()}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGEST.map((s) => (
            <button key={s} className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/70 hover:border-neon hover:text-white" onClick={() => add(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 overflow-x-auto">
        {habits.length === 0 ? (
          <p className="text-white/50 text-sm">No habits yet. The system beats willpower.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-white/50">
                <th className="text-left pb-3">Habit</th>
                {days.map((d) => <th key={d.d} className="px-1 pb-3">{d.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => {
                const todayHit = isChecked(h.id, todayISO());
                return (
                  <tr key={h.id} className="border-t border-white/5">
                    <td className="py-3 pr-3">
                      <span className="mr-2">{h.emoji}</span>
                      <span className={todayHit ? "text-white" : "text-white/80"}>{h.name}</span>
                    </td>
                    {days.map((d) => {
                      const hit = isChecked(h.id, d.d);
                      return (
                        <td key={d.d} className="px-1 py-2 text-center">
                          <button onClick={() => toggle(h.id, d.d)}
                            className="w-7 h-7 rounded-md border border-white/10"
                            style={{ background: hit ? h.color : "transparent" }} />
                        </td>
                      );
                    })}
                    <td className="text-right pl-2">
                      <button className="text-xs underline text-white/50" onClick={() => remove(h.id)}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
