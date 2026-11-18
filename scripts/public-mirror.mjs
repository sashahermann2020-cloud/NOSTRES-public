#!/usr/bin/env node
// Собирает публичное зеркало кода NOSTRES в каталоге публичного репозитория.
//
//   node scripts/public-mirror.mjs <каталог NOSTRES-public> [--check]
//
// Берёт только файлы под контролем git из списка include (scripts/public-mirror.json),
// проверяет их на секреты и запрещённые имена, удаляет в публичном каталоге всё,
// кроме .git и файлов publicOwned, и копирует разрешённые файлы. История приватного
// репозитория не переносится: в зеркало попадает только снимок файлов.
// С флагом --check ничего не копирует, только проверяет состав и секреты.
// Коммит и push выполняет вызывающая сторона (человек, агент или workflow).

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "scripts/public-mirror.json"), "utf8"));
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const target = args.find((a) => !a.startsWith("--"));

if (!checkOnly && !target) {
  console.error("Укажите каталог публичного репозитория: node scripts/public-mirror.mjs <каталог>");
  process.exit(2);
}

const matchesPrefix = (file, list) => list.some((p) => (p.endsWith("/") ? file.startsWith(p) : file === p));

const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
const files = tracked.filter((f) => matchesPrefix(f, config.include) && !matchesPrefix(f, config.exclude) && !matchesPrefix(f, config.publicOwned));

const nameRules = config.forbiddenNames.map((r) => new RegExp(r));
const contentRules = config.forbiddenContent.map((r) => new RegExp(r));
const problems = [];

for (const file of files) {
  if (nameRules.some((r) => r.test(file))) problems.push(`${file}: запрещённое имя файла`);
  const buf = readFileSync(join(root, file));
  if (buf.includes(0)) continue; // двоичный файл (шрифты, иконки): содержимое не сканируем
  const text = buf.toString("utf8");
  for (const rule of contentRules) {
    const m = text.match(rule);
    if (m) {
      const line = text.slice(0, m.index).split("\n").length;
      problems.push(`${file}:${line}: совпадение с правилом ${rule}`);
    }
  }
}

if (problems.length) {
  console.error("Зеркало остановлено, найдены возможные секреты или запрещённые файлы:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`Проверка пройдена: ${files.length} файлов из ${tracked.length} под контролем git, секретов не найдено.`);
if (checkOnly) process.exit(0);

const dest = resolve(target);
if (!existsSync(join(dest, ".git"))) {
  console.error(`${dest} не похож на git-репозиторий (нет .git). Остановлено.`);
  process.exit(2);
}
if (dest === root) {
  console.error("Каталог назначения совпадает с приватным репозиторием. Остановлено.");
  process.exit(2);
}

// Удаляем всё, кроме .git и publicOwned, чтобы удалённые в приватном репо файлы исчезали и в зеркале.
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(dest, abs).split("\\").join("/");
    if (rel === ".git") continue;
    if (config.publicOwned.includes(rel)) continue;
    if (statSync(abs).isDirectory()) {
      if (config.publicOwned.some((p) => p.startsWith(`${rel}/`))) {
        walk(abs);
        if (readdirSync(abs).length === 0) rmSync(abs, { recursive: true });
      } else {
        rmSync(abs, { recursive: true, force: true });
      }
    } else {
      rmSync(abs, { force: true });
    }
  }
};
walk(dest);

for (const file of files) {
  const to = join(dest, file);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(join(root, file), to);
}

const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
console.log(`Скопировано ${files.length} файлов в ${dest} (исходный коммит ${sha.slice(0, 12)}).`);
