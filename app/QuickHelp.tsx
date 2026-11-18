"use client";

import { useState } from "react";
import { tr } from "./i18n/store";

/** Одноклик сразу после этапов: помог маршрут или нет. Подробная оценка ниже необязательна. */
export default function QuickHelp({ onVote }: { onVote: (vote: "quick_helpful" | "quick_not_helpful") => void }) {
  const [vote, setVote] = useState<"quick_helpful" | "quick_not_helpful" | null>(null);
  function choose(next: "quick_helpful" | "quick_not_helpful") {
    if (vote) return;
    setVote(next);
    onVote(next);
  }
  return (
    <aside className="quick-help" aria-live="polite">
      {!vote ? (
        <>
          <b>{tr("Маршрут вам помог?")}</b>
          <div className="quick-help-buttons">
            <button type="button" onClick={() => choose("quick_helpful")}>{tr("Да, помог")}</button>
            <button type="button" onClick={() => choose("quick_not_helpful")}>{tr("Нет, не помог")}</button>
          </div>
        </>
      ) : (
        <p>{tr("Спасибо! Ваш ответ записан.")} <a href="#route-evaluation">{tr("Рассказать подробнее (по желанию) ↓")}</a></p>
      )}
    </aside>
  );
}
