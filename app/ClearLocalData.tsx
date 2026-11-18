"use client";

import { useState } from "react";
import { clearAllNostresData } from "./clear-local-data";
import { tr, useLocale } from "./i18n/store";

export default function ClearLocalData() {
  useLocale();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  function clear() {
    const removed = clearAllNostresData();
    setConfirming(false);
    setMessage(removed > 0 ? "Готово. Сохранённые ответы и отметки удалены из этого браузера." : "В этом браузере не было сохранённых данных NOSTRES.");
  }

  return <div className="clear-data">
    {!confirming && <button className="official-secondary" type="button" onClick={() => { setMessage(""); setConfirming(true); }}>{tr("Удалить мои данные в этом браузере")}</button>}
    {confirming && <div role="group" aria-label={tr("Подтверждение удаления")}>
      <p>{tr("Все ответы, выбранные способы и отметки шагов будут удалены с этого устройства. Вернуть их будет нельзя.")}</p>
      <button className="primary-action" type="button" onClick={clear}>{tr("Да, удалить")}</button>{" "}
      <button className="official-secondary" type="button" onClick={() => setConfirming(false)}>{tr("Отмена")}</button>
    </div>}
    <p role="status">{message}</p>
  </div>;
}
