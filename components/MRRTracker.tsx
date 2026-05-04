"use client";
import { useEffect, useState } from "react";
import { Store, todayISO, type MrrSnapshot } from "@/lib/storage";
import { fireConfetti, playDing } from "@/lib/confetti";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

function monthlyGrowth(snaps: MrrSnapshot[]): number {
  if (snaps.length < 2) return 0;
  const sorted = [...snaps].sort((a, b) => a.at - b.at);
  const first = sorted[0], last = sorted[sorted.length - 1];
  const months = Math.max(0.25, (last.at - first.at) / (1000 * 60 * 60 * 24 * 30));
  if (first.mrr <= 0 || last.mrr <= 0) return 0;
  return Math.pow(last.mrr / first.mrr, 1 / months) - 1;
}

function projectMillionDate(currentMrr: number, growth: number, targetArr: number): Date | null {
  if (currentMrr <= 0 || growth <= 0) return null;
  const targetMrr = targetArr / 12;
  if (currentMrr >= targetMrr) return new Date();
  const months = Math.log(targetMrr / currentMrr) / Math.log(1 + growth);
  if (!isFinite(months) || months > 600) return null;
  return new Date(Date.now() + months * 30 * 86400000);
}

export default function MRRTracker({ goal = 1_000_000 }: { goal?: number }) {
  const [snaps, setSnaps] = useState<MrrSnapshot[]>([]);
  const [mrr, setMrr] = useState<number>(0);
  const [customers, setCustomers] = useState<number>(0);

  useEffect(() => {
    const s = Store.getMrr();
    setSnaps(s);
    if (s.length) { setMrr(s[s.length - 1].mrr); setCustomers(s[s.length - 1].customers); }
  }, []);

  const log = () => {
    const prev = snaps[snaps.length - 1]?.mrr ?? 0;
    const next = Store.addMrr(mrr, customers);
    setSnaps(next);
    if (mrr > prev && prev > 0) { fireConfetti(); playDing(); }
  };

  const latest = snaps[snaps.length - 1];
  const growth = monthlyGrowth(snaps);
  const arr = (latest?.mrr ?? 0) * 12;
  const projDate = projectMillionDate(latest?.mrr ?? 0, growth, goal);
  const arpu = latest?.customers ? latest.mrr / latest.customers : 0;
  const customersToGoal = arpu ? Math.max(0, Math.ceil((goal / 12) / arpu) - (latest?.customers ?? 0)) : 0;

  // chart
  const W = 600, H = 180, P = 14;
  const data = snaps.length ? snaps : [{ date: "—", mrr: 0, customers: 0, at: Date.now() }];
  const maxMrr = Math.max(goal / 12, ...data.map((d) => d.mrr));
  const xs = (i: number) => P + (i * (W - P * 2)) / Math.max(1, data.length - 1);
  const ys = (v: number) => H - P - (v / (maxMrr || 1)) * (H - P * 2);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(d.mrr)}`).join(" ");

  // projection points (extrapolate forward 12 points)
  let projPath = "";
  if (latest && growth > 0 && data.length >= 1) {
    const start = data.length - 1;
    let v = latest.mrr;
    const pts: string[] = [`M ${xs(start)} ${ys(v)}`];
    const steps = 12;
    for (let k = 1; k <= steps; k++) {
      v = v * (1 + growth);
      const x = xs(start) + (k * (W - xs(start) - P)) / steps;
      pts.push(`L ${x} ${ys(Math.min(v, maxMrr))}`);
    }
    projPath = pts.join(" ");
  }

  const goalY = ys(goal / 12);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-end flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">MRR · ARR</div>
          <div className="text-3xl font-black">{fmt(latest?.mrr ?? 0)}<span className="text-white/40 text-base font-bold"> /mo</span></div>
          <div className="text-sm text-cyan2 mt-0.5">ARR {fmt(arr)} · {latest?.customers ?? 0} customers · ARPU {fmt(arpu || 0)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-white/50">Growth</div>
          <div className={"text-2xl font-black " + (growth > 0 ? "text-neon" : "text-white/60")}>
            {growth > 0 ? `+${(growth * 100).toFixed(1)}%` : "—"}<span className="text-xs text-white/50 font-normal"> /mo</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-4" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mrrLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#c4ff00" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <line x1={P} x2={W - P} y1={goalY} y2={goalY} stroke="#ff2bd6" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
        <text x={W - P} y={goalY - 4} fill="#ff2bd6" fontSize="10" textAnchor="end">$1M ARR</text>
        {projPath && <path d={projPath} fill="none" stroke="#ff2bd6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />}
        <path d={path} fill="none" stroke="url(#mrrLine)" strokeWidth="2.5" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={xs(i)} cy={ys(d.mrr)} r="3" fill="#fff">
            <title>{d.date}: {fmt(d.mrr)} · {d.customers} cust</title>
          </circle>
        ))}
      </svg>

      <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs uppercase tracking-widest text-white/50">$1M ARR ETA</div>
          <div className="font-bold mt-1">
            {projDate ? projDate.toDateString() : "Set MRR + show growth →"}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs uppercase tracking-widest text-white/50">Customers needed</div>
          <div className="font-bold mt-1">
            {arpu > 0 ? `${customersToGoal.toLocaleString()} more @ ${fmt(arpu)}/mo` : "Add customers + MRR →"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-2">
        <label className="text-xs text-white/60">MRR ($)
          <input type="number" value={mrr} onChange={(e) => setMrr(+e.target.value)} className="w-full mt-1" />
        </label>
        <label className="text-xs text-white/60">Customers
          <input type="number" value={customers} onChange={(e) => setCustomers(+e.target.value)} className="w-full mt-1" />
        </label>
        <div className="flex items-end">
          <button className="btn btn-primary w-full" onClick={log}>Log Today ({todayISO()})</button>
        </div>
      </div>
    </div>
  );
}
