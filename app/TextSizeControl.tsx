"use client";

import { useEffect, useState } from "react";
import { tr, useLocale } from "./i18n/store";

const sizes = [["normal", "Обычный", "A"], ["large", "Крупный", "A"], ["xlarge", "Очень крупный", "A"]] as const;
const KEY = "nostres-text-size";

/** Размер текста для людей с плохим зрением: увеличивает всю страницу, выбор запоминается на этом устройстве. */
export default function TextSizeControl() {
  useLocale();
  const [size, setSize] = useState("normal");
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const bottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
      if (y <= 240 || bottom || y < last - 4) setAway(false);
      else if (y > last + 4) setAway(true);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const saved = window.localStorage.getItem(KEY); if (saved === "large" || saved === "xlarge") setSize(saved); } catch { /* Размер работает и без сохранения. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function choose(value: string) {
    setSize(value);
    document.documentElement.setAttribute("data-text", value);
    try { window.localStorage.setItem(KEY, value); } catch { /* Размер работает и без сохранения. */ }
  }
  return <div className="text-size-control" data-open={open ? "true" : "false"} data-away={away && !open ? "true" : "false"}>
    <button className="text-size-toggle" type="button" aria-expanded={open} aria-controls="text-size-options" onClick={() => setOpen(!open)}><span aria-hidden="true">{tr("Аа")}</span><b>{tr("Размер текста")}</b></button>
    {open && <div id="text-size-options" className="text-size-options" role="group" aria-label={tr("Размер текста")}>
      {sizes.map(([value, label], index) => <button type="button" key={value} aria-pressed={size === value} className={size === value ? "selected" : ""} onClick={() => choose(value)}><span aria-hidden="true" style={{ fontSize: 15 + index * 5 }}>A</span>{label}</button>)}
    </div>}
  </div>;
}
