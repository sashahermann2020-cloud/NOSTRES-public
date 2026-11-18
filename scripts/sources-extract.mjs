#!/usr/bin/env node
// Собирает worker/route-sources.json: для каждого маршрута — адрес страницы, название, дата сверки,
// срок повторной сверки и все официальные страницы, которые маршрут показывает хоть при одном наборе ответов.
// По этому файлу отчёт об актуальности (worker/freshness.ts) понимает, какой маршрут затронут изменением страницы.
// Запуск: node scripts/sources-extract.mjs; --check только сверяет файл с кодом (используется тестом).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";
import { journeys, anmeldungProblems, taxIdProblems, healthProblems } from "../app/nostres-data.ts";
import { channelMatrices } from "../app/channels.ts";
import { routeCheckedAt, routeReviewDays, DEFAULT_REVIEW_DAYS, isoDate, sourceReviewedAt } from "../app/route-checks.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(join(root, "docs/ROUTE_REGISTRY.json"), "utf8")).routes;
const JOURNEYS = { anmeldung: anmeldungProblems, "tax-id": taxIdProblems, health: healthProblems };
// Матрица способов связи, которую маршрут показывает (GuidedRoute.tsx и AnmeldungJourney.tsx).
const MATRICES = { wbs: ["housing-wbs"], dog: ["dog", "dog-listed"] };

function urlsIn(value, out) {
  if (typeof value === "string") {
    for (const match of value.matchAll(/https?:\/\/[^"'`)\s<>\\]+/g)) {
      try { out.add(new URL(match[0].replace(/[.,;]+$/, "")).toString()); } catch { /* не адрес */ }
    }
  } else if (Array.isArray(value)) value.forEach((item) => urlsIn(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => urlsIn(item, out));
  return out;
}

export function collectRouteSources() {
  const routes = [];
  for (const [id, checked] of Object.entries(routeCheckedAt)) {
    const urls = new Set();
    if (id in JOURNEYS) {
      urlsIn(journeys.find((journey) => journey.id === id), urls);
      urlsIn(JOURNEYS[id], urls);
    } else {
      let plans = 0;
      (function walk(answers) {
        const questions = questionsFor(id, answers);
        urlsIn(questions, urls);
        const next = questions.find((question) => !answers[question.id]);
        if (!next) { if (plans++ < 100000) urlsIn(planFor(id, answers), urls); return; }
        next.options.forEach(([value]) => walk({ ...answers, [next.id]: value }));
      })({});
    }
    for (const matrix of MATRICES[id] ?? [id]) if (channelMatrices[matrix]) urlsIn(channelMatrices[matrix], urls);
    const entry = registry.find((route) => (route.routeId ?? (route.path === "/berlin/anmeldung" ? "anmeldung" : null)) === id && route.kind !== "topic");
    if (!entry) throw new Error(`Маршрута ${id} нет в docs/ROUTE_REGISTRY.json`);
    const sources = [...urls].filter((url) => !/^https?:\/\/(nostres\.world|localhost)\b/.test(url)).sort();
    if (!sources.length) throw new Error(`У маршрута ${id} не найдено ни одной официальной страницы`);
    routes.push({
      id,
      path: entry.path,
      title: entry.title.replace(/ \| NOSTRES$/, ""),
      checkedAt: isoDate(checked),
      reviewDays: routeReviewDays[id] ?? DEFAULT_REVIEW_DAYS,
      sources,
      ...(() => {
        const reviewed = Object.fromEntries(sources.filter((url) => sourceReviewedAt[url]).map((url) => [url, sourceReviewedAt[url]]));
        return Object.keys(reviewed).length ? { reviewed } : {};
      })(),
    });
  }
  const known = new Set(routes.flatMap((route) => route.sources));
  for (const url of Object.keys(sourceReviewedAt)) if (!known.has(url)) throw new Error(`sourceReviewedAt: ${url} не используется ни одним маршрутом`);
  for (const [url, at] of Object.entries(sourceReviewedAt)) if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(at)) throw new Error(`sourceReviewedAt: неверное время ${at} для ${url}`);
  return routes;
}

const target = join(root, "worker", "route-sources.json");
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const body = `${JSON.stringify(collectRouteSources(), null, 1)}\n`;
  if (process.argv.includes("--check")) {
    if (readFileSync(target, "utf8") !== body) { console.error("worker/route-sources.json устарел: запустите node scripts/sources-extract.mjs"); process.exit(1); }
  } else {
    writeFileSync(target, body);
    const routes = JSON.parse(body);
    console.log(`маршрутов: ${routes.length}; страниц на маршрут: от ${Math.min(...routes.map((r) => r.sources.length))} до ${Math.max(...routes.map((r) => r.sources.length))}`);
  }
}
