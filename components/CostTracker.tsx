"use client";
import { useEffect, useMemo, useState } from "react";
import { Store, todayISO, uid, type CostEntry } from "@/lib/storage";

const PROVIDERS = ["Anthropic", "OpenAI", "Replicate", "Together", "Fireworks", "Vercel", "Other"];
const fmt = (n: number) => "$" + n.toFixed(2);

export default function CostTracker() {
  const [list, setList] = useState<CostEntry[]>([]);
  const [draft, setDraft] = useState<CostEntry>(empty());

  useEffect(() => { setList(Store.getCosts()); }, []);

  const persist = (n: CostEntry[]) => { setList(n); Store.setCosts(n); };

  const add = () => {
    if (!draft.amount || !draft.provider) return;
    persist([{ ...draft, id: uid(), createdAt: Date.now() }, ...list]);
    setDraft(empty());
  };

  const stats = useMemo(() => {
    const today = todayISO();
    const monthStart = today.slice(0, 7);
    const last30 = Date.now() - 30 * 86400000;
    const byProvider: Record<string, number> = {};
    const byProject: Record<string, number> = {};
    let todayTotal = 0, monthTotal = 0, last30Total = 0;
    for (const c of list) {
      todayTotal += c.date === today ? c.amount : 0;
      monthTotal += c.date.startsWith(monthStart) ? c.amount : 0;
      last30Total += c.createdAt >= last30 ? c.amount : 0;
      byProvider[c.provider] = (byProvider[c.provider] || 0) + c.amount;
      if (c.project) byProject[c.project] = (byProject[c.project] || 0) + c.amount;
    }
    return { todayTotal, monthTotal, last30Total, byProvider, byProject };
  }, [list]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-2xl font-black">🧾 AI Cost Tracker</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "TODAY", v: stats.todayTotal },
          { l: "THIS MONTH", v: stats.monthTotal },
          { l: "LAST 30D", v: stats.last30Total },
        ].map((x) => (
          <div key={x.l} className="glass rounded-2xl p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest text-white/50">{x.l}</div>
            <div className="text-2xl font-black mt-1">{fmt(x.v)}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">By provider</div>
          {Object.entries(stats.byProvider).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={Math.max(...Object.values(stats.byProvider), 1)} />
          ))}
          {Object.keys(stats.byProvider).length === 0 && <p className="text-white/40 text-sm">No spend logged yet.</p>}
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">By project</div>
          {Object.entries(stats.byProject).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={Math.max(...Object.values(stats.byProject), 1)} color="#ff2bd6" />
          ))}
          {Object.keys(stats.byProject).length === 0 && <p className="text-white/40 text-sm">Tag entries with a project to see breakdown.</p>}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-2">
        <div className="grid md:grid-cols-5 gap-2">
          <input type="number" step="0.01" placeholder="$ amount" value={draft.amount || ""} onChange={(e) => setDraft({ ...draft, amount: +e.target.value })} />
          <select value={draft.provider} onChange={(e) => setDraft({ ...draft, provider: e.target.value })}>
            <option value="">Provider…</option>
            {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input placeholder="Project" value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} />
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          <button className="btn btn-primary" onClick={add}>+ Log</button>
        </div>
        <input className="w-full" placeholder="Note (optional, e.g. 'GPT-4o eval run')" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
      </div>

      <div className="space-y-1">
        {list.slice(0, 25).map((c) => (
          <div key={c.id} className="glass rounded-xl px-4 py-2 flex items-center gap-3 text-sm">
            <span className="text-cyan2 w-24 shrink-0">{c.date}</span>
            <span className="font-bold w-20 shrink-0">{fmt(c.amount)}</span>
            <span className="px-2 py-0.5 text-xs rounded-full border border-white/10 shrink-0">{c.provider}</span>
            <span className="text-white/60 shrink-0">{c.project}</span>
            <span className="text-white/50 truncate">{c.note}</span>
            <button className="ml-auto text-xs underline text-white/40" onClick={() => persist(list.filter((x) => x.id !== c.id))}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, max, color = "#c4ff00" }: { label: string; value: number; max: number; color?: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs">
        <span className="text-white/80">{label}</span>
        <span className="font-bold">{fmt(value)}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-1">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function empty(): CostEntry {
  return { id: "", date: todayISO(), provider: "", project: "", amount: 0, note: "", createdAt: 0 };
}
