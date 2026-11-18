"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { tr, useLocale } from "./i18n/store";
import { detectPlatform, type InstallPlatform } from "./install-platform";

/**
 * Кнопка «Установить NOSTRES»: значок сервиса на главном экране телефона или в списке программ компьютера.
 * Это тот же сайт в отдельном окне, а не отдельное мобильное приложение (см. PROJECT_SPEC.md, «Установка на устройство»).
 * Chrome, Edge и другие браузеры на Chromium показывают системное окно установки.
 * Где такого окна нет (iPhone, Safari на Mac, остальные браузеры), открывается короткая подсказка.
 * Уже установленное приложение кнопку не показывает. Никакие данные не отправляются.
 */

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

// Событие приходит один раз и может прийти раньше, чем кнопка появится на странице, поэтому слушаем его сразу.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => { deferred = event as InstallPromptEvent; notify(); });
  window.addEventListener("appinstalled", () => { deferred = null; installed = true; notify(); });
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const canPrompt = () => deferred !== null;

function isStandalone(): boolean {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch { return false; }
}

export default function InstallButton({ variant = "icon" }: { variant?: "icon" | "link" }) {
  useLocale();
  const promptReady = useSyncExternalStore(subscribe, canPrompt, () => false);
  const appInstalled = useSyncExternalStore(subscribe, () => installed, () => false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const label = tr("Установить NOSTRES на телефон или компьютер");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHidden(isStandalone());
      setPlatform(detectPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints ?? 0));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", key); };
  }, [open]);

  async function start() {
    if (open) { setOpen(false); return; }
    const event = deferred;
    if (event) {
      try {
        await event.prompt();
        const choice = await event.userChoice;
        deferred = null; notify();
        if (choice.outcome === "accepted") setHidden(true);
        return;
      } catch { deferred = null; notify(); }
    }
    setOpen(true);
  }

  if (hidden || appInstalled) return null;
  const steps = platform === "ios"
    ? [tr("Нажмите кнопку «Поделиться». В Safari на iOS 26 она находится в меню «•••» рядом с адресной строкой."), tr("Выберите «На экран „Домой“» и нажмите «Добавить».")]
    : platform === "mac-safari"
      ? [tr("В меню Safari выберите «Файл» → «Добавить в Dock». Это работает в macOS Sonoma и новее.")]
      : [tr("Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран»."), tr("Если такого пункта нет, откройте nostres.world в Chrome, Edge или Safari.")];
  const result = platform === "ios"
    ? tr("Значок NOSTRES появится на экране «Домой». Прогресс в установленном приложении хранится отдельно от Safari: маршрут, начатый в браузере, там не появится.")
    : platform === "mac-safari"
      ? tr("NOSTRES будет открываться отдельным окном из Dock.")
      : tr("Значок NOSTRES появится на главном экране или в списке программ, а сервис будет открываться в отдельном окне.");

  return (
    <span className={`share-button share-${variant} install-button`} ref={root}>
      <button ref={trigger} type="button" className="share-trigger" onClick={() => void start()} aria-haspopup={promptReady ? undefined : "true"} aria-expanded={promptReady ? undefined : open} aria-label={variant === "icon" ? label : undefined} title={label}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19h14" /></svg>
        {variant !== "icon" && <span>{tr("Установить на телефон или компьютер")}</span>}
      </button>
      {open && (
        <div className="share-menu install-menu" role="group" aria-label={label}>
          <p className="install-menu-title">{tr("Как установить NOSTRES")}</p>
          <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <p>{result}</p>
        </div>
      )}
    </span>
  );
}
