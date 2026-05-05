"use client";
import { useEffect, useMemo, useState } from "react";
import { Store, todayISO, uid, type Book, type BookNote, type BookNoteType, type BookStatus, type Idea } from "@/lib/storage";
import { savePhoto, loadPhoto, deletePhoto } from "@/lib/photos";

const TYPE_META: Record<BookNoteType, { emoji: string; label: string; color: string }> = {
  quote:   { emoji: "💬", label: "Quote",   color: "#22d3ee" },
  insight: { emoji: "💡", label: "Insight", color: "#c4ff00" },
  action:  { emoji: "⚡", label: "Action",  color: "#ff2bd6" },
};

export default function BookNotes() {
  const [books, setBooks] = useState<Book[]>([]);
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | BookStatus>("all");
  const [search, setSearch] = useState("");
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    setBooks(Store.getBooks());
    setNotes(Store.getBookNotes());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u: Record<string, string> = {};
      for (const b of books) {
        if (b.coverPhotoId) {
          const url = await loadPhoto(b.coverPhotoId);
          if (url) u[b.coverPhotoId] = url;
        }
      }
      if (!cancelled) setCovers(u);
    })();
    return () => { cancelled = true; };
  }, [books]);

  const persistBooks = (n: Book[]) => { setBooks(n); Store.setBooks(n); };
  const persistNotes = (n: BookNote[]) => { setNotes(n); Store.setBookNotes(n); };

  const visibleBooks = useMemo(() => {
    let b = books;
    if (filter !== "all") b = b.filter((x) => x.status === filter);
    return b.sort((a, b) => b.createdAt - a.createdAt);
  }, [books, filter]);

  const matchedNotes = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.toLowerCase();
    return notes.filter((n) => (n.text + " " + n.apply).toLowerCase().includes(s));
  }, [notes, search]);

  const open = openId ? books.find((b) => b.id === openId) : null;
  const openNotes = openId ? notes.filter((n) => n.bookId === openId) : [];

  const removeBook = async (b: Book) => {
    if (!confirm(`Delete "${b.title}" and all its notes?`)) return;
    if (b.coverPhotoId) await deletePhoto(b.coverPhotoId);
    persistBooks(books.filter((x) => x.id !== b.id));
    persistNotes(notes.filter((n) => n.bookId !== b.id));
    setOpenId(null);
  };

  const convertToIdea = (n: BookNote, book: Book) => {
    const ideas = Store.getIdeas();
    const idea: Idea = {
      id: uid(),
      title: n.text.length > 80 ? n.text.slice(0, 80) + "…" : n.text,
      pitch: `From "${book.title}" by ${book.author}.\n${n.apply || ""}`.trim(),
      market: 3, edge: 3, pain: 3, leverage: 3,
      status: "active", killReason: "", createdAt: Date.now(),
    };
    Store.setIdeas([idea, ...ideas]);
    alert("Pushed to Idea Inbox →");
  };

  if (open) {
    return <BookDetail
      book={open}
      coverUrl={open.coverPhotoId ? covers[open.coverPhotoId] : undefined}
      notes={openNotes}
      onBack={() => setOpenId(null)}
      onUpdate={(b) => persistBooks(books.map((x) => x.id === b.id ? b : x))}
      onDelete={() => removeBook(open)}
      onAddNote={(n) => persistNotes([n, ...notes])}
      onUpdateNote={(n) => persistNotes(notes.map((x) => x.id === n.id ? n : x))}
      onRemoveNote={(id) => persistNotes(notes.filter((x) => x.id !== id))}
      onConvertToIdea={(n) => convertToIdea(n, open)}
    />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-2xl font-black">📚 Library & Notes</h3>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔎 search notes…" className="w-56" />
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add Book</button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "reading", "finished", "abandoned"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={"px-3 py-1 rounded-full text-xs uppercase tracking-widest border " + (filter === s ? "tab-active border-neon text-white" : "border-white/10 text-white/60")}>
            {s} ({s === "all" ? books.length : books.filter((b) => b.status === s).length})
          </button>
        ))}
      </div>

      {adding && <AddBook onCancel={() => setAdding(false)} onAdd={(b) => { persistBooks([b, ...books]); setAdding(false); }} />}

      {search.trim() && (
        <div className="glass rounded-2xl p-4">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-2">Note matches ({matchedNotes.length})</div>
          <div className="space-y-2">
            {matchedNotes.map((n) => {
              const b = books.find((x) => x.id === n.bookId);
              return (
                <button key={n.id} onClick={() => { setSearch(""); setOpenId(n.bookId); }} className="block w-full text-left rounded-xl border border-white/10 p-3 hover:border-neon/50">
                  <div className="text-xs text-cyan2">{TYPE_META[n.type].emoji} {b?.title}</div>
                  <div className="text-sm">{n.text}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleBooks.map((b) => {
          const noteCount = notes.filter((n) => n.bookId === b.id).length;
          return (
            <button key={b.id} onClick={() => setOpenId(b.id)} className="glass rounded-2xl overflow-hidden text-left hover:border-neon/50 transition">
              <div className="aspect-[2/3] relative">
                {b.coverPhotoId && covers[b.coverPhotoId] ? (
                  <img src={covers[b.coverPhotoId]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-electric/40 to-cyan2/30">📖</div>
                )}
                <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/60 border border-white/10">
                  {b.status}
                </div>
                {b.rating > 0 && (
                  <div className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/60 border border-neon/40 text-neon">
                    {"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)}
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="font-bold leading-tight line-clamp-2">{b.title}</div>
                <div className="text-xs text-white/50 mt-0.5">{b.author}</div>
                <div className="text-xs text-neon mt-2">📝 {noteCount} note{noteCount === 1 ? "" : "s"}</div>
              </div>
            </button>
          );
        })}
        {visibleBooks.length === 0 && !adding && <p className="text-white/50 text-sm col-span-full">No books yet. Read like your future depends on it.</p>}
      </div>
    </div>
  );
}

function AddBook({ onCancel, onAdd }: { onCancel: () => void; onAdd: (b: Book) => void }) {
  const [b, setB] = useState<Book>(empty());
  const [file, setFile] = useState<File | null>(null);

  const save = async () => {
    if (!b.title.trim()) return;
    let coverPhotoId = b.coverPhotoId;
    if (file) { coverPhotoId = uid(); await savePhoto(coverPhotoId, file); }
    onAdd({ ...b, coverPhotoId });
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="grid md:grid-cols-2 gap-2">
        <input className="font-bold" placeholder="Book title" value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })} />
        <input placeholder="Author" value={b.author} onChange={(e) => setB({ ...b, author: e.target.value })} />
      </div>
      <input placeholder="Topics (comma separated, e.g. sales, AI, mental models)" onChange={(e) => setB({ ...b, topics: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
      <div className="grid md:grid-cols-3 gap-2">
        <select value={b.status} onChange={(e) => setB({ ...b, status: e.target.value as BookStatus })}>
          <option value="reading">reading</option>
          <option value="finished">finished</option>
          <option value="abandoned">abandoned</option>
        </select>
        <input type="date" value={b.startedAt} onChange={(e) => setB({ ...b, startedAt: e.target.value })} />
        <input type="date" value={b.finishedAt} onChange={(e) => setB({ ...b, finishedAt: e.target.value })} placeholder="Finished" />
      </div>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={save}>Add to library</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function BookDetail(props: {
  book: Book; coverUrl?: string; notes: BookNote[];
  onBack: () => void;
  onUpdate: (b: Book) => void;
  onDelete: () => void;
  onAddNote: (n: BookNote) => void;
  onUpdateNote: (n: BookNote) => void;
  onRemoveNote: (id: string) => void;
  onConvertToIdea: (n: BookNote) => void;
}) {
  const { book, coverUrl, notes, onBack, onUpdate, onDelete, onAddNote, onUpdateNote, onRemoveNote, onConvertToIdea } = props;
  const [type, setType] = useState<BookNoteType>("insight");
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [apply, setApply] = useState("");

  const add = () => {
    if (!text.trim()) return;
    onAddNote({ id: uid(), bookId: book.id, type, text, page, apply, done: false, createdAt: Date.now() });
    setText(""); setPage(""); setApply("");
  };

  const counts = {
    quote: notes.filter((n) => n.type === "quote").length,
    insight: notes.filter((n) => n.type === "insight").length,
    action: notes.filter((n) => n.type === "action").length,
  };

  return (
    <div className="space-y-4">
      <button className="text-xs underline text-white/60" onClick={onBack}>← back to library</button>

      <div className="glass rounded-2xl p-5 flex gap-4 flex-wrap">
        <div className="w-32 h-48 shrink-0 rounded-xl overflow-hidden border border-white/10">
          {coverUrl ? <img src={coverUrl} alt="" className="w-full h-full object-cover" /> :
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-electric/40 to-cyan2/30">📖</div>}
        </div>
        <div className="flex-1 min-w-[260px] space-y-2">
          <input className="w-full text-2xl font-black" value={book.title} onChange={(e) => onUpdate({ ...book, title: e.target.value })} />
          <input className="w-full" placeholder="Author" value={book.author} onChange={(e) => onUpdate({ ...book, author: e.target.value })} />
          <textarea className="w-full" rows={2} placeholder="🎯 In one sentence: what would you tell someone about this book?" value={book.oneLine} onChange={(e) => onUpdate({ ...book, oneLine: e.target.value })} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <select value={book.status} onChange={(e) => onUpdate({ ...book, status: e.target.value as BookStatus })}>
              <option value="reading">reading</option>
              <option value="finished">finished</option>
              <option value="abandoned">abandoned</option>
            </select>
            <select value={book.rating} onChange={(e) => onUpdate({ ...book, rating: +e.target.value })}>
              <option value={0}>no rating</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
            </select>
            <button className="btn btn-ghost text-xs" onClick={onDelete}>delete book</button>
          </div>
          <div className="flex gap-3 text-xs text-white/60">
            <span>💬 {counts.quote}</span>
            <span>💡 {counts.insight}</span>
            <span>⚡ {counts.action}</span>
          </div>
          {book.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {book.topics.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest text-white/60">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-2">
        <div className="flex gap-2">
          {(["quote", "insight", "action"] as BookNoteType[]).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={"px-3 py-1 rounded-full text-xs uppercase tracking-widest border " + (type === t ? "border-neon text-white" : "border-white/10 text-white/60")}
              style={type === t ? { background: TYPE_META[t].color + "20" } : {}}>
              {TYPE_META[t].emoji} {TYPE_META[t].label}
            </button>
          ))}
        </div>
        <textarea className="w-full" rows={3} placeholder={
          type === "quote" ? "Type the quote…" :
          type === "insight" ? "What's the insight?" :
          "What action will you take?"
        } value={text} onChange={(e) => setText(e.target.value)} />
        <div className="grid md:grid-cols-2 gap-2">
          <input placeholder="Page / chapter (optional)" value={page} onChange={(e) => setPage(e.target.value)} />
          <input placeholder="Apply to my startup… (where most book wisdom dies)" value={apply} onChange={(e) => setApply(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={add}>+ Save Note</button>
      </div>

      <div className="space-y-2">
        {notes.sort((a, b) => b.createdAt - a.createdAt).map((n) => (
          <div key={n.id} className="glass rounded-2xl p-4" style={{ borderLeft: `3px solid ${TYPE_META[n.type].color}` }}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-white/50">
                  {TYPE_META[n.type].emoji} {TYPE_META[n.type].label}{n.page && <> · p.{n.page}</>}
                </div>
                <p className={"mt-1 " + (n.type === "quote" ? "italic" : "")}>{n.text}</p>
                {n.apply && <p className="mt-2 text-sm text-neon">→ {n.apply}</p>}
              </div>
              <div className="flex flex-col gap-1 text-xs shrink-0 items-end">
                {n.type === "action" && (
                  <button className={"underline " + (n.done ? "text-white/40 line-through" : "text-cyan2")} onClick={() => onUpdateNote({ ...n, done: !n.done })}>
                    {n.done ? "undo" : "mark done"}
                  </button>
                )}
                <button className="underline text-white/60" onClick={() => onConvertToIdea(n)}>→ idea</button>
                <button className="underline text-white/40" onClick={() => onRemoveNote(n.id)}>×</button>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 && <p className="text-white/50 text-sm">No notes yet. Quote what hits. Capture the insight. Define the action.</p>}
      </div>
    </div>
  );
}

function empty(): Book {
  return {
    id: uid(), title: "", author: "", coverPhotoId: null, status: "reading",
    rating: 0, oneLine: "", topics: [], startedAt: todayISO(), finishedAt: "",
    createdAt: Date.now(),
  };
}
