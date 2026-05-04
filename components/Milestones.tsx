"use client";
import { useEffect, useState } from "react";
import { Store, type JourneyState, type Milestone } from "@/lib/storage";
import { fireConfetti, playDing } from "@/lib/confetti";
import NetWorthChart from "./NetWorthChart";

const fmt = (n: number) => "$" + n.toLocaleString();

export default function Milestones({ state, setState }: { state: JourneyState; setState: (s: JourneyState) => void }) {
  const [list, setList] = useState<Milestone[]>([]);
  const [worth, setWorth] = useState<number>(state.netWorth);

  useEffect(() => { setList(Store.getMilestones()); }, []);
  useEffect(() => { setWorth(state.netWorth); }, [state.netWorth]);

  const updateWorth = (n: number) => {
    const next = { ...state, netWorth: n };
    setState(next); Store.setState(next);
    Store.addSnapshot(n);
    const newlyHit = list.some((x) => !x.hitAt && n >= x.amount);
    const m = list.map((x) => (!x.hitAt && n >= x.amount ? { ...x, hitAt: Date.now() } : x));
    setList(m); Store.setMilestones(m);
    if (newlyHit) { fireConfetti(); playDing(); }
  };

  const pct = Math.min(100, (worth / state.goal) * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black">🏁 Milestones</h3>

      <NetWorthChart state={state} />

      <div className="glass rounded-2xl p-5">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50">Net worth</div>
            <div className="text-3xl font-black">{fmt(worth)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-white/50">Goal</div>
            <div className="text-xl font-bold text-neon">{fmt(state.goal)}</div>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded-full mt-4 overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c4ff00,#22d3ee,#ff2bd6)" }} />
        </div>
        <div className="flex gap-2 mt-3">
          <input type="number" value={worth} onChange={(e) => setWorth(+e.target.value)} className="flex-1" />
          <button className="btn btn-primary" onClick={() => updateWorth(worth)}>Update</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {list.map((m) => (
          <div key={m.id} className={"glass rounded-2xl p-4 flex items-center justify-between " + (m.hitAt ? "border-neon/60" : "")}>
            <div>
              <div className="text-lg font-bold">{m.label}</div>
              <div className="text-xs text-white/50">{fmt(m.amount)}</div>
            </div>
            <div className="text-2xl">{m.hitAt ? "✅" : "🔒"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
