// Собирает все внешние ссылки приложения в worker/monitored-links.json: адреса, записанные в коде целиком,
// и адреса, которые маршруты показывают при ответах (в том числе собранные из частей, например `${ba}/...`).
// Режим --check только сверяет файл с кодом (используется тестом).
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { collectRouteSources } from "./sources-extract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipHosts = new Set(["nostres.world", "schema.org", "www.w3.org", "app.local", "example.com", "localhost"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

export function collectLinks() {
  const found = new Set();
  for (const file of walk(join(root, "app"))) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/https?:\/\/[^"'`)\s<>\\]+/g)) {
      const raw = match[0].replace(/[.,;]+$/, "");
      if (raw.includes("${")) continue;
      let url;
      try { url = new URL(raw); } catch { continue; }
      if (skipHosts.has(url.hostname) || url.hostname.endsWith(".localhost")) continue;
      found.add(url.toString());
    }
  }
  for (const route of collectRouteSources()) for (const url of route.sources) found.add(url);
  return [...found].sort();
}

const target = join(root, "worker", "monitored-links.json");
const body = `${JSON.stringify(collectLinks(), null, 1)}\n`;
if (process.argv.includes("--check")) {
  const same = readFileSync(target, "utf8") === body;
  if (!same) { console.error("worker/monitored-links.json устарел: запустите node scripts/links-extract.mjs"); process.exit(1); }
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(target, body);
  console.log(`ссылок: ${JSON.parse(body).length}`);
}
