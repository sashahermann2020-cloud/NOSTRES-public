"use client";

import { useEffect, useRef, useState } from "react";
import { tr } from "./i18n/store";

export default function PlacePicker() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) { if (event.key === "Escape") setOpen(false); return; }
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  return (
    <div className="place-picker" ref={box}>
      <button className="place-button" type="button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="place-pin" aria-hidden="true" />
        <span>{tr("Германия")} <span className="place-sep">›</span> {tr("Берлин")}</span>
        <span className="theme-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="place-menu" role="menu" aria-label={tr("Место")}>
          <p className="place-menu-title">{tr("Германия")}</p>
          <button className="place-item active" type="button" role="menuitem" onClick={() => setOpen(false)}>{tr("Берлин")}</button>
          <p className="place-soon">{tr("Скоро: другие города и страны")}</p>
        </div>
      )}
    </div>
  );
}
