"use client";
import { useEffect, useState } from "react";
import { Store, type NetWorthSnapshot, type JourneyState } from "@/lib/storage";

export default function NetWorthChart({ state }: { state: JourneyState }) {
  const [snaps, setSnaps] = useState<NetWorthSnapshot[]>([]);
  useEffect(() => { setSnaps(Store.getSnapshots()); }, [state.netWorth]);

  const data = snaps.length ? snaps : [{ date: "start", amount: 0, at: Date.now() }];
  const max = Math.max(state.goal, ...data.map((d) => d.amount));
  const min = 0;
  const W = 600, H = 180, P = 12;
  const xs = (i: number) => P + (i * (W - P * 2)) / Math.max(1, data.length - 1);
  const ys = (v: number) => H - P - ((v - min) / (max - min || 1)) * (H - P * 2);

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(d.amount)}`).join(" ");
  const area = `${path} L ${xs(data.length - 1)} ${H - P} L ${xs(0)} ${H - P} Z`;

  const change = data.length > 1 ? data[data.length - 1].amount - data[0].amount : 0;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">Net Worth Curve</div>
          <div className="text-2xl font-black">{snaps.length} {snaps.length === 1 ? "snapshot" : "snapshots"}</div>
        </div>
        <div className={"text-sm font-bold " + (change >= 0 ? "text-neon" : "text-magenta")}>
          {change >= 0 ? "▲" : "▼"} ${Math.abs(change).toLocaleString()}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nwArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c4ff00" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c4ff00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nwLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#c4ff00" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#ff2bd6" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#nwArea)" />
        <path d={path} fill="none" stroke="url(#nwLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={xs(i)} cy={ys(d.amount)} r="3" fill="#fff">
            <title>{d.date}: ${d.amount.toLocaleString()}</title>
          </circle>
        ))}
      </svg>
      {snaps.length === 0 && <p className="text-xs text-white/40 mt-2">Update your net worth in Milestones to start the curve.</p>}
    </div>
  );
}
