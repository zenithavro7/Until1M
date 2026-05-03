"use client";
import { useEffect, useState } from "react";
import { Store, type JourneyState } from "@/lib/storage";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return { days, hrs, mins, secs };
}

export default function Timer({ state, setState }: { state: JourneyState; setState: (s: JourneyState) => void }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const elapsed = state.startedAt ? (state.millionAt ?? now) - state.startedAt : 0;
  const t = fmt(elapsed);

  const start = () => {
    if (state.startedAt) return;
    const next = { ...state, startedAt: Date.now(), millionAt: null };
    Store.setState(next); setState(next);
  };

  const reachedMillion = () => {
    if (!state.startedAt || state.millionAt) return;
    if (!confirm("Confirm: you've hit $1,000,000? This will stop the timer permanently.")) return;
    const next = { ...state, millionAt: Date.now(), netWorth: Math.max(state.netWorth, state.goal) };
    Store.setState(next); setState(next);
  };

  return (
    <div className="glass rounded-3xl p-8 shadow-glow">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">The Journey Clock</p>
          <h2 className="text-2xl md:text-3xl font-black mt-1">
            {state.millionAt ? "🏆 You made it." : state.startedAt ? "Running. No reset. Only forward." : "Press start. The clock will not stop."}
          </h2>
        </div>
        {!state.startedAt && (
          <button className="btn btn-primary" onClick={start}>▶ Continue / Start</button>
        )}
        {state.startedAt && !state.millionAt && (
          <button className="btn btn-primary animate-pulseGlow" onClick={reachedMillion}>💎 I'm a Millionaire</button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-6 mt-8">
        {[
          { l: "DAYS", v: t.days },
          { l: "HOURS", v: t.hrs },
          { l: "MINUTES", v: t.mins },
          { l: "SECONDS", v: t.secs },
        ].map((x) => (
          <div key={x.l} className="rounded-2xl border border-white/10 bg-black/30 p-4 md:p-6 text-center">
            <div className="text-4xl md:text-6xl font-black font-mono tabular-nums tracking-tight"
              style={{ background: "linear-gradient(180deg,#fff,#c4ff00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {String(x.v).padStart(2, "0")}
            </div>
            <div className="mt-2 text-[10px] tracking-[0.3em] text-white/50">{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
