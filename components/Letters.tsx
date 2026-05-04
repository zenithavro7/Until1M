"use client";
import { useEffect, useState } from "react";
import { Store, uid, type Letter, type JourneyState } from "@/lib/storage";

const fmt = (n: number) => "$" + n.toLocaleString();

export default function Letters({ state }: { state: JourneyState }) {
  const [list, setList] = useState<Letter[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<Letter>(empty());

  useEffect(() => { setList(Store.getLetters()); }, []);

  const persist = (next: Letter[]) => { setList(next); Store.setLetters(next); };

  const save = () => {
    if (!draft.title || !draft.body) return;
    persist([draft, ...list.filter((l) => l.id !== draft.id)]);
    setDrafting(false); setDraft(empty());
  };

  const open = (l: Letter) => {
    if (l.openedAt) return;
    if (state.netWorth < l.unlockAmount) return alert(`🔒 Locked until you reach ${fmt(l.unlockAmount)}`);
    persist(list.map((x) => x.id === l.id ? { ...x, openedAt: Date.now() } : x));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">✉️ Letters to Future Me</h3>
        <button className="btn btn-primary" onClick={() => { setDraft(empty()); setDrafting(true); }}>+ Write Letter</button>
      </div>

      {drafting && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <input className="w-full text-lg font-bold" placeholder="Letter title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>Unlock at</span>
            <span className="text-white/60">$</span>
            <input type="number" className="w-40" value={draft.unlockAmount} onChange={(e) => setDraft({ ...draft, unlockAmount: +e.target.value })} />
          </div>
          <textarea className="w-full" rows={8} placeholder="Dear future me…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save}>Seal Letter</button>
            <button className="btn btn-ghost" onClick={() => setDrafting(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((l) => {
          const locked = state.netWorth < l.unlockAmount;
          const opened = !!l.openedAt;
          return (
            <div key={l.id} className={"glass rounded-2xl p-5 " + (opened ? "" : "cursor-pointer hover:border-neon/50") }>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/50">Unlock at {fmt(l.unlockAmount)}</div>
                  <h4 className="text-lg font-bold">{l.title}</h4>
                </div>
                <div className="text-2xl">{opened ? "📖" : locked ? "🔒" : "✉️"}</div>
              </div>
              {opened ? (
                <p className="mt-3 text-sm text-white/80 whitespace-pre-wrap">{l.body}</p>
              ) : (
                <button className="btn btn-ghost mt-3 w-full" onClick={() => open(l)} disabled={locked}>
                  {locked ? `Locked — need ${fmt(l.unlockAmount - state.netWorth)} more` : "Open now"}
                </button>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-white/50 text-sm">No letters yet. Write one for the version of you that made it.</p>}
      </div>
    </div>
  );
}

function empty(): Letter {
  return { id: uid(), title: "", body: "", unlockAmount: 100_000, createdAt: Date.now(), openedAt: null };
}
