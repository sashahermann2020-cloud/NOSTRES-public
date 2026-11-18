import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

// Все страницы сайта. Описания для выдачи и превью (description, Open Graph, Twitter) не длиннее 160 знаков на всех 9 языках:
// длиннее Google обрезает многоточием. JSON-LD (serverTr) в выдаче не показывается и не ограничен.
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const pages = readdirSync(new URL("../app/", import.meta.url), { recursive: true }).map(String).filter((p) => p.endsWith("page.tsx")).map((p) => `app/${p}`);
const texts = [...new Set(["app/layout.tsx", ...pages].flatMap((f) => [...read(f).matchAll(/\bdescription: "([^"]+)"/g)].map((m) => m[1])))];
const source = new Map(read("i18n/source.tsv").split("\n").filter((l) => l.split("\t").length >= 3).map((l) => { const [id, , ru] = l.split("\t"); return [ru, id]; }));

test("SEO descriptions fit 160 characters in all nine languages", () => {
  assert.ok(texts.length >= 50, `${texts.length}`);
  for (const ru of texts) {
    assert.ok(ru.length <= 160, `ru ${ru.length}: ${ru}`);
    const id = source.get(ru);
    assert.ok(id, `нет в i18n/source.tsv: ${ru}`);
    for (const lang of ["en", "de", "es", "it", "fr", "pt", "tr", "ar"]) {
      const line = read(`i18n/translations/${lang}.tsv`).split("\n").find((l) => l.startsWith(`${id}\t`));
      assert.ok(line, `${lang}: нет перевода ${id}`);
      const t = line.slice(id.length + 1);
      assert.ok(t.length <= 160, `${lang} ${t.length}: ${t}`);
    }
  }
});

test("route pages publish WebPage JSON-LD from their metadata", () => {
  const pages = readdirSync(new URL("../app/berlin/", import.meta.url), { recursive: true }).filter((p) => String(p).endsWith("page.tsx")).map((p) => `app/berlin/${p}`);
  const routes = pages.filter((p) => /return <>?<(GuidedRoute|AnmeldungJourney)\b/.test(read(p)));
  assert.ok(routes.length >= 50, `${routes.length}`);
  for (const p of routes) assert.match(read(p), /<RouteJsonLd meta=\{metadata\} \/>/, p);
});
