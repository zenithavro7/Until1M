"use client";
import { useEffect, useRef, useState } from "react";
import { playDing } from "@/lib/confetti";

const PRESETS = [
  { label: "25 / 5", work: 25, rest: 5 },
  { label: "50 / 10", work: 50, rest: 10 },
  { label: "90 / 20", work: 90, rest: 20 },
];

export default function Focus() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [mode, setMode] = useState<"work" | "rest">("work");
  const [remaining, setRemaining] = useState(PRESETS[0].work * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const s = +(localStorage.getItem("u1m:focusSessions") || "0");
    setSessions(s);
  }, []);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          playDing();
          if (mode === "work") {
            const ns = sessions + 1; setSessions(ns); localStorage.setItem("u1m:focusSessions", String(ns));
            setMode("rest"); return preset.rest * 60;
          } else {
            setMode("work"); return preset.work * 60;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, mode, preset, sessions]);

  const setP = (p: typeof PRESETS[number]) => {
    setPreset(p); setMode("work"); setRemaining(p.work * 60); setRunning(false);
  };

  const m = Math.floor(remaining / 60), s = remaining % 60;
  const total = (mode === "work" ? preset.work : preset.rest) * 60;
  const pct = ((total - remaining) / total) * 100;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">🎯 Focus Session</h3>
        <div className="text-xs text-white/50">total today: <b className="text-neon">{sessions}</b></div>
      </div>
      <div className="flex gap-2 mt-3">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => setP(p)}
            className={"px-3 py-1 rounded-full text-xs border " + (preset.label === p.label ? "border-neon text-white" : "border-white/10 text-white/60")}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <div className="text-xs uppercase tracking-widest text-white/50">{mode === "work" ? "DEEP WORK" : "RECOVER"}</div>
        <div className="text-6xl font-black font-mono tabular-nums mt-1"
          style={{ background: "linear-gradient(180deg,#fff,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: mode === "work" ? "linear-gradient(90deg,#c4ff00,#22d3ee)" : "linear-gradient(90deg,#7c3aed,#ff2bd6)" }} />
      </div>
      <div className="flex gap-2 mt-3">
        <button className="btn btn-primary flex-1" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</button>
        <button className="btn btn-ghost" onClick={() => { setRunning(false); setMode("work"); setRemaining(preset.work * 60); }}>Reset</button>
      </div>
    </div>
  );
}
