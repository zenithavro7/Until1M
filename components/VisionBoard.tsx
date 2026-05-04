"use client";
import { useEffect, useState } from "react";
import { Store, uid, type VisionItem } from "@/lib/storage";
import { savePhoto, loadPhoto, deletePhoto } from "@/lib/photos";

export default function VisionBoard() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => { setItems(Store.getVision()); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u: Record<string, string> = {};
      for (const it of items) {
        if (it.photoId) {
          const url = await loadPhoto(it.photoId);
          if (url) u[it.photoId] = url;
        }
      }
      if (!cancelled) setUrls(u);
    })();
    return () => { cancelled = true; };
  }, [items]);

  const persist = (next: VisionItem[]) => { setItems(next); Store.setVision(next); };

  const add = async (file: File | null, caption: string, link: string) => {
    let photoId: string | null = null;
    if (file) { photoId = uid(); await savePhoto(photoId, file); }
    persist([{ id: uid(), caption, link, photoId, createdAt: Date.now() }, ...items]);
  };

  const remove = async (it: VisionItem) => {
    if (it.photoId) await deletePhoto(it.photoId);
    persist(items.filter((x) => x.id !== it.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">🌌 Vision Board</h3>
      </div>

      <AddForm onAdd={add} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.id} className="glass rounded-2xl overflow-hidden group relative">
            {it.photoId && urls[it.photoId] ? (
              <img src={urls[it.photoId]} alt="" className="w-full h-48 object-cover" />
            ) : (
              <div className="h-48 flex items-center justify-center text-4xl bg-gradient-to-br from-electric/40 to-magenta/30">🌟</div>
            )}
            <div className="p-3">
              <p className="text-sm font-semibold">{it.caption || "—"}</p>
              {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-cyan2 underline">visit</a>}
            </div>
            <button onClick={() => remove(it)} className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full w-7 h-7 opacity-0 group-hover:opacity-100">×</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-white/50 text-sm">Pin what you're chasing. Make it visible. Make it real.</p>}
      </div>
    </div>
  );
}

function AddForm({ onAdd }: { onAdd: (file: File | null, caption: string, link: string) => void }) {
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="glass rounded-2xl p-4 space-y-2">
      <input className="w-full" placeholder="What is it? (Aston Martin, beach house, freedom…)" value={caption} onChange={(e) => setCaption(e.target.value)} />
      <input className="w-full" placeholder="Optional link" value={link} onChange={(e) => setLink(e.target.value)} />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="btn btn-primary" onClick={() => { onAdd(file, caption, link); setCaption(""); setLink(""); setFile(null); }}>Pin to board</button>
    </div>
  );
}
