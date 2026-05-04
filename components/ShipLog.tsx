"use client";
import { useEffect, useState } from "react";
import { Store, todayISO, uid, type ShipItem } from "@/lib/storage";

export default function ShipLog() {
  const [list, setList] = useState<ShipItem[]>([]);
  const [draft, setDraft] = useState<ShipItem>(empty());

  useEffect(() => { setList(Store.getShips()); }, []);

  const persist = (n: ShipItem[]) => { setList(n); Store.setShips(n); };

  const add = () => {
    if (!draft.title.trim()) return;
    persist([draft, ...list]); setDraft(empty());
  };

  // streak (consecutive ship days back from today)
  const dates = new Set(list.map((s) => s.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (dates.has(d)) streak++; else if (i > 0) break;
  }

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
    return { d, hit: dates.has(d) };
  });

  const tweet = (s: ShipItem) => {
    const text = `Day ${list.length - list.indexOf(s)} of building.\n\nShipped: ${s.title}${s.notes ? `\n\n${s.notes}` : ""}\n\n#buildinpublic`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${s.link ? `&url=${encodeURIComponent(s.link)}` : ""}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-2xl font-black">🚀 Ship Log</h3>
        <div className="text-sm">
          <span className="text-white/50">ship streak </span>
          <span className="text-neon font-black text-lg">{streak} 🔥</span>
          <span className="text-white/50"> · {list.length} total</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-3">
        <div className="grid grid-cols-30 gap-1" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
          {last30.map((x) => (
            <div key={x.d} title={x.d} className={"aspect-square rounded-sm " + (x.hit ? "bg-neon" : "bg-white/10")} />
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-2">
        <input className="w-full text-lg font-bold" placeholder="What did you ship?" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <textarea className="w-full" rows={2} placeholder="Notes (what + why)" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <div className="grid md:grid-cols-3 gap-2">
          <input placeholder="Project / product" value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} />
          <input placeholder="Link (optional)" value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} />
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={add}>+ Log Ship</button>
      </div>

      <div className="space-y-2">
        {list.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-widest text-cyan2">{s.date}{s.project && <> · {s.project}</>}</div>
              <h4 className="text-lg font-bold truncate">{s.title}</h4>
              {s.notes && <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{s.notes}</p>}
              {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="text-xs text-cyan2 underline">{s.link}</a>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="text-xs underline text-white/70" onClick={() => tweet(s)}>tweet</button>
              <button className="text-xs underline text-white/50" onClick={() => persist(list.filter((x) => x.id !== s.id))}>delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-white/50 text-sm">Nothing shipped yet. Today's a great day for that to change.</p>}
      </div>
    </div>
  );
}

function empty(): ShipItem {
  return { id: uid(), title: "", notes: "", project: "", link: "", date: todayISO(), createdAt: Date.now() };
}
