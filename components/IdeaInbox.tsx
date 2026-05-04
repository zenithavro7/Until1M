"use client";
import { useEffect, useState } from "react";
import { Store, uid, type Idea, type IdeaStatus } from "@/lib/storage";

const SCORE_KEYS = ["market", "edge", "pain", "leverage"] as const;
const SCORE_LABELS = { market: "Market", edge: "Your Edge", pain: "Pain Level", leverage: "AI Leverage" } as const;

const score = (i: Idea) => i.market + i.edge + i.pain + i.leverage; // 4-20

export default function IdeaInbox() {
  const [list, setList] = useState<Idea[]>([]);
  const [draft, setDraft] = useState<Idea>(empty());
  const [view, setView] = useState<IdeaStatus>("active");

  useEffect(() => { setList(Store.getIdeas()); }, []);

  const persist = (n: Idea[]) => { setList(n); Store.setIdeas(n); };

  const add = () => {
    if (!draft.title.trim()) return;
    persist([{ ...draft, id: uid(), createdAt: Date.now() }, ...list]);
    setDraft(empty());
  };

  const setStatus = (id: string, status: IdeaStatus, killReason = "") => {
    persist(list.map((i) => i.id === id ? { ...i, status, killReason: status === "killed" ? killReason : "" } : i));
  };

  const filtered = list.filter((i) => i.status === view).sort((a, b) => score(b) - score(a));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-2xl font-black">💡 Idea Inbox</h3>
        <div className="flex gap-2">
          {(["active", "shipped", "killed"] as IdeaStatus[]).map((s) => (
            <button key={s} onClick={() => setView(s)}
              className={"px-3 py-1 rounded-full text-xs uppercase tracking-widest border " + (view === s ? "tab-active border-neon text-white" : "border-white/10 text-white/60")}>
              {s} ({list.filter((i) => i.status === s).length})
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <input className="w-full text-lg font-bold" placeholder="One-line idea (e.g. 'Cursor for legal contracts')" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <textarea className="w-full" rows={2} placeholder="Pitch in 2 sentences" value={draft.pitch} onChange={(e) => setDraft({ ...draft, pitch: e.target.value })} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SCORE_KEYS.map((k) => (
            <label key={k} className="text-xs text-white/60">
              {SCORE_LABELS[k]}: <b className="text-white">{draft[k]}</b>
              <input type="range" min={1} max={5} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: +e.target.value })} className="w-full" />
            </label>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-white/60">Total score: <b className="text-neon">{score(draft)}</b> / 20</div>
          <button className="btn btn-primary" onClick={add}>+ Capture Idea</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((i) => (
          <div key={i.id} className="glass rounded-2xl p-4">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h4 className="text-lg font-bold">{i.title}</h4>
                {i.pitch && <p className="text-sm text-white/70 mt-1">{i.pitch}</p>}
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-neon">{score(i)}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">/20</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 text-[10px] uppercase tracking-widest text-white/50">
              {SCORE_KEYS.map((k) => (
                <span key={k} className="px-2 py-0.5 rounded-full border border-white/10">{SCORE_LABELS[k]} {i[k]}</span>
              ))}
            </div>
            {i.killReason && <p className="mt-2 text-xs text-magenta italic">☠ {i.killReason}</p>}
            <div className="flex gap-2 mt-3 text-xs">
              {i.status !== "active" && <button className="underline text-white/60" onClick={() => setStatus(i.id, "active")}>revive</button>}
              {i.status !== "shipped" && <button className="underline text-white/60" onClick={() => setStatus(i.id, "shipped")}>shipped</button>}
              {i.status !== "killed" && <button className="underline text-white/60" onClick={() => {
                const r = prompt("Why kill it? (so future-you doesn't loop on this)") || "";
                setStatus(i.id, "killed", r);
              }}>kill</button>}
              <button className="underline text-white/40 ml-auto" onClick={() => persist(list.filter((x) => x.id !== i.id))}>delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-white/50 text-sm">No {view} ideas yet.</p>}
      </div>
    </div>
  );
}

function empty(): Idea {
  return { id: "", title: "", pitch: "", market: 3, edge: 3, pain: 3, leverage: 3, status: "active", killReason: "", createdAt: 0 };
}
