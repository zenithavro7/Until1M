"use client";
import { useEffect, useState } from "react";
import { Store, type Book, type BookNote } from "@/lib/storage";

const TYPE_META = {
  quote: { emoji: "💬", color: "#22d3ee" },
  insight: { emoji: "💡", color: "#c4ff00" },
  action: { emoji: "⚡", color: "#ff2bd6" },
} as const;

export default function DailyHighlight() {
  const [pair, setPair] = useState<{ note: BookNote; book: Book } | null>(null);

  const pick = () => {
    const notes = Store.getBookNotes();
    const books = Store.getBooks();
    if (!notes.length) { setPair(null); return; }
    const n = notes[Math.floor(Math.random() * notes.length)];
    const b = books.find((x) => x.id === n.bookId);
    if (b) setPair({ note: n, book: b });
  };

  useEffect(() => { pick(); }, []);

  if (!pair) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xl font-black">📖 From My Notes</h3>
        <p className="text-sm text-white/50 mt-2">Add book notes to resurface ideas here. The mind compounds when reminded.</p>
      </div>
    );
  }

  const { note, book } = pair;
  const meta = TYPE_META[note.type];

  return (
    <div className="glass rounded-2xl p-5" style={{ borderTop: `3px solid ${meta.color}` }}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-black">📖 From My Notes</h3>
        <button className="text-xs underline text-white/50" onClick={pick}>↻ another</button>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-white/50 mt-2">{meta.emoji} {note.type}</div>
      <p className={"mt-1 " + (note.type === "quote" ? "italic" : "")}>{note.text}</p>
      {note.apply && <p className="mt-2 text-sm text-neon">→ {note.apply}</p>}
      <div className="mt-3 text-xs text-white/50">— {book.title}, {book.author}</div>
    </div>
  );
}
