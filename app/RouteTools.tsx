"use client";

import { useState } from "react";
import { issueTypeLabels, type SummarySource } from "./route-summary";
import { tr, useLocale } from "./i18n/store";

type Props = { routeId: string; routeSlug: string; getAttemptId: () => string; summaryText: string; sources: SummarySource[]; onEvent?: (eventName: string) => void };

async function post(payload: Record<string, unknown>) {
  const response = await fetch("/api/mvp-events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
  if (!response.ok) throw new Error("not saved");
}

export default function RouteTools({ routeId, routeSlug, getAttemptId, summaryText, sources, onEvent }: Props) {
  useLocale();
  const [showText, setShowText] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [reportState, setReportState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function copy() {
    try { await navigator.clipboard.writeText(summaryText); setCopyState("Сводка скопирована."); onEvent?.("summary_copied"); }
    catch { setShowText(true); setCopyState("Не удалось скопировать автоматически. Выделите текст ниже и скопируйте его вручную."); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([summaryText], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `nostres-${routeSlug}.txt`; document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    setCopyState("Файл со сводкой скачан."); onEvent?.("summary_downloaded");
  }
  function print() {
    setShowText(true); onEvent?.("summary_printed");
    window.setTimeout(() => window.print(), 80);
  }
  async function report() {
    if (!sourceId || !issueType) return;
    setReportState("sending");
    try { await post({ kind: "issue", routeId, attemptId: getAttemptId(), sourceId, issueType }); setReportState("sent"); onEvent?.("issue_reported"); }
    catch { setReportState("error"); }
  }

  return <>
    <section className="route-section route-summary-export print-summary" aria-labelledby={`summary-${routeSlug}`}>
      <div className="route-section-heading"><div><p className="overline">{tr("Сводка")}</p><h2 id={`summary-${routeSlug}`}>{tr("Сохранить план")}</h2></div></div>
      <p className="questionnaire-intro">{tr("Текстовая сводка без личных данных: порядок шагов, отметки и ссылки на официальные страницы.")}</p>
      <div className="summary-actions">
        <button className="official-secondary" type="button" onClick={copy}>{tr("Скопировать")}</button>
        <button className="official-secondary" type="button" onClick={download}>{tr("Скачать .txt")}</button>
        <button className="official-secondary" type="button" onClick={print}>{tr("Распечатать")}</button>
        <button className="official-secondary" type="button" aria-expanded={showText} onClick={() => setShowText(!showText)}>{showText ? tr("Скрыть текст") : tr("Показать текст")}</button>
      </div>
      <p role="status">{copyState}</p>
      {showText && <pre className="summary-text" tabIndex={0} aria-label={tr("Текст сводки")}>{summaryText}</pre>}
    </section>
    {sources.length > 0 && <details className="route-section route-report">
      <summary>{tr("Нашли ошибку или устаревшую ссылку?")}</summary>
      <p className="questionnaire-intro">{tr("Сообщение анонимно: в нём только выбранная страница и тип проблемы.")}</p>
      <div className="new-route-feedback">
        <label>{tr("Какая страница")}<select value={sourceId} onChange={(event) => { setSourceId(event.target.value); setReportState("idle"); }}><option value="">{tr("Выберите")}</option>{sources.map((source) => <option value={source.id} key={source.id}>{tr(source.label)}</option>)}</select></label>
        <label>{tr("Что не так")}<select value={issueType} onChange={(event) => { setIssueType(event.target.value); setReportState("idle"); }}><option value="">{tr("Выберите")}</option>{issueTypeLabels.map(([value, label]) => <option value={value} key={value}>{tr(label)}</option>)}</select></label>
      </div>
      <button className="primary-action" type="button" disabled={!sourceId || !issueType || reportState === "sending" || reportState === "sent"} onClick={report}>{tr("Отправить сообщение")}</button>
      {reportState === "sent" && <p role="status">{tr("Спасибо. Сообщение сохранено, мы проверим источник.")}</p>}
      {reportState === "error" && <p role="alert">{tr("Не удалось отправить сообщение. Попробуйте ещё раз.")}</p>}
    </details>}
  </>;
}
