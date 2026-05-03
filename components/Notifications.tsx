"use client";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [perm, setPerm] = useState<NotificationPermission>("default");
  const [time, setTime] = useState<string>("21:00");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
    setTime(localStorage.getItem("u1m:notifTime") || "21:00");
  }, []);

  useEffect(() => {
    if (perm !== "granted") return;
    const i = setInterval(() => {
      const now = new Date();
      const [h, m] = time.split(":").map(Number);
      const last = localStorage.getItem("u1m:lastNotif");
      const today = now.toISOString().slice(0, 10);
      if (now.getHours() === h && now.getMinutes() === m && last !== today) {
        new Notification("Time to journal 🪙", { body: "One more day on the road to $1M. What did you build today?" });
        localStorage.setItem("u1m:lastNotif", today);
      }
    }, 30_000);
    return () => clearInterval(i);
  }, [perm, time]);

  const enable = async () => {
    if (typeof Notification === "undefined") return alert("Notifications not supported in this browser.");
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") new Notification("You're locked in 🔥", { body: "Daily reminders are on. Let's get to a million." });
  };

  const saveTime = (v: string) => { setTime(v); localStorage.setItem("u1m:notifTime", v); };

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-xl font-black">🔔 Daily Reminder</h3>
      <p className="text-sm text-white/60 mt-1">Permission: <b className={perm === "granted" ? "text-neon" : "text-white/80"}>{perm}</b></p>
      <div className="flex gap-2 mt-3 items-center">
        <input type="time" value={time} onChange={(e) => saveTime(e.target.value)} />
        {perm !== "granted" && <button className="btn btn-primary" onClick={enable}>Enable</button>}
      </div>
      <p className="text-xs text-white/40 mt-2">Keep this tab open for in-browser pings. (For true push, deploy with a service worker.)</p>
    </div>
  );
}
