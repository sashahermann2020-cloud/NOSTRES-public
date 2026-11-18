#!/usr/bin/env node
// Печатает следующие непереведённые тексты для языка: node scripts/i18n-next.mjs <язык> [сколько] [origin-фильтр]
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const [code, countArg, filter] = process.argv.slice(2);
const count = Number(countArg ?? 80);
const done = new Set();
const file = path.join(root, `i18n/translations/${code}.tsv`);
if (fs.existsSync(file)) for (const line of fs.readFileSync(file, "utf8").split("\n")) { const id = line.split("\t")[0]; if (id) done.add(id); }
let left = 0, shown = 0;
for (const line of fs.readFileSync(path.join(root, "i18n/source.tsv"), "utf8").split("\n")) {
  if (!line) continue;
  const [id, origin, ...rest] = line.split("\t");
  if (done.has(id) || (filter && !origin.includes(filter))) continue;
  left += 1;
  if (shown < count) { console.log(`${id}\t${rest.join("\t")}`); shown += 1; }
}
console.error(`осталось по фильтру: ${left}`);
