"use client";
import { useEffect, useState } from "react";
import { Store, todayISO, uid, type Challenge } from "@/lib/storage";

export default function Challenges() {
  const [list, setList] = useState<Challenge[]>([]);
  const [draft, setDraft] = useState<Challenge | null>(null);

  useEffect(() => { setList(Store.getChallenges()); }, []);

  const persist = (next: Challenge[]) => { setList(next); Store.setChallenges(next); };

  const startDraft = () => setDraft({
    id: uid(), title: "", description: "",
    startDate: todayISO(), endDate: todayISO(), done: false, createdAt: Date.now(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">🔥 Challenges</h3>
        <button className="btn btn-primary" onClick={startDraft}>+ New Challenge</button>
      </div>

      {draft && (
        <div className="glass rounded-2xl p-5 space-y-2">
          <input className="w-full text-lg font-bold" placeholder="Challenge title (e.g. 30-day Cold Email Sprint)" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <textarea className="w-full" rows={2} placeholder="Why this matters" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
            <input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => { persist([draft, ...list]); setDraft(null); }}>Add</button>
            <button className="btn btn-ghost" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((c) => {
          const total = Math.max(1, (new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86400000);
          const passed = Math.min(total, Math.max(0, (Date.now() - new Date(c.startDate).getTime()) / 86400000));
          const pct = Math.round((passed / total) * 100);
          return (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex justify-between gap-2">
                <h4 className={"text-lg font-bold " + (c.done ? "line-through text-white/40" : "")}>{c.title}</h4>
                <div className="flex gap-2">
                  <button className="text-xs underline text-white/60" onClick={() => persist(list.map((x) => x.id === c.id ? { ...x, done: !x.done } : x))}>{c.done ? "undo" : "done"}</button>
                  <button className="text-xs underline text-white/60" onClick={() => persist(list.filter((x) => x.id !== c.id))}>delete</button>
                </div>
              </div>
              <p className="text-sm text-white/70 mt-1">{c.description}</p>
              <div className="text-xs text-white/50 mt-2">{c.startDate} → {c.endDate}</div>
              <div className="h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c4ff00,#ff2bd6)" }} />
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="text-white/50 text-sm">No challenges yet. Pick a battle.</div>}
      </div>
    </div>
  );
}
