#!/usr/bin/env node
// Собирает переводы однотипных строк «Чтобы подать, не хватает: …» из готовых частей: node scripts/i18n-compose.mjs <язык>
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const code = process.argv[2];
const dict = JSON.parse(fs.readFileSync(path.join(root, `i18n/compose/${code}.json`), "utf8"));
const out = path.join(root, `i18n/translations/${code}.tsv`);
const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, "utf8").split("\n").map((l) => l.split("\t")[0]) : []);
const tail = " Остальные условия вы показали выполненными.";
const head = "Чтобы подать, не хватает: ";
let added = 0;
for (const line of fs.readFileSync(path.join(root, "i18n/source.tsv"), "utf8").split("\n")) {
  const [id, , text] = line.split("\t");
  if (!text || done.has(id) || !text.startsWith(head) || !text.endsWith(tail)) continue;
  const parts = text.slice(head.length, text.length - tail.length).replace(/\.$/, "").split("; ");
  if (!parts.every((p) => dict.parts[p])) { console.error("нет части:", parts.filter((p) => !dict.parts[p])); continue; }
  fs.appendFileSync(out, `${id}\t${dict.head}${parts.map((p) => dict.parts[p]).join("; ")}.${dict.tail}\n`);
  added += 1;
}
console.log("добавлено", added);
