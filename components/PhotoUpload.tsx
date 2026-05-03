"use client";
import { useEffect, useState } from "react";
import { savePhoto, loadPhoto, deletePhoto } from "@/lib/photos";
import { uid, type JournalEntry } from "@/lib/storage";

export default function PhotoUpload({ entry, onChange }: { entry: JournalEntry; onChange: (ids: string[]) => void }) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u: Record<string, string> = {};
      for (const id of entry.photoIds) {
        const url = await loadPhoto(id);
        if (url) u[id] = url;
      }
      if (!cancelled) setUrls(u);
    })();
    return () => { cancelled = true; };
  }, [entry.photoIds]);

  const handle = async (files: FileList | null) => {
    if (!files) return;
    const newIds: string[] = [];
    for (const f of Array.from(files)) {
      const id = uid();
      await savePhoto(id, f);
      newIds.push(id);
    }
    onChange([...entry.photoIds, ...newIds]);
  };

  const remove = async (id: string) => {
    await deletePhoto(id);
    onChange(entry.photoIds.filter((x) => x !== id));
  };

  return (
    <div>
      <label className="text-sm text-white/70 block mb-2">📸 Photos of the day</label>
      <input type="file" accept="image/*" multiple onChange={(e) => handle(e.target.files)} />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-3">
        {entry.photoIds.map((id) => (
          <div key={id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
            {urls[id] ? <img src={urls[id]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
            <button onClick={() => remove(id)} className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full w-6 h-6">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
