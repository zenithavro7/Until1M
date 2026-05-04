"use client";

export function fireConfetti() {
  if (typeof document === "undefined") return;
  const colors = ["#c4ff00", "#22d3ee", "#ff2bd6", "#7c3aed", "#ffffff"];
  const root = document.createElement("div");
  root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(root);
  for (let i = 0; i < 120; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 8;
    p.style.cssText = `
      position:absolute;top:-20px;left:${Math.random() * 100}%;
      width:${size}px;height:${size * 0.4}px;
      background:${colors[i % colors.length]};
      transform:rotate(${Math.random() * 360}deg);
      opacity:${0.7 + Math.random() * 0.3};
      border-radius:2px;
      animation: cf-fall ${1.6 + Math.random() * 1.6}s ${Math.random() * 0.4}s linear forwards;
    `;
    root.appendChild(p);
  }
  const style = document.createElement("style");
  style.textContent = `@keyframes cf-fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
  document.head.appendChild(style);
  setTimeout(() => { root.remove(); style.remove(); }, 4000);
}

export function playDing() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "triangle"; o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.start(); o.stop(ctx.currentTime + 0.65);
  } catch {}
}
