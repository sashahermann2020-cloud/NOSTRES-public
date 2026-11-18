import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { LOCALES } from "../app/i18n/locales.ts";

const sw = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

test("service worker: valid script, network first for pages, private paths are not cached", () => {
  new vm.Script(sw);
  assert.match(sw, /const skip = \(url\) => url\.origin !== self\.location\.origin \|\| url\.pathname\.startsWith\("\/api\/"\) \|\| url\.pathname\.startsWith\("\/_monitor\/"\)/);
  assert.match(sw, /if \(request\.method !== "GET"\) return;/);
  // Сначала сеть: копия берётся только в catch, когда сеть недоступна.
  const pageFn = sw.slice(sw.indexOf("async function page("), sw.indexOf("async function file("));
  assert.ok(pageFn.indexOf("fetch(request)") < pageFn.indexOf("caches.match"), "network before cache");
  assert.match(pageFn, /x-nostres-saved/);
  assert.match(pageFn, /headers\.delete\("content-encoding"\)/);
});

test("service worker: offline page is translated into every site language", () => {
  const block = sw.slice(sw.indexOf("const TEXT = {"), sw.indexOf("};", sw.indexOf("const TEXT = {")));
  for (const { code } of LOCALES) assert.match(block, new RegExp(`\\n  ${code}: \\[`), code);
});

test("layout registers offline support and privacy policy describes saved copies", () => {
  assert.match(readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8"), /<OfflineSupport \/>/);
  assert.match(readFileSync(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"), /копии страниц NOSTRES/);
});
