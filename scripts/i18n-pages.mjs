#!/usr/bin/env node
// Готовит для каждой индексируемой страницы и языка маленький файл только с теми строками, которые нужны странице.
// Воркер на сервере читает его вместо полного словаря (иначе на холодном запуске разбирается около мегабайта JSON).
// Запуск после сборки: node scripts/i18n-pages.mjs [dist/client]
import fs from "node:fs";
import path from "node:path";
import { INDEXABLE_PATHS } from "../app/seo.ts";
import { READY_LOCALES, SOURCE_LOCALE, localizedPath, pageDictionaryName } from "../app/i18n/locales.ts";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.resolve(process.argv[2] ?? path.join(root, "dist/client"));
const publicDir = path.join(root, "public");

const { default: worker } = await import(new URL(`../dist/server/index.js?pages=${Date.now()}`, import.meta.url).href);
// Полные словари отдаём из public: отдельных файлов страниц на этом этапе ещё нет.
const env = {
  ASSETS: { fetch: async (request) => {
    const file = path.join(publicDir, new URL(request.url).pathname);
    if (!file.startsWith(publicDir) || !fs.existsSync(file) || file.includes("/pages/")) return new Response("Not found", { status: 404 });
    return new Response(fs.readFileSync(file), { headers: { "content-type": "application/json" } });
  } },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

// Метаданные (title, description, Open Graph, Twitter) переводит воркер через HTMLRewriter, которого нет в Node, поэтому их строки берём из русской страницы.
const decode = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
async function metaStrings(pagePath) {
  const html = await (await worker.fetch(new Request(`https://nostres.world${pagePath}`), env, ctx)).text();
  const values = [];
  const title = html.match(/<title>([^<]*)<\/title>/);
  if (title) values.push(decode(title[1]));
  for (const tag of html.match(/<meta [^>]*>/g) ?? []) {
    const key = tag.match(/(?:name|property)="([^"]*)"/)?.[1];
    const content = tag.match(/content="([^"]*)"/)?.[1];
    if (content && ["description", "og:title", "og:description", "og:image:alt", "twitter:title", "twitter:description", "twitter:image:alt"].includes(key)) values.push(decode(content));
  }
  return values;
}
const full = {};
const suffix = " | NOSTRES";

let files = 0;
let bytes = 0;
for (const item of READY_LOCALES) {
  if (item.code === SOURCE_LOCALE) continue;
  for (const pagePath of INDEXABLE_PATHS) {
    const response = await worker.fetch(new Request(`https://nostres.world${localizedPath(pagePath, item.code)}`), env, ctx);
    const html = await response.text();
    const match = html.match(/window\.__NOSTRES_I18N=(\{.*?\})<\/script>/s);
    if (response.status !== 200 || !match) throw new Error(`Не удалось получить строки для ${item.code} ${pagePath}: HTTP ${response.status}`);
    const dict = JSON.parse(match[1]).dict;
    full[item.code] ??= JSON.parse(fs.readFileSync(path.join(publicDir, "i18n", `${item.code}.json`), "utf8"));
    for (const value of await metaStrings(pagePath)) {
      if (full[item.code][value] !== undefined) dict[value] = full[item.code][value];
      else if (value.endsWith(suffix) && full[item.code][value.slice(0, -suffix.length)] !== undefined) dict[value.slice(0, -suffix.length)] = full[item.code][value.slice(0, -suffix.length)];
    }
    const target = path.join(outDir, "i18n/pages", item.code, `${pageDictionaryName(pagePath)}.json`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const text = JSON.stringify(dict);
    fs.writeFileSync(target, text);
    files += 1;
    bytes += text.length;
  }
}
console.log(`i18n-pages: ${files} файлов, ${(bytes / 1024 / 1024).toFixed(1)} МБ → ${path.relative(root, outDir)}/i18n/pages`);
