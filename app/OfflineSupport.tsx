"use client";

import { useEffect, useState } from "react";
import { currentLocale, trf, tr, useLocale } from "./i18n/store";

/**
 * Работа без сети (PROJECT_SPEC.md, «Установка на устройство»): регистрирует public/sw.js,
 * который сохраняет открытые страницы, и показывает пометку, когда сети нет и открыта сохранённая копия.
 * При работающем интернете страница всегда загружается заново, поэтому пометка видна только без сети.
 */
export default function OfflineSupport() {
  useLocale();
  const [offline, setOffline] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Страница, открытая до начала работы сохранения, прошла мимо него: передаём её адрес и файлы отдельно.
    const uncontrolled = !navigator.serviceWorker.controller;
    navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready).then((registration) => {
      if (!uncontrolled) return;
      const send = (withPage: boolean) => {
        const files = performance.getEntriesByType("resource").map((entry) => entry.name).filter((name) => name.startsWith(location.origin));
        registration.active?.postMessage({ type: "nostres-save", page: withPage ? location.href : null, urls: withPage ? [location.href, ...files] : files });
      };
      send(true);
      // Словари и файлы, загруженные позже, передаются ещё раз через несколько секунд.
      window.setTimeout(() => send(false), 5000);
    }).catch(() => { /* сайт работает и без сохранения копий */ });
  }, []);

  useEffect(() => {
    const update = async () => {
      const isOffline = !navigator.onLine;
      setOffline(isOffline);
      if (!isOffline || !("caches" in window)) return;
      try {
        const saved = await caches.match(location.origin + location.pathname);
        const iso = saved?.headers.get("x-nostres-saved");
        setSavedAt(iso ? new Date(iso).toLocaleDateString(currentLocale(), { day: "numeric", month: "long", year: "numeric" }) : null);
      } catch { setSavedAt(null); }
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  if (!offline) return null;
  return <div className="offline-notice" role="status">
    <b>{tr("Нет подключения к интернету")}</b>
    <span>{savedAt ? trf("Это копия страницы от {date}: она сохранена на этом устройстве. Условия могли измениться: когда интернет появится, страница загрузится заново.", { date: savedAt }) : tr("Это сохранённая копия страницы. Условия могли измениться: когда интернет появится, страница загрузится заново.")}</span>
  </div>;
}
