"use client";

import Link from "../i18n/link";
import ExplainedText from "../ExplainedText";
import HeaderTools from "../i18n/HeaderTools";
import { tr, trDeep, useLocale, lh } from "../i18n/store";
import type { Topic } from "./topics";

/** Видимая часть тематической страницы; следует за языком интерфейса. */
export default function TopicBody({ topic: sourceTopic }: { topic: Topic }) {
  useLocale();
  const topic = trDeep(sourceTopic);
  return <>
    <header className="route-page-header"><Link className="brand" href="/" aria-label={tr("NOSTRES: на главную")}><span className="brand-mark" aria-hidden="true">N</span><span className="brand-copy"><b>NOSTRES</b><small>{tr("Понятный путь")}</small></span></Link><Link className="start-back" href="/">{tr("Все маршруты")}</Link><HeaderTools /></header>
    <div className="start-shell topic-shell">
      <nav aria-label={tr("Навигационная цепочка")} className="topic-crumbs"><Link href="/">{tr("Берлин")}</Link><span aria-hidden="true">/</span><span>{topic.title}</span></nav>
      <h1><ExplainedText text={topic.title} /></h1><p className="start-lede">{topic.lead}</p>
      <Link className="primary-action" href="/berlin/start">{tr("Ответить на вопросы и получить свой список дел →")}</Link>
      <section className="topic-facts" aria-labelledby="topic-facts-title"><h2 id="topic-facts-title">{tr("Что нужно проверить")}</h2>{topic.facts.map((fact) => <article key={fact.title}><h3>{fact.title}</h3><p>{fact.answer}</p><a href={lh(fact.source)} target="_blank" rel="noopener noreferrer">{tr("Официальный источник:")} {fact.sourceLabel} ↗</a></article>)}</section>
      <p className="topic-note">{tr("NOSTRES: самостоятельный сервис. Порядок и применимость зависят от вашей ситуации; окончательное решение принимает ответственное ведомство или страховая касса.")}</p>
    </div>
  </>;
}
