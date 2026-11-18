#!/usr/bin/env node
// Собирает public/manifest/<язык>.webmanifest – описание NOSTRES для установки на телефон или компьютер.
// Один id для всех языков: браузер считает это одним приложением; start_url ведёт на главную выбранного языка.
// Описание берётся из уже переведённой строки (public/i18n/<язык>.json). Запуск: node scripts/manifest-build.mjs
import fs from "node:fs";
import path from "node:path";
import { READY_LOCALES, SOURCE_LOCALE, localizedPath } from "../app/i18n/locales.ts";

const root = path.resolve(import.meta.dirname, "..");
const DESCRIPTION = "Понятный путь после переезда · первый город Берлин";
const out = path.join(root, "public/manifest");
fs.mkdirSync(out, { recursive: true });

for (const { code, dir } of READY_LOCALES) {
  const dictionary = code === SOURCE_LOCALE ? {} : JSON.parse(fs.readFileSync(path.join(root, `public/i18n/${code}.json`), "utf8"));
  const description = dictionary[DESCRIPTION] ?? DESCRIPTION;
  if (code !== SOURCE_LOCALE && description === DESCRIPTION) throw new Error(`Нет перевода описания для ${code}`);
  const manifest = {
    id: "/",
    name: "NOSTRES",
    short_name: "NOSTRES",
    description,
    lang: code,
    dir,
    start_url: localizedPath("/", code),
    scope: "/",
    display: "standalone",
    background_color: "#f1f4f7",
    theme_color: "#f1f4f7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  fs.writeFileSync(path.join(out, `${code}.webmanifest`), `${JSON.stringify(manifest, null, 2)}\n`);
}
console.log(`Манифесты: ${READY_LOCALES.map((item) => item.code).join(", ")}`);
