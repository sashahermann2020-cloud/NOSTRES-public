#!/usr/bin/env node
// Пересобирает docs/VISUAL_REFERENCE.json из app/globals.css: каждое правило с номером строки,
// условием @media/@supports/@keyframes, селектором и декларациями в исходном порядке.
// Формат совпадает с исходным справочником (проверено на CSS, из которого он был создан).
// Запуск: node scripts/visual-reference-build.mjs        – записать справочник
//         node scripts/visual-reference-build.mjs --check – только проверить, что справочник актуален
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const source = "app/globals.css";
const referencePath = path.join(root, "docs/VISUAL_REFERENCE.json");

export function parseCss(css, file = source) {
  const rules = [];
  const stack = [];
  const lineOf = (position) => css.slice(0, position).split("\n").length;
  const blockAt = /^@(media|supports|keyframes|layer)\b/;
  let i = 0;
  while (i < css.length) {
    if (/\s/.test(css[i])) { i += 1; continue; }
    if (css.startsWith("/*", i)) { const end = css.indexOf("*/", i + 2); i = end < 0 ? css.length : end + 2; continue; }
    if (css[i] === "}") { stack.pop(); i += 1; continue; }
    let j = i;
    while (j < css.length && css[j] !== "{" && css[j] !== ";") j += 1;
    const prelude = css.slice(i, j).trim();
    if (css[j] === ";") { rules.push({ source: file, line: lineOf(i), context: [...stack], statement: `${prelude};` }); i = j + 1; continue; }
    if (blockAt.test(prelude)) { stack.push(prelude); i = j + 1; continue; }
    let k = j + 1;
    let depth = 1;
    while (k < css.length && depth) { if (css[k] === "{") depth += 1; else if (css[k] === "}") depth -= 1; k += 1; }
    rules.push({ source: file, line: lineOf(i), context: [...stack], selector: prelude, declarations: css.slice(j + 1, k - 1).trim() });
    i = k;
  }
  return rules;
}

const css = fs.readFileSync(path.join(root, source), "utf8");
const current = JSON.parse(fs.readFileSync(referencePath, "utf8"));
const blob = execFileSync("git", ["hash-object", path.join(root, source)], { encoding: "utf8" }).trim();
const rules = parseCss(css);

if (process.argv.includes("--check")) {
  const same = JSON.stringify(current.rules) === JSON.stringify(rules);
  console.log(same ? "VISUAL_REFERENCE.json актуален." : "VISUAL_REFERENCE.json устарел: запустите node scripts/visual-reference-build.mjs");
  process.exit(same ? 0 : 1);
}

const next = {
  ...current,
  generated_on: new Date().toISOString().slice(0, 10),
  files: [{ path: source, blob }],
  rules,
};
fs.writeFileSync(referencePath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`Правил: ${rules.length}; ${source} ${blob.slice(0, 12)}`);
