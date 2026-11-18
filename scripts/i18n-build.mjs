#!/usr/bin/env node
// Собирает public/i18n/<язык>.json из i18n/source.tsv и i18n/translations/<язык>.tsv и печатает покрытие.
// Формат перевода: хэш <TAB> текст. Запуск: node scripts/i18n-build.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const unescape = (text) => text.replace(/\\(\\|t|n)/g, (_, c) => (c === "t" ? "\t" : c === "n" ? "\n" : "\\"));
const source = new Map();
const origins = new Map();
for (const line of fs.readFileSync(path.join(root, "i18n/source.tsv"), "utf8").split("\n")) {
  if (!line) continue;
  const [id, origin, ...rest] = line.split("\t");
  source.set(id, unescape(rest.join("\t")));
  origins.set(id, origin);
}
const dir = path.join(root, "i18n/translations");
fs.mkdirSync(path.join(root, "public/i18n"), { recursive: true });
const report = [];
for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".tsv"))) {
  const code = file.replace(/\.tsv$/, "");
  const dictionary = {};
  let stale = 0;
  for (const line of fs.readFileSync(path.join(dir, file), "utf8").split("\n")) {
    if (!line.trim()) continue;
    const [id, ...rest] = line.split("\t");
    const text = unescape(rest.join("\t"));
    if (!source.has(id)) { stale += 1; continue; }
    if (text.trim()) dictionary[source.get(id)] = text;
  }
  fs.writeFileSync(path.join(root, `public/i18n/${code}.json`), JSON.stringify(dictionary));
  const missing = [...source.keys()].filter((id) => !(source.get(id) in dictionary));
  const byOrigin = {};
  missing.forEach((id) => { const key = origins.get(id).split(":")[0]; byOrigin[key] = (byOrigin[key] ?? 0) + 1; });
  report.push({ язык: code, переведено: Object.keys(dictionary).length, всего: source.size, "не переведено": missing.length, устарело: stale, ...byOrigin });
}
console.table(report);
