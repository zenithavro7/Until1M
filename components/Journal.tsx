"use client";
import { useEffect, useState } from "react";
import { Store, todayISO, dayNumber, uid, type JournalEntry, type JourneyState } from "@/lib/storage";
import PhotoUpload from "./PhotoUpload";

export default function Journal({ state }: { state: JourneyState }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editing, setEditing] = useState<JournalEntry | null>(null);

  useEffect(() => { setEntries(Store.getEntries()); }, []);

  const save = (e: JournalEntry) => {
    const next = [e, ...entries.filter((x) => x.id !== e.id)].sort((a, b) => b.createdAt - a.createdAt);
    setEntries(next); Store.setEntries(next); setEditing(null);
  };

  const remove = (id: string) => {
    const next = entries.filter((x) => x.id !== id);
    setEntries(next); Store.setEntries(next);
  };

  const newEntry = (): JournalEntry => ({
    id: uid(), date: todayISO(), dayNumber: dayNumber(state.startedAt),
    title: "", didToday: "", lessons: "", mood: 3, energy: 3, win: "",
    photoIds: [], createdAt: Date.now(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">📓 Journal</h3>
        <button className="btn btn-primary" onClick={() => setEditing(newEntry())}>+ New Entry</button>
      </div>

      {editing && <Editor entry={editing} onSave={save} onCancel={() => setEditing(null)} />}

      <div className="grid md:grid-cols-2 gap-4">
        {entries.map((e) => (
          <div key={e.id} className="glass rounded-2xl p-5">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-neon">Day {e.dayNumber} · {e.date}</div>
                <h4 className="text-xl font-bold mt-1">{e.title || "Untitled"}</h4>
              </div>
              <div className="flex gap-2">
                <button className="text-xs underline text-white/60" onClick={() => setEditing(e)}>edit</button>
                <button className="text-xs underline text-white/60" onClick={() => remove(e.id)}>delete</button>
              </div>
            </div>
            {e.win && <p className="mt-3 text-sm"><span className="text-neon">★ Win:</span> {e.win}</p>}
            {e.didToday && <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{e.didToday}</p>}
            {e.lessons && <p className="mt-2 text-sm text-white/70 italic">💡 {e.lessons}</p>}
            <div className="flex gap-3 mt-3 text-xs text-white/50">
              <span>Mood {"●".repeat(e.mood)}</span>
              <span>Energy {"⚡".repeat(e.energy)}</span>
              {e.photoIds.length > 0 && <span>📸 {e.photoIds.length}</span>}
            </div>
          </div>
        ))}
        {entries.length === 0 && <div className="text-white/50 text-sm">No entries yet. Start writing your story.</div>}
      </div>
    </div>
  );
}

function Editor({ entry, onSave, onCancel }: { entry: JournalEntry; onSave: (e: JournalEntry) => void; onCancel: () => void }) {
  const [e, setE] = useState<JournalEntry>(entry);
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <input value={e.title} onChange={(ev) => setE({ ...e, title: ev.target.value })} placeholder="Title of the day" className="w-full text-xl font-bold" />
      <div className="grid md:grid-cols-2 gap-3">
        <input type="date" value={e.date} onChange={(ev) => setE({ ...e, date: ev.target.value })} />
        <input type="number" value={e.dayNumber} onChange={(ev) => setE({ ...e, dayNumber: +ev.target.value })} placeholder="Day #" />
      </div>
      <textarea value={e.didToday} onChange={(ev) => setE({ ...e, didToday: ev.target.value })} placeholder="What did you do today?" rows={4} className="w-full" />
      <textarea value={e.lessons} onChange={(ev) => setE({ ...e, lessons: ev.target.value })} placeholder="Lessons learned" rows={3} className="w-full" />
      <input value={e.win} onChange={(ev) => setE({ ...e, win: ev.target.value })} placeholder="Biggest win of the day" className="w-full" />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-white/70">Mood: {e.mood}
          <input type="range" min={1} max={5} value={e.mood} onChange={(ev) => setE({ ...e, mood: +ev.target.value })} className="w-full" />
        </label>
        <label className="text-sm text-white/70">Energy: {e.energy}
          <input type="range" min={1} max={5} value={e.energy} onChange={(ev) => setE({ ...e, energy: +ev.target.value })} className="w-full" />
        </label>
      </div>
      <PhotoUpload entry={e} onChange={(photoIds) => setE({ ...e, photoIds })} />
      <div className="flex gap-2 pt-2">
        <button className="btn btn-primary" onClick={() => onSave(e)}>Save Entry</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
