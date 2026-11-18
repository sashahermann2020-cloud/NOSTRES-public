"use client";

import { useEffect, useRef, useState } from "react";
import { tr, lh, useLocale } from "./i18n/store";
import { splitLocalePath } from "./i18n/locales";

/**
 * Кнопка «Поделиться». На телефоне открывает системное меню (мессенджеры, почта и другие приложения).
 * Если системного меню нет, показывает небольшое окно: Telegram, WhatsApp, почта и копирование ссылки.
 * Делится только чистой ссылкой на сайт, без ответов и сохранённого прогресса.
 */
export default function ShareButton({ variant = "icon", path = "/" }: { variant?: "icon" | "text" | "link"; path?: string }) {
  useLocale();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const [url, setUrl] = useState("");
  const root = useRef<HTMLSpanElement>(null);
  const label = tr("Поделиться NOSTRES");
  const message = tr("Планируете переезд в Берлин? Попробуйте NOSTRES. Сервис помогает составить личный план дел после переезда и перейти к официальным источникам.");

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", key); };
  }, [open]);

  async function start() {
    const clean = path === "current" ? splitLocalePath(window.location.pathname).path : path;
    const link = new URL(lh(clean), window.location.origin).toString();
    setUrl(link);
    setStatus("idle");
    if (open) { setOpen(false); return; }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "NOSTRES", text: message, url: link });
        return;
      } catch (error) {
        if (typeof error === "object" && error !== null && "name" in error && error.name === "AbortError") return;
      }
    }
    setOpen(true);
  }

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); setStatus("copied"); return; }
    } catch { /* ниже покажем ссылку для ручного копирования */ }
    setStatus("manual");
  }

  const text = encodeURIComponent(message);
  const link = encodeURIComponent(url);
  return (
    <span className={`share-button share-${variant}`} ref={root}>
      <button type="button" className={`share-trigger${variant === "text" ? " start-secondary" : ""}`} onClick={() => void start()} aria-haspopup="true" aria-expanded={open} aria-label={variant === "icon" ? label : undefined} title={label}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
        {variant !== "icon" && <span>{tr("Поделиться")}</span>}
      </button>
      {open && (
        <div className="share-menu" role="group" aria-label={label}>
          <a href={`https://t.me/share/url?url=${link}&text=${text}`} target="_blank" rel="noreferrer">Telegram</a>
          <a href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={`mailto:?subject=NOSTRES&body=${text}%0A%0A${link}`}>{tr("Электронная почта")}</a>
          <button type="button" onClick={() => void copy()}>{tr("Скопировать ссылку")}</button>
          {status === "copied" && <p role="status" aria-live="polite">{tr("Ссылка скопирована. Теперь её можно отправить знакомому.")}</p>}
          {status === "manual" && <>
            <p role="status" aria-live="polite">{tr("Не удалось скопировать ссылку автоматически. Выделите её в поле ниже и скопируйте вручную.")}</p>
            <input type="text" readOnly value={url} dir="ltr" aria-label={tr("Ссылка для отправки")} onFocus={(event) => event.currentTarget.select()} />
          </>}
        </div>
      )}
    </span>
  );
}

/** Компактный призыв поделиться после завершения маршрута. */
export function ShareAfterRoute() {
  useLocale();
  return (
    <aside className="share-after">
      <p>{tr("Маршрут пригодился? Отправьте его тому, кому он тоже нужен.")}</p>
      <ShareButton variant="text" path="current" />
    </aside>
  );
}
