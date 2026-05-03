"use client";
import { Store } from "@/lib/storage";

export default function DataTools() {
  const exportJSON = () => {
    const data = {
      state: Store.getState(),
      entries: Store.getEntries(),
      challenges: Store.getChallenges(),
      milestones: Store.getMilestones(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `until-1m-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result as string);
        if (d.state) Store.setState(d.state);
        if (d.entries) Store.setEntries(d.entries);
        if (d.challenges) Store.setChallenges(d.challenges);
        if (d.milestones) Store.setMilestones(d.milestones);
        location.reload();
      } catch { alert("Invalid file"); }
    };
    r.readAsText(f);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-xl font-black">💾 Backup</h3>
      <p className="text-sm text-white/60 mt-1">Your data lives in this browser. Export regularly.</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        <button className="btn btn-primary" onClick={exportJSON}>Export JSON</button>
        <label className="btn btn-ghost cursor-pointer">
          Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={importJSON} />
        </label>
      </div>
    </div>
  );
}
