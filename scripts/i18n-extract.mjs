#!/usr/bin/env node
// Собирает все русские тексты интерфейса и маршрутов в i18n/source.tsv (хэш и русский текст).
// Запуск: node scripts/i18n-extract.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { planFor, questionsFor } from "../app/berlin/new-routes/route-plans.ts";
import { termExplanations } from "../app/term-explanations.ts";

const root = path.resolve(import.meta.dirname, "..");
const cyrillic = /[А-Яа-яЁё]/;
const found = new Map(); // русский текст -> откуда
const add = (text, origin) => { if (typeof text === "string" && cyrillic.test(text) && text.trim() && !found.has(text)) found.set(text, origin); };

// 1. Тексты, которые видит пользователь при проходе по всем ответам маршрутов.
const routeIds = ["lea", "housing", "doctor", "urgent", "business", "bank", "telecom", "dog", "wbs", "kindergeld", "jobcenter", "kita", "employment", "elterngeld", "kinderzuschlag", "steuererklaerung", "elternzeit", "wohngeld", "mutterschutz", "bildungspaket", "pflegegeld", "schwerbehinderung", "wohnungsgeber", "umzug", "arbeitslosengeld", "grundsicherungsgeld", "kfz", "einbuergerung", "workpermit", "recognition", "language", "reunion", "sprachkurs", "study", "petmove", "petpass", "vet", "dogtrainer", "transport", "culture", "relocation", "chancenkarte", "workvisa", "volunteer", "studyvisa", "company", "socialnumber", "settlement", "notary", "mental", "discrimination", "homeless", "hardship", "violence"];
const walkValue = (value, origin) => {
  if (typeof value === "string") add(value, origin);
  else if (Array.isArray(value)) value.forEach((item) => walkValue(item, origin));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => walkValue(item, origin));
};
for (const id of routeIds) {
  let plans = 0;
  (function walk(answers) {
    const questions = questionsFor(id, answers);
    walkValue(questions, `route:${id}`);
    const next = questions.find((question) => !answers[question.id]);
    if (!next) { if (plans++ < 100000) walkValue(planFor(id, answers), `route:${id}`); return; }
    next.options.forEach(([value]) => walk({ ...answers, [next.id]: value }));
  })({});
}

// 2. Пояснения к немецким терминам.
termExplanations.forEach(([, replacement]) => add(replacement, "glossary"));

// 3. Тексты интерфейса: tr("…") и русские строки в файлах без обхода ответов.
const uiFiles = [];
const skip = new Set(["node_modules", ".next", "dist"]);
(function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) uiFiles.push(full);
  }
})(path.join(root, "app"));
const trOnlyFiles = /(new-routes\/(?!GuidedRoute|route-model)|aufenthalt\/lea-plan|wohnungssuche\/housing-plan|term-explanations)/;
for (const file of uiFiles) {
  const rel = path.relative(root, file);
  const source = fs.readFileSync(file, "utf8");
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const onlyTr = trOnlyFiles.test(rel);
  (function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && /^(searchAliases|searchStopwords|MONTHS)$/.test(node.name.text)) return;
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "keywords") return;
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && /^trf?$/.test(node.expression.text)) {
      const arg = node.arguments[0];
      if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) add(arg.text, `ui:${rel}`);
    } else if (!onlyTr && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) add(node.text, `ui:${rel}`);
    else if (!onlyTr && ts.isJsxText(node)) add(node.text.replace(/\s*\n\s*/g, " ").trim(), `ui:${rel}`);
    ts.forEachChild(node, visit);
  })(tree);
}

const hash = (text) => crypto.createHash("sha1").update(text).digest("hex").slice(0, 8);
const escape = (text) => text.replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
const rows = [...found.keys()].filter((text) => !["ё", "е"].includes(text)).map((text) => ({ id: hash(text), text, origin: found.get(text) }));
const ids = new Map();
for (const row of rows) { if (ids.has(row.id) && ids.get(row.id) !== row.text) throw new Error(`Коллизия хэша ${row.id}`); ids.set(row.id, row.text); }
rows.sort((a, b) => a.origin.localeCompare(b.origin));
fs.mkdirSync(path.join(root, "i18n"), { recursive: true });
fs.writeFileSync(path.join(root, "i18n/source.tsv"), rows.map((row) => `${row.id}\t${row.origin}\t${escape(row.text)}`).join("\n") + "\n");
const byOrigin = {};
rows.forEach((row) => { const key = row.origin.split(":")[0]; byOrigin[key] = (byOrigin[key] ?? 0) + 1; });
console.log(`Русских текстов: ${rows.length}`, byOrigin);
