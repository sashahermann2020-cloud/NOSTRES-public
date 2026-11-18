#!/usr/bin/env node
// Список маршрутов, которые нужно заново сверить с официальными страницами (правила — worker/freshness.ts).
// Вход — выгрузка из D1 `nostres` в одном JSON-файле: { "links": [...], "events": [...] }, где
//   links  = SELECT url, state, last_status, last_checked, last_ok FROM link_monitor_links
//   events = SELECT url, kind, detail, created_at FROM link_monitor_events
//            WHERE kind IN ('content_changed','moved','broken','hijacked')
// Запуск: node scripts/freshness-report.mjs <выгрузка.json> [--json]
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { routeFreshness, REASON_LABELS } from "../worker/freshness.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2];
if (!file) { console.error("Укажите файл выгрузки из D1: node scripts/freshness-report.mjs dump.json"); process.exit(64); }
const dump = JSON.parse(readFileSync(file, "utf8"));
const routes = JSON.parse(readFileSync(join(root, "worker/route-sources.json"), "utf8"));
const now = Math.floor(Date.now() / 1000);
const report = routeFreshness(routes, dump.links ?? [], dump.events ?? [], now);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 1));
} else {
  const due = report.filter((route) => route.reasons.length);
  const day = (t) => new Date(t * 1000).toISOString().slice(0, 10);
  console.log(`# Актуальность маршрутов NOSTRES на ${day(now)}\n`);
  console.log(`Маршрутов: ${report.length}. Нужна сверка: ${due.length}.\n`);
  for (const route of due) {
    console.log(`## ${route.title} (${route.path})`);
    console.log(`Сверен ${route.checkedAt}, ${route.daysSinceCheck} дн. назад (срок ${route.reviewDays} дн.). Причины: ${route.reasons.map((reason) => REASON_LABELS[reason]).join("; ")}.`);
    for (const url of route.broken) console.log(`- не открывается: ${url}`);
    for (const change of route.changes) console.log(`- ${day(change.at)} ${change.kind}: ${change.url}`);
    if (route.unverifiable.length) console.log(`- робот не может проверить, сверить вручную: ${route.unverifiable.join(", ")}`);
    console.log("");
  }
}
