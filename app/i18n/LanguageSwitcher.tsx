"use client";

import { useEffect } from "react";
import { LOCALES, isLocale } from "./locales";
import { initLocale, switchLocale, tr, useLocale } from "./store";

/** Выбор языка интерфейса: каждый язык — отдельный адрес (/en/..., /de/...), выбор запоминается в браузере. */
export default function LanguageSwitcher() {
  const locale = useLocale();
  useEffect(() => { void initLocale(); }, []);
  return <label className="language-switcher"><span className="sr-only">{tr("Язык интерфейса")}</span>
    <select className="language-select" value={locale} onChange={(event) => { if (isLocale(event.target.value)) switchLocale(event.target.value); }}>
      {LOCALES.filter((item) => item.ready || item.code === locale).map((item) => <option key={item.code} value={item.code} lang={item.code}>{item.name}</option>)}
    </select>
  </label>;
}
