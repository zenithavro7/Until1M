"use client";
import { useEffect, useState } from "react";

const quotes = [
  "The clock is loud because the goal is louder.",
  "Compound the days. The years compound themselves.",
  "Boring consistency beats exciting intensity.",
  "You don't need permission to start. You need a timer.",
  "Discipline is freedom with a plan.",
  "If it scares you a little, it's the right move.",
  "Show up on the days you don't want to.",
];

export default function Quote() {
  const [q, setQ] = useState(quotes[0]);
  useEffect(() => {
    const day = Math.floor(Date.now() / 86400000);
    setQ(quotes[day % quotes.length]);
  }, []);
  return (
    <div className="text-center text-sm md:text-base text-white/70 italic">"{q}"</div>
  );
}
