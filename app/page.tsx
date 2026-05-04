"use client";
import { useEffect, useState } from "react";
import Timer from "@/components/Timer";
import Journal from "@/components/Journal";
import Challenges from "@/components/Challenges";
import Milestones from "@/components/Milestones";
import Notifications from "@/components/Notifications";
import Quote from "@/components/Quote";
import StreakBar from "@/components/StreakBar";
import DataTools from "@/components/DataTools";
import Habits from "@/components/Habits";
import Letters from "@/components/Letters";
import Focus from "@/components/Focus";
import VisionBoard from "@/components/VisionBoard";
import WinWall from "@/components/WinWall";
import { Store, dayNumber, type JourneyState } from "@/lib/storage";

const TABS = ["Dashboard", "Journal", "Habits", "Focus", "Challenges", "Milestones", "Vision", "Settings"] as const;
type Tab = typeof TABS[number];

export default function Home() {
  const [state, setState] = useState<JourneyState | null>(null);
  const [tab, setTab] = useState<Tab>("Dashboard");

  useEffect(() => { setState(Store.getState()); }, []);

  if (!state) return <div className="p-10 text-white/60">Loading…</div>;

  const day = dayNumber(state.startedAt);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="text-xs tracking-[0.4em] text-neon uppercase">Until $1,000,000</div>
          <h1 className="text-4xl md:text-6xl font-black mt-1 leading-none">
            <span className="title-stroke text-transparent">THE</span>{" "}
            <span style={{ background: "linear-gradient(90deg,#c4ff00,#22d3ee,#ff2bd6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>JOURNEY</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-white/50">Day</div>
          <div className="text-3xl font-black animate-float">{day}</div>
        </div>
      </header>

      <div className="mt-6"><Quote /></div>

      <nav className="flex flex-wrap gap-2 mt-8">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-4 py-2 rounded-full border text-sm tracking-widest uppercase " + (tab === t ? "tab-active border-neon text-white" : "border-white/10 text-white/60 hover:text-white")}>
            {t}
          </button>
        ))}
      </nav>

      <section className="mt-6 space-y-6">
        {tab === "Dashboard" && (
          <>
            <Timer state={state} setState={setState} />
            <div className="grid md:grid-cols-2 gap-4">
              <StreakBar />
              <Focus />
              <Notifications />
              <WinWall />
            </div>
          </>
        )}
        {tab === "Journal" && <Journal state={state} />}
        {tab === "Habits" && <Habits />}
        {tab === "Focus" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Focus />
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xl font-black">⏱ Why focus blocks?</h3>
              <p className="text-sm text-white/70 mt-2">$1M is built one deep block at a time. Stack the sessions. The clock outside never stops — make the inside ones count.</p>
              <ul className="mt-3 text-sm text-white/70 list-disc pl-5 space-y-1">
                <li>25/5 — quick wins</li>
                <li>50/10 — real builders</li>
                <li>90/20 — flow state</li>
              </ul>
            </div>
          </div>
        )}
        {tab === "Challenges" && <Challenges />}
        {tab === "Milestones" && <Milestones state={state} setState={setState} />}
        {tab === "Vision" && (
          <div className="space-y-6">
            <VisionBoard />
            <Letters state={state} />
          </div>
        )}
        {tab === "Settings" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xl font-black">🎯 Goal</h3>
              <div className="flex gap-2 mt-3 items-center">
                <span className="text-white/60">$</span>
                <input type="number" defaultValue={state.goal} onBlur={(e) => {
                  const next = { ...state, goal: +e.target.value || 1_000_000 };
                  setState(next); Store.setState(next);
                }} />
              </div>
            </div>
            <DataTools />
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xl font-black text-magenta">⚠ Danger</h3>
              <p className="text-sm text-white/60 mt-1">The journey clock cannot be reset until $1M is reached. This is intentional.</p>
            </div>
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-xs text-white/40">
        Built for one mission. Stay loud. Stay locked in.
      </footer>
    </main>
  );
}
